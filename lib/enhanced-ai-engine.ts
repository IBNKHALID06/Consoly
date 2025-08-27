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
    conversationStage: "opening" | "developing" | "deepening" | "closing"
    responseVariety: number // Track response diversity
  }
}

export interface PersonalizedResponse {
  message: string
  type: "affirmation" | "validation" | "guidance" | "breathing" | "grounding" | "crisis" | "celebration" | "question"
  followUp?: string
  exercises?: string[]
  resources?: string[]
  tone: "gentle" | "encouraging" | "celebratory" | "urgent" | "calm" | "warm" | "reflective"
  conversationalStyle: "empathetic" | "supportive" | "curious" | "validating" | "guiding"
}

// Diverse greeting patterns and conversation starters
const GREETING_VARIATIONS = [
  "Hello there! I'm really glad you're here.",
  "Hi! It's wonderful to connect with you today.",
  "Welcome! I'm here and ready to listen.",
  "Good to see you! How can I support you right now?",
  "I'm so glad you decided to reach out today.",
  "Hello! I'm here to listen and support you.",
  "Hi there! What's on your mind today?",
  "Welcome to our conversation! I'm here for you.",
]

const FOLLOW_UP_VARIATIONS = {
  emotional_exploration: [
    "What does that feel like in your body right now?",
    "Can you tell me more about what's behind that feeling?",
    "What's the hardest part about this for you?",
    "How has this been affecting your daily life?",
    "What would help you feel even a little bit better right now?",
    "What's one thing you wish people understood about what you're going through?",
    "If you could change one thing about this situation, what would it be?",
    "What's been your biggest source of strength through this?",
  ],
  validation_deepening: [
    "That sounds incredibly challenging to navigate.",
    "It makes complete sense that you'd feel this way.",
    "Anyone in your situation would be struggling with this.",
    "You're handling so much right now.",
    "That takes real courage to share.",
    "Your feelings about this are completely understandable.",
    "It sounds like you're being really hard on yourself.",
    "You're doing the best you can with what you have right now.",
  ],
  curiosity_based: [
    "What's been the most surprising thing about this experience?",
    "How do you usually cope when things get overwhelming?",
    "What would you tell a close friend going through the same thing?",
    "What's one small thing that's brought you comfort recently?",
    "How do you think you've grown through this challenge?",
    "What's something you're grateful for, even in the midst of this?",
    "What does support look like for you right now?",
    "What's one thing you'd like to feel more of in your life?",
  ],
  forward_looking: [
    "What would a good day look like for you right now?",
    "What's one small step you could take today?",
    "How would you like to feel by the end of our conversation?",
    "What's something you're looking forward to, even if it's small?",
    "What would help you feel more like yourself again?",
    "What's one thing you can do today to be kind to yourself?",
    "How can I best support you in this moment?",
    "What would make tomorrow feel a little brighter?",
  ],
}

// Conversational response templates with variety
const RESPONSE_TEMPLATES = {
  empathetic_validation: [
    "I can really hear the {emotion} in what you're sharing.",
    "What you're describing sounds {intensity_word} difficult.",
    "It takes strength to reach out when you're feeling {emotion}.",
    "I'm honored that you're trusting me with these feelings.",
    "Your experience with {theme} sounds really challenging.",
    "I can sense how much this means to you.",
    "That sounds like such a heavy burden to carry.",
    "I'm really glad you're not keeping this to yourself.",
  ],
  supportive_encouragement: [
    "You're showing real courage by talking about this.",
    "I can see how thoughtful you are about {theme}.",
    "You're being so honest about your experience.",
    "It's clear you care deeply about {theme}.",
    "You're taking such an important step by reaching out.",
    "I admire your willingness to be vulnerable.",
    "You're handling this with such grace.",
    "Your self-awareness is really impressive.",
  ],
  gentle_guidance: [
    "Sometimes when we're feeling {emotion}, it can help to...",
    "Many people find that {suggestion} can be supportive.",
    "One thing that might bring some relief is...",
    "Have you ever tried {coping_strategy} when feeling this way?",
    "Something that often helps with {theme} is...",
    "You might find it helpful to consider...",
    "One approach that could be worth exploring is...",
    "It might be worth trying {suggestion} when you're ready.",
  ],
}

// Advanced AI Analysis Function with conversation tracking
export async function analyzeUserInput(
  message: string,
  conversationHistory: string[] = [],
  previousResponses: string[] = [],
  userProfile?: any,
): Promise<AIAnalysis> {
  if (!genAI) {
    console.warn("Google AI not available, using fallback analysis")
    return createFallbackAnalysis(message, conversationHistory.length, 5)
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800,
      },
    })

    // Determine conversation stage
    const conversationStage = getConversationStage(conversationHistory.length)
    const responseVariety = calculateResponseVariety(previousResponses)

    const analysisPrompt = `
You are an advanced AI emotional intelligence system for mental health support. Analyze the following user message with focus on creating diverse, natural responses.

User Message: "${message}"
Conversation Length: ${conversationHistory.length} messages
Previous Bot Responses: ${previousResponses.slice(-3).join(" | ")}
Response Variety Score: ${responseVariety}/10

${conversationHistory.length > 0 ? `Recent Context: ${conversationHistory.slice(-3).join(" | ")}` : ""}

Provide analysis in this exact JSON format:
{
  "sentiment": {
    "primary": "primary emotion (sad/anxious/angry/hopeful/neutral/frustrated/lonely/excited/grateful/overwhelmed/confused/hurt/disappointed/relieved)",
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
  "themes": ["relationship", "work", "family", "health", "future", "past", "self-worth", "identity", "loss", "change", "growth", "stress", "achievement"],
  "urgency": "low/medium/high/crisis",
  "personalityTraits": ["introspective", "optimistic", "analytical", "creative", "sensitive", "resilient", "thoughtful", "expressive"],
  "suggestedResponse": "affirmation/validation/guidance/breathing/grounding/crisis/celebration",
  "contextualFactors": {
    "stressLevel": 0-10,
    "supportNeeded": ["emotional", "practical", "spiritual", "social", "professional"],
    "conversationStage": "${conversationStage}",
    "responseVariety": ${responseVariety}
  }
}

Focus on emotional nuance, avoiding repetitive patterns, and what type of varied support would be most helpful.`

    const result = await model.generateContent(analysisPrompt)
    const response = await result.response
    const text = response.text()

    try {
      const analysis = JSON.parse(text.replace(/```json\n?|\n?```/g, ""))
      return analysis as AIAnalysis
    } catch (parseError) {
      console.error("Error parsing AI analysis:", parseError)
      return createFallbackAnalysis(message, conversationHistory.length, responseVariety)
    }
  } catch (error) {
    console.error("Error in AI analysis:", error)
    return createFallbackAnalysis(message, conversationHistory.length, 5)
  }
}

// Enhanced response generation with variety tracking
export async function generatePersonalizedResponse(
  message: string,
  analysis: AIAnalysis,
  userName = "friend",
  conversationHistory: string[] = [],
  previousResponses: string[] = [],
): Promise<PersonalizedResponse> {
  if (!genAI) {
    console.warn("Google AI not available, using fallback response")
    return createVariedFallbackResponse(message, analysis, userName, conversationHistory.length)
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.8, // Higher for more variety
        topK: 50,
        topP: 0.95,
        maxOutputTokens: 400,
      },
    })

    // Create variety constraints
    const avoidPhrases = extractCommonPhrases(previousResponses)
    const conversationalStyle = selectConversationalStyle(analysis, conversationHistory.length)

    const responsePrompt = `
You are ConsolyBot, an empathetic AI mental health companion. Generate a natural, varied response that avoids repetitive patterns.

User Message: "${message}"
User Name: ${userName}
Primary Emotion: ${analysis.sentiment.primary} (intensity: ${analysis.sentiment.intensity}/10)
Themes: ${analysis.themes.join(", ")}
Conversation Stage: ${analysis.contextualFactors.conversationStage}
Suggested Style: ${conversationalStyle}

AVOID these overused phrases from previous responses:
${avoidPhrases.join(", ")}

CONVERSATION GUIDELINES:
- Use varied greetings (not "Hey buddy" repeatedly)
- Avoid formulaic questions like "Since when have you been feeling like that?"
- Match the conversation stage (${analysis.contextualFactors.conversationStage})
- Be ${conversationalStyle} in your approach
- Use natural, flowing language
- Vary sentence structure and length
- Show genuine curiosity without being predictable

RESPONSE STYLE REQUIREMENTS:
- Opening stage: Warm welcome, establish connection
- Developing stage: Show understanding, explore feelings
- Deepening stage: Validate experience, offer insights
- Closing stage: Summarize support, encourage next steps

Create a response that feels fresh, natural, and specifically tailored to their ${analysis.sentiment.primary} emotion and ${analysis.themes.join("/")} themes.

Keep response 2-3 sentences maximum. Be conversational, not clinical.`

    const result = await model.generateContent(responsePrompt)
    const response = await result.response
    const aiMessage = response.text()

    // Generate varied follow-up
    const followUp = await generateVariedFollowUp(analysis, conversationHistory.length, previousResponses)
    const exercises = await suggestContextualExercises(analysis)

    return {
      message: aiMessage,
      type: analysis.suggestedResponse,
      followUp: followUp,
      exercises: exercises,
      tone: determineTone(analysis),
      conversationalStyle: conversationalStyle,
    }
  } catch (error) {
    console.error("Error generating personalized response:", error)
    return createVariedFallbackResponse(message, analysis, userName, conversationHistory.length)
  }
}

// Generate varied follow-up questions
async function generateVariedFollowUp(
  analysis: AIAnalysis,
  conversationLength: number,
  previousResponses: string[],
): Promise<string> {
  // Avoid repetitive follow-ups
  const usedQuestions = extractQuestions(previousResponses)

  let availableQuestions: string[] = []

  if (analysis.sentiment.intensity > 7) {
    availableQuestions = FOLLOW_UP_VARIATIONS.emotional_exploration
  } else if (analysis.contextualFactors.conversationStage === "deepening") {
    availableQuestions = FOLLOW_UP_VARIATIONS.validation_deepening
  } else if (conversationLength < 3) {
    availableQuestions = FOLLOW_UP_VARIATIONS.curiosity_based
  } else {
    availableQuestions = FOLLOW_UP_VARIATIONS.forward_looking
  }

  // Filter out recently used questions
  const freshQuestions = availableQuestions.filter(
    (q) =>
      !usedQuestions.some(
        (used) => q.toLowerCase().includes(used.toLowerCase()) || used.toLowerCase().includes(q.toLowerCase()),
      ),
  )

  if (freshQuestions.length === 0) {
    // If all questions have been used, pick from a different category
    const alternativeCategories = Object.values(FOLLOW_UP_VARIATIONS).filter(
      (category) => category !== availableQuestions,
    )
    const randomCategory = alternativeCategories[Math.floor(Math.random() * alternativeCategories.length)]
    return randomCategory[Math.floor(Math.random() * randomCategory.length)]
  }

  return freshQuestions[Math.floor(Math.random() * freshQuestions.length)]
}

// Helper functions for conversation variety
function getConversationStage(messageCount: number): "opening" | "developing" | "deepening" | "closing" {
  if (messageCount <= 2) return "opening"
  if (messageCount <= 6) return "developing"
  if (messageCount <= 12) return "deepening"
  return "closing"
}

function calculateResponseVariety(previousResponses: string[]): number {
  if (previousResponses.length < 2) return 10

  const uniqueWords = new Set()
  const totalWords = previousResponses.join(" ").split(" ").length

  previousResponses.forEach((response) => {
    response.split(" ").forEach((word) => {
      if (word.length > 3) uniqueWords.add(word.toLowerCase())
    })
  })

  return Math.min(10, Math.floor((uniqueWords.size / totalWords) * 100))
}

function extractCommonPhrases(responses: string[]): string[] {
  const phrases = []
  const commonPatterns = [
    /hey buddy/gi,
    /since when have you been feeling/gi,
    /how long have you been/gi,
    /that sounds really/gi,
    /i can hear that/gi,
    /it sounds like/gi,
  ]

  responses.forEach((response) => {
    commonPatterns.forEach((pattern) => {
      const matches = response.match(pattern)
      if (matches) phrases.push(...matches)
    })
  })

  return [...new Set(phrases)]
}

function extractQuestions(responses: string[]): string[] {
  const questions = []
  responses.forEach((response) => {
    const questionMatches = response.match(/[^.!]*\?/g)
    if (questionMatches) {
      questions.push(...questionMatches.map((q) => q.trim()))
    }
  })
  return questions
}

function selectConversationalStyle(
  analysis: AIAnalysis,
  conversationLength: number,
): "empathetic" | "supportive" | "curious" | "validating" | "guiding" {
  if (analysis.urgency === "high" || analysis.sentiment.intensity > 8) return "empathetic"
  if (analysis.sentiment.primary === "hopeful" || analysis.sentiment.primary === "grateful") return "supportive"
  if (conversationLength < 4) return "curious"
  if (analysis.suggestedResponse === "validation") return "validating"
  return "guiding"
}

function createFallbackAnalysis(message: string, conversationLength: number, responseVariety: number): AIAnalysis {
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
    sentiment: { primary, intensity, confidence: 0.6 },
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
      conversationStage: getConversationStage(conversationLength),
      responseVariety: responseVariety,
    },
  }
}

function createVariedFallbackResponse(
  message: string,
  analysis: AIAnalysis,
  userName: string,
  conversationLength: number,
): PersonalizedResponse {
  const greetingVariations = [
    `I can sense there's a lot on your mind, ${userName}.`,
    `Thank you for sharing that with me, ${userName}.`,
    `I'm really glad you felt comfortable opening up, ${userName}.`,
    `What you're describing sounds significant, ${userName}.`,
    `I appreciate you trusting me with these feelings, ${userName}.`,
  ]

  const responses = {
    sad: [
      `${greetingVariations[conversationLength % greetingVariations.length]} The pain you're experiencing sounds really deep.`,
      `I can feel the weight of what you're carrying, ${userName}. That takes real strength to share.`,
      `${userName}, what you're going through sounds incredibly difficult to navigate.`,
    ],
    anxious: [
      `${userName}, I can sense the worry in your words. That must feel overwhelming.`,
      `The anxiety you're describing sounds really intense, ${userName}. You're not alone in this.`,
      `I hear how much this is weighing on you, ${userName}. These feelings are so valid.`,
    ],
    hopeful: [
      `There's something really beautiful in what you've shared, ${userName}.`,
      `I can hear the strength and hope in your words, ${userName}.`,
      `${userName}, it's wonderful to hear this positive shift in your experience.`,
    ],
  }

  const responseArray = responses[analysis.sentiment.primary as keyof typeof responses] || [
    `${greetingVariations[conversationLength % greetingVariations.length]} I'm here to listen and support you.`,
  ]

  return {
    message: responseArray[conversationLength % responseArray.length],
    type: analysis.suggestedResponse,
    tone: determineTone(analysis),
    conversationalStyle: selectConversationalStyle(analysis, conversationLength),
  }
}

function determineTone(
  analysis: AIAnalysis,
): "gentle" | "encouraging" | "celebratory" | "urgent" | "calm" | "warm" | "reflective" {
  if (analysis.urgency === "crisis") return "urgent"
  if (analysis.sentiment.primary === "hopeful") return "celebratory"
  if (analysis.sentiment.intensity > 7) return "gentle"
  if (analysis.sentiment.primary === "anxious") return "calm"
  if (analysis.contextualFactors.conversationStage === "deepening") return "reflective"
  return "warm"
}

async function suggestContextualExercises(analysis: AIAnalysis): Promise<string[]> {
  const exercises = {
    high: ["Deep breathing", "Progressive muscle relaxation", "Grounding technique"],
    medium: ["Mindful breathing", "Gratitude practice", "Gentle movement"],
    low: ["Positive affirmations", "Journaling", "Mindful observation"],
  }

  return exercises[analysis.urgency] || exercises.medium
}

// Enhanced dynamic affirmations with variety
export async function generateDynamicAffirmations(
  analysis: AIAnalysis,
  userName = "friend",
  previousAffirmations: string[] = [],
): Promise<string[]> {
  if (!genAI) {
    console.warn("Google AI not available, using fallback affirmations")
    return getVariedDefaultAffirmations(analysis.sentiment.primary, previousAffirmations)
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.9, // High for maximum variety
        maxOutputTokens: 300,
      },
    })

    const affirmationPrompt = `
Create 3 fresh, personalized affirmations for someone experiencing:
- Primary emotion: ${analysis.sentiment.primary}
- Themes: ${analysis.themes.join(", ")}
- Stress level: ${analysis.contextualFactors.stressLevel}/10

AVOID these previously used affirmations:
${previousAffirmations.join(", ")}

Make them:
- Completely unique and fresh
- Specific to their ${analysis.themes.join("/")} situation
- Empowering and realistic
- Present tense and actionable
- Varied in structure and approach
- Suitable for someone named ${userName}

Format as a simple array: ["affirmation 1", "affirmation 2", "affirmation 3"]`

    const result = await model.generateContent(affirmationPrompt)
    const response = await result.response
    const text = response.text()

    try {
      const affirmations = JSON.parse(text)
      return Array.isArray(affirmations)
        ? affirmations
        : getVariedDefaultAffirmations(analysis.sentiment.primary, previousAffirmations)
    } catch {
      return getVariedDefaultAffirmations(analysis.sentiment.primary, previousAffirmations)
    }
  } catch (error) {
    console.error("Error generating affirmations:", error)
    return getVariedDefaultAffirmations(analysis.sentiment.primary, previousAffirmations)
  }
}

function getVariedDefaultAffirmations(emotion: string, previousAffirmations: string[]): string[] {
  const affirmationSets = {
    sad: [
      [
        "Your pain is temporary, but your strength is lasting",
        "You are worthy of comfort and peace",
        "This difficult chapter doesn't define your whole story",
      ],
      [
        "You have survived hard times before and you will again",
        "Your feelings deserve acknowledgment and care",
        "You are more resilient than you realize",
      ],
      [
        "Healing happens in its own time, and that's okay",
        "You deserve the same compassion you give others",
        "Your worth isn't determined by how you feel today",
      ],
    ],
    anxious: [
      [
        "You are safe in this present moment",
        "Your anxiety is a feeling, not a fact",
        "You have the tools to navigate uncertainty",
      ],
      [
        "This worry will pass like clouds across the sky",
        "You are stronger than your anxious thoughts",
        "Peace is possible, even in small moments",
      ],
      [
        "You can handle whatever comes your way",
        "Your breath is an anchor in stormy moments",
        "Courage isn't the absence of fear, it's moving forward anyway",
      ],
    ],
    hopeful: [
      [
        "Your optimism is a gift to yourself and others",
        "You are creating positive ripples in the world",
        "Your hope is well-founded and powerful",
      ],
      [
        "You have the vision to see possibilities others miss",
        "Your positive energy attracts good things",
        "You are building something beautiful with your life",
      ],
      [
        "Your faith in better days is already changing things",
        "You inspire hope in others just by being you",
        "Your dreams are valid and achievable",
      ],
    ],
  }

  const sets = affirmationSets[emotion as keyof typeof affirmationSets] || affirmationSets.sad

  // Find a set that hasn't been used recently
  for (const set of sets) {
    const hasOverlap = set.some((affirmation) =>
      previousAffirmations.some(
        (prev) =>
          prev.toLowerCase().includes(affirmation.toLowerCase()) ||
          affirmation.toLowerCase().includes(prev.toLowerCase()),
      ),
    )
    if (!hasOverlap) return set
  }

  // If all sets have been used, return the first one
  return sets[0]
}

// Export all functions for backward compatibility
export {
  analyzeUserInput as analyzeUserInputEnhanced,
  generatePersonalizedResponse as generatePersonalizedResponseEnhanced,
  generateDynamicAffirmations as generateDynamicAffirmationsEnhanced,
}
