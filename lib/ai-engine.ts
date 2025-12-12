"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Google GenAI with server-side environment variable only
const apiKey = process.env.GOOGLE_AI_API_KEY

if (!apiKey) {
  console.error("Google AI API key not found. Please set GOOGLE_AI_API_KEY in your environment variables.")
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export interface AIAnalysis {
  sentiment: {
    primary: string
    secondary?: string
    intensity: number // 0-10 scale
    confidence: number // 0-1 scale
  }
  emotions: {
    joy: number
    sadness: number
    anger: number
    fear: number
    surprise: number
    disgust: number
    anxiety: number
    hope: number
    loneliness: number
    gratitude: number
  }
  themes: string[]
  urgency: "low" | "medium" | "high" | "crisis"
  personalityTraits: string[]
  suggestedResponse: "affirmation" | "validation" | "guidance" | "breathing" | "grounding" | "crisis" | "celebration"
  contextualFactors: {
    timeOfDay?: string
    stressLevel: number
    supportNeeded: string[]
  }
}

export interface PersonalizedResponse {
  message: string
  type: "affirmation" | "validation" | "guidance" | "breathing" | "grounding" | "crisis" | "celebration" | "question"
  followUp?: string
  exercises?: string[]
  resources?: string[]
  tone: "gentle" | "encouraging" | "celebratory" | "urgent" | "calm"
}

// Advanced AI Analysis Function
export async function analyzeUserInput(
  message: string,
  conversationHistory: string[] = [],
  userProfile?: any,
): Promise<AIAnalysis> {
  if (!genAI) {
    console.warn("Google AI not available, using fallback analysis")
    return createFallbackAnalysis(message)
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.3, // Lower for more consistent analysis
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800,
      },
    })

    const analysisPrompt = `
You are an advanced AI emotional intelligence system for mental health support. Analyze the following user message and provide a detailed psychological assessment.

User Message: "${message}"

${conversationHistory.length > 0 ? `Conversation History: ${conversationHistory.slice(-3).join(" | ")}` : ""}

Provide analysis in this exact JSON format:
{
  "sentiment": {
    "primary": "primary emotion (sad/anxious/angry/hopeful/neutral/frustrated/lonely/excited/grateful/overwhelmed)",
    "secondary": "secondary emotion if present",
    "intensity": number from 0-10,
    "confidence": number from 0-1
  },
  "emotions": {
    "joy": 0-10,
    "sadness": 0-10,
    "anger": 0-10,
    "fear": 0-10,
    "surprise": 0-10,
    "disgust": 0-10,
    "anxiety": 0-10,
    "hope": 0-10,
    "loneliness": 0-10,
    "gratitude": 0-10
  },
  "themes": ["array of key themes like 'relationship', 'work', 'family', 'health', 'future', 'past', 'self-worth'"],
  "urgency": "low/medium/high/crisis",
  "personalityTraits": ["traits observed like 'introspective', 'optimistic', 'analytical', 'creative'"],
  "suggestedResponse": "affirmation/validation/guidance/breathing/grounding/crisis/celebration",
  "contextualFactors": {
    "stressLevel": 0-10,
    "supportNeeded": ["emotional", "practical", "spiritual", "social"]
  }
}

Focus on emotional nuance, context, and what type of support would be most helpful.`

    const result = await model.generateContent(analysisPrompt)
    const response = await result.response
    const text = response.text()

    try {
      // Parse the JSON response
      const analysis = JSON.parse(text.replace(/```json\n?|\n?```/g, ""))
      return analysis as AIAnalysis
    } catch (parseError) {
      console.error("Error parsing AI analysis:", parseError)
      // Fallback analysis
      return createFallbackAnalysis(message)
    }
  } catch (error) {
    console.error("Error in AI analysis:", error)
    return createFallbackAnalysis(message)
  }
}

// Generate Dynamic Personalized Response
export async function generatePersonalizedResponse(
  message: string,
  analysis: AIAnalysis,
  userName = "friend",
  conversationHistory: string[] = [],
): Promise<PersonalizedResponse> {
  if (!genAI) {
    console.warn("Google AI not available, using fallback response")
    return createFallbackResponse(message, analysis, userName)
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 400,
      },
    })

    const responsePrompt = `
You are ConsolyBot, an empathetic AI mental health companion. Generate a personalized response based on this analysis:

User Message: "${message}"
User Name: ${userName}
Primary Emotion: ${analysis.sentiment.primary} (intensity: ${analysis.sentiment.intensity}/10)
Themes: ${analysis.themes.join(", ")}
Urgency: ${analysis.urgency}
Suggested Response Type: ${analysis.suggestedResponse}
Support Needed: ${analysis.contextualFactors.supportNeeded.join(", ")}

${conversationHistory.length > 0 ? `Recent Context: ${conversationHistory.slice(-2).join(" | ")}` : ""}

Guidelines:
- Address them as "${userName}"
- Match the emotional intensity appropriately
- Be genuine, warm, and supportive
- Provide specific, actionable support
- Use their themes and context
- Keep response 2-3 sentences max
- Be conversational, not clinical

${analysis.suggestedResponse === "affirmation" ? "Focus on positive affirmations and self-worth" : ""}
${analysis.suggestedResponse === "validation" ? "Validate their feelings and normalize their experience" : ""}
${analysis.suggestedResponse === "guidance" ? "Offer gentle guidance and perspective" : ""}
${analysis.suggestedResponse === "celebration" ? "Celebrate their progress and positive moments" : ""}
${analysis.suggestedResponse === "crisis" ? "Express concern and direct to professional help" : ""}

Respond naturally and authentically.`

    const result = await model.generateContent(responsePrompt)
    const response = await result.response
    const aiMessage = response.text()

    // Generate follow-up suggestions
    const followUp = await generateFollowUp(analysis, userName)
    const exercises = await suggestExercises(analysis)

    return {
      message: aiMessage,
      type: analysis.suggestedResponse,
      followUp: followUp,
      exercises: exercises,
      tone: determineTone(analysis),
    }
  } catch (error) {
    console.error("Error generating personalized response:", error)
    return createFallbackResponse(message, analysis, userName)
  }
}

// Generate Dynamic Affirmations
export async function generateDynamicAffirmations(analysis: AIAnalysis, userName = "friend"): Promise<string[]> {
  if (!genAI) {
    console.warn("Google AI not available, using default affirmations")
    return getDefaultAffirmations(analysis.sentiment.primary)
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.8, // Higher for more creative affirmations
        maxOutputTokens: 300,
      },
    })

    const affirmationPrompt = `
Create 3 personalized affirmations for someone experiencing:
- Primary emotion: ${analysis.sentiment.primary}
- Themes: ${analysis.themes.join(", ")}
- Stress level: ${analysis.contextualFactors.stressLevel}/10

Make them:
- Personal and specific to their situation
- Empowering and hopeful
- Present tense and positive
- Addressing their specific themes
- Suitable for someone named ${userName}

Format as a simple array: ["affirmation 1", "affirmation 2", "affirmation 3"]`

    const result = await model.generateContent(affirmationPrompt)
    const response = await result.response
    const text = response.text()

    try {
      const affirmations = JSON.parse(text)
      return Array.isArray(affirmations) ? affirmations : getDefaultAffirmations(analysis.sentiment.primary)
    } catch {
      return getDefaultAffirmations(analysis.sentiment.primary)
    }
  } catch (error) {
    console.error("Error generating affirmations:", error)
    return getDefaultAffirmations(analysis.sentiment.primary)
  }
}

// Real-time Conversation Insights
export async function generateConversationInsights(
  conversationHistory: Array<{ content: string; sender: string; timestamp: Date }>,
): Promise<{
  patterns: string[]
  progress: string
  recommendations: string[]
  emotionalJourney: string
}> {
  if (!genAI) {
    console.warn("Google AI not available, using default insights")
    return {
      patterns: ["Seeking support and connection"],
      progress: "Taking positive steps by reaching out",
      recommendations: ["Continue expressing feelings", "Practice self-compassion"],
      emotionalJourney: "On a path of healing and self-discovery",
    }
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 500,
      },
    })

    const userMessages = conversationHistory
      .filter((msg) => msg.sender === "user")
      .slice(-10)
      .map((msg) => msg.content)
      .join(" | ")

    const insightPrompt = `
Analyze this conversation history and provide insights:

User Messages: ${userMessages}

Provide insights in JSON format:
{
  "patterns": ["emotional patterns observed"],
  "progress": "brief description of emotional progress",
  "recommendations": ["helpful suggestions"],
  "emotionalJourney": "summary of their emotional journey"
}`

    const result = await model.generateContent(insightPrompt)
    const response = await result.response
    const text = response.text()

    try {
      return JSON.parse(text.replace(/```json\n?|\n?```/g, ""))
    } catch {
      return {
        patterns: ["Seeking support and connection"],
        progress: "Taking positive steps by reaching out",
        recommendations: ["Continue expressing feelings", "Practice self-compassion"],
        emotionalJourney: "On a path of healing and self-discovery",
      }
    }
  } catch (error) {
    console.error("Error generating insights:", error)
    return {
      patterns: ["Seeking support"],
      progress: "Making progress",
      recommendations: ["Keep sharing"],
      emotionalJourney: "Growing stronger",
    }
  }
}

// Helper Functions
function createFallbackAnalysis(message: string): AIAnalysis {
  const lowerMessage = message.toLowerCase()

  let primary = "neutral"
  let intensity = 5

  if (lowerMessage.includes("sad") || lowerMessage.includes("depressed")) {
    primary = "sad"
    intensity = 7
  } else if (lowerMessage.includes("anxious") || lowerMessage.includes("worried")) {
    primary = "anxious"
    intensity = 6
  } else if (lowerMessage.includes("angry") || lowerMessage.includes("frustrated")) {
    primary = "angry"
    intensity = 6
  } else if (lowerMessage.includes("happy") || lowerMessage.includes("good")) {
    primary = "hopeful"
    intensity = 7
  }

  return {
    sentiment: {
      primary,
      intensity,
      confidence: 0.6,
    },
    emotions: {
      joy: primary === "hopeful" ? 7 : 3,
      sadness: primary === "sad" ? 7 : 2,
      anger: primary === "angry" ? 7 : 2,
      fear: primary === "anxious" ? 6 : 2,
      surprise: 2,
      disgust: 1,
      anxiety: primary === "anxious" ? 7 : 3,
      hope: primary === "hopeful" ? 8 : 4,
      loneliness: primary === "sad" ? 6 : 3,
      gratitude: primary === "hopeful" ? 6 : 3,
    },
    themes: ["general"],
    urgency: intensity > 7 ? "high" : "medium",
    personalityTraits: ["thoughtful"],
    suggestedResponse: primary === "sad" ? "validation" : "affirmation",
    contextualFactors: {
      stressLevel: intensity,
      supportNeeded: ["emotional"],
    },
  }
}

function createFallbackResponse(message: string, analysis: AIAnalysis, userName: string): PersonalizedResponse {
  const responses = {
    sad: `I can hear the pain in your words, ${userName}. What you're feeling is completely valid, and you don't have to carry it alone.`,
    anxious: `${userName}, I can sense your anxiety, and that must feel overwhelming. You're safe right now, and these feelings will pass.`,
    angry: `I understand your frustration, ${userName}. Those feelings are completely valid, and it's okay to feel angry about things that aren't right.`,
    hopeful: `It's wonderful to hear some positivity from you, ${userName}! Those moments of hope are precious and worth celebrating.`,
    neutral: `Thank you for sharing with me, ${userName}. I'm here to listen and support you in whatever way feels most helpful.`,
  }

  return {
    message: responses[analysis.sentiment.primary as keyof typeof responses] || responses.neutral,
    type: analysis.suggestedResponse,
    tone: determineTone(analysis),
  }
}

async function generateFollowUp(analysis: AIAnalysis, userName: string): Promise<string> {
  const followUps = {
    affirmation: `Would you like me to share some personalized affirmations with you, ${userName}?`,
    validation: `How long have you been feeling this way? Sometimes it helps to talk about the timeline.`,
    guidance: `What feels like the most challenging part of this situation right now?`,
    breathing: `Would a guided breathing exercise help you feel more centered?`,
    grounding: `Let's try a grounding technique to help you feel more present. Are you interested?`,
    celebration: `What other positive things have been happening in your life lately?`,
  }

  return followUps[analysis.suggestedResponse] || `What would feel most helpful for you right now, ${userName}?`
}

async function suggestExercises(analysis: AIAnalysis): Promise<string[]> {
  const exercises = {
    high: ["Deep breathing", "Progressive muscle relaxation", "Grounding technique"],
    medium: ["Mindful breathing", "Gratitude practice", "Gentle movement"],
    low: ["Positive affirmations", "Journaling", "Mindful observation"],
  }

  return exercises[analysis.urgency] || exercises.medium
}

function determineTone(analysis: AIAnalysis): "gentle" | "encouraging" | "celebratory" | "urgent" | "calm" {
  if (analysis.urgency === "crisis") return "urgent"
  if (analysis.sentiment.primary === "hopeful") return "celebratory"
  if (analysis.sentiment.intensity > 7) return "gentle"
  if (analysis.sentiment.primary === "anxious") return "calm"
  return "encouraging"
}

function getDefaultAffirmations(emotion: string): string[] {
  const affirmations = {
    sad: [
      "Your feelings are valid and temporary",
      "You have the strength to get through this",
      "You are worthy of love and compassion",
    ],
    anxious: ["You are safe in this moment", "You have overcome challenges before", "Your anxiety does not define you"],
    angry: [
      "Your feelings are valid and understandable",
      "You have the power to choose your response",
      "This anger will pass, and peace will return",
    ],
    hopeful: ["Your positive energy is powerful", "You are creating positive change", "Your hope inspires others"],
  }

  return affirmations[emotion as keyof typeof affirmations] || affirmations.sad
}
