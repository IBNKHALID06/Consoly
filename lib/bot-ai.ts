"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

export interface BotResponse {
  message: string
  type: "support" | "breathing" | "grounding" | "venting" | "crisis" | "affirmation" | "journaling"
}

export interface SentimentAnalysis {
  emotion: "sad" | "anxious" | "angry" | "hopeful" | "neutral" | "crisis" | "frustrated" | "lonely"
  intensity: "low" | "medium" | "high"
  keywords: string[]
}

// Crisis detection keywords and phrases
const CRISIS_INDICATORS = [
  "kill myself",
  "end my life",
  "want to die",
  "suicide",
  "suicidal",
  "not worth living",
  "better off dead",
  "end it all",
  "take my own life",
  "hurt myself",
  "cut myself",
  "harm myself",
  "self harm",
  "self-harm",
  "no point",
  "give up",
  "can't go on",
  "nothing left",
  "no hope left",
  "everyone would be better",
  "overdose",
]

const ANXIETY_KEYWORDS = [
  "anxious",
  "anxiety",
  "panic",
  "worried",
  "stress",
  "stressed",
  "overwhelmed",
  "nervous",
  "scared",
  "afraid",
  "fear",
  "terrified",
  "racing thoughts",
  "can't breathe",
  "heart racing",
  "shaking",
  "restless",
  "on edge",
]

const SADNESS_KEYWORDS = [
  "sad",
  "depressed",
  "down",
  "low",
  "empty",
  "lonely",
  "alone",
  "hopeless",
  "helpless",
  "worthless",
  "tired",
  "exhausted",
  "crying",
  "tears",
  "grief",
  "loss",
  "hurt",
  "pain",
  "broken",
  "numb",
]

const ANGER_KEYWORDS = [
  "angry",
  "mad",
  "furious",
  "rage",
  "frustrated",
  "irritated",
  "annoyed",
  "pissed",
  "hate",
  "betrayed",
  "unfair",
  "injustice",
  "fed up",
]

const LONELINESS_KEYWORDS = [
  "lonely",
  "alone",
  "isolated",
  "nobody cares",
  "no friends",
  "abandoned",
  "forgotten",
  "invisible",
  "disconnected",
  "left out",
]

const HOPE_KEYWORDS = [
  "better",
  "improving",
  "hope",
  "hopeful",
  "positive",
  "good",
  "happy",
  "grateful",
  "thankful",
  "progress",
  "healing",
  "recovery",
  "optimistic",
]

// Initialize Google GenAI with server-side environment variable only
const apiKey = process.env.GOOGLE_AI_API_KEY

if (!apiKey) {
  console.error("Google AI API key not found. Please set GOOGLE_AI_API_KEY in your environment variables.")
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export function detectCrisis(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return CRISIS_INDICATORS.some((indicator) => lowerMessage.includes(indicator))
}

export function analyzeSentiment(message: string): SentimentAnalysis {
  const lowerMessage = message.toLowerCase()

  if (detectCrisis(message)) {
    return {
      emotion: "crisis",
      intensity: "high",
      keywords: CRISIS_INDICATORS.filter((indicator) => lowerMessage.includes(indicator)),
    }
  }

  const anxietyMatches = ANXIETY_KEYWORDS.filter((keyword) => lowerMessage.includes(keyword))
  const sadnessMatches = SADNESS_KEYWORDS.filter((keyword) => lowerMessage.includes(keyword))
  const angerMatches = ANGER_KEYWORDS.filter((keyword) => lowerMessage.includes(keyword))
  const lonelinessMatches = LONELINESS_KEYWORDS.filter((keyword) => lowerMessage.includes(keyword))
  const hopeMatches = HOPE_KEYWORDS.filter((keyword) => lowerMessage.includes(keyword))

  const scores = {
    anxious: anxietyMatches.length,
    sad: sadnessMatches.length,
    angry: angerMatches.length,
    lonely: lonelinessMatches.length,
    hopeful: hopeMatches.length,
  }

  const maxScore = Math.max(...Object.values(scores))

  if (maxScore === 0) {
    return { emotion: "neutral", intensity: "low", keywords: [] }
  }

  const primaryEmotion = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as
    | "sad"
    | "anxious"
    | "angry"
    | "lonely"
    | "hopeful"

  let intensity: "low" | "medium" | "high" = "low"
  if (maxScore >= 3) intensity = "high"
  else if (maxScore >= 2) intensity = "medium"

  return {
    emotion: primaryEmotion || "neutral",
    intensity,
    keywords:
      primaryEmotion === "anxious"
        ? anxietyMatches
        : primaryEmotion === "sad"
          ? sadnessMatches
          : primaryEmotion === "angry"
            ? angerMatches
            : primaryEmotion === "lonely"
              ? lonelinessMatches
              : primaryEmotion === "hopeful"
                ? hopeMatches
                : [],
  }
}

// Enhanced Gemini AI Integration using Google GenAI SDK
async function callGeminiAI(prompt: string): Promise<string> {
  if (!genAI) {
    console.warn("Google AI not available, using fallback response")
    return "I'm here to listen and support you. Sometimes technology has hiccups, but my care for you is constant."
  }

  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 300,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    })

    // Generate content
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return text || "I'm here to listen and support you."
  } catch (error) {
    console.error("Error calling Gemini AI:", error)
    // Fallback to a supportive message if AI fails
    return "I'm here to listen and support you. Sometimes technology has hiccups, but my care for you is constant."
  }
}

export async function generateBotResponse(
  message: string,
  sentiment: SentimentAnalysis,
  userName = "friend",
  conversationHistory: string[] = [],
): Promise<BotResponse> {
  const { emotion, intensity } = sentiment

  // Handle crisis situations immediately without AI
  if (emotion === "crisis") {
    return {
      message: `${userName}, I'm deeply concerned about what you've shared with me. These feelings must be incredibly painful and overwhelming. Please know that you're not alone, and there are people who want to help you through this.`,
      type: "crisis",
    }
  }

  // Create context-aware prompt for Gemini
  const systemPrompt = `You are ConsolyBot, a compassionate mental health support chatbot powered by advanced AI. You are like a caring friend who listens without judgment. Your role is to:

1. Provide emotional support and validation
2. Offer gentle encouragement and hope
3. Suggest coping strategies when appropriate
4. Be empathetic and understanding
5. Use warm, friendly language
6. Keep responses concise (2-3 sentences max)
7. Never provide medical advice or diagnose
8. Address the user as "${userName}"

Current user emotion: ${emotion} (intensity: ${intensity})
User's message: "${message}"

${conversationHistory.length > 0 ? `Previous conversation context: ${conversationHistory.slice(-3).join(" | ")}` : ""}

Respond as a supportive friend would, acknowledging their feelings and offering comfort. Be genuine, caring, and emotionally intelligent. Focus on validation and gentle support.`

  try {
    const aiResponse = await callGeminiAI(systemPrompt)

    // Determine response type based on emotion and content
    let responseType: BotResponse["type"] = "support"

    if (emotion === "anxious" && intensity === "high") {
      responseType = "breathing"
    } else if (emotion === "anxious" && intensity === "medium") {
      responseType = "grounding"
    } else if (emotion === "angry") {
      responseType = "venting"
    } else if (emotion === "sad" && intensity === "high") {
      responseType = "affirmation"
    } else if (emotion === "neutral" || emotion === "hopeful") {
      responseType = "support"
    }

    return {
      message: aiResponse,
      type: responseType,
    }
  } catch (error) {
    console.error("Error generating AI response:", error)

    // Fallback responses if AI fails
    const fallbackResponses = {
      sad: `I can hear the sadness in your words, ${userName}. It's okay to feel this way, and you don't have to carry these feelings alone. I'm here with you.`,
      anxious: `${userName}, I can sense your anxiety, and that must feel really overwhelming right now. You're safe in this moment, and these feelings will pass.`,
      angry: `I can feel the frustration in what you've shared, ${userName}. Those feelings are completely valid, and it's okay to feel angry about things that aren't right.`,
      lonely: `${userName}, feeling lonely can be one of the most painful experiences. Even though you feel alone right now, please know that I'm here with you, and you matter.`,
      hopeful: `It's wonderful to hear some hope in your message, ${userName}! Even small moments of positivity are worth celebrating.`,
      neutral: `Thank you for sharing with me, ${userName}. I'm here to listen and support you in whatever way I can.`,
    }

    return {
      message: fallbackResponses[emotion] || fallbackResponses.neutral,
      type: "support",
    }
  }
}

// Enhanced conversation context management
export function buildConversationContext(messages: Array<{ content: string; sender: string }>): string[] {
  return messages
    .filter((msg) => msg.sender === "user")
    .slice(-5) // Keep last 5 user messages for context
    .map((msg) => msg.content)
}

// Test function to verify AI integration
export async function testGeminiIntegration(): Promise<{ success: boolean; message: string }> {
  if (!genAI) {
    return {
      success: false,
      message: "Google AI API key not configured",
    }
  }

  try {
    const testResponse = await callGeminiAI(
      "Respond with 'AI integration successful' if you can understand this message.",
    )
    return {
      success: true,
      message: testResponse,
    }
  } catch (error) {
    return {
      success: false,
      message: `Integration test failed: ${error}`,
    }
  }
}

// Additional supportive responses for different scenarios
export const SUPPORTIVE_RESPONSES = {
  encouragement: [
    "You are braver than you believe, stronger than you seem, and more loved than you know.",
    "It's okay to not be okay. Healing isn't linear, and you're doing the best you can.",
    "You've survived 100% of your difficult days so far. That's a pretty good track record.",
    "Your feelings are valid, your struggles are real, and you deserve support and compassion.",
  ],

  validation: [
    "I hear you, and what you're feeling makes complete sense given what you're going through.",
    "It's completely understandable that you would feel this way. Anyone in your situation would struggle.",
    "Your emotions are valid. There's no 'right' or 'wrong' way to feel about what you're experiencing.",
    "Thank you for trusting me with these feelings. It takes courage to be vulnerable.",
  ],

  hope: [
    "This pain you're feeling right now is temporary, even though it doesn't feel that way.",
    "You have the strength within you to get through this, even if you can't see it right now.",
    "Tomorrow is a new day with new possibilities. You don't have to figure everything out today.",
    "Healing takes time, and it's okay to take it one moment at a time.",
  ],
}
