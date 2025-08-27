"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  Send,
  MessageCircle,
  Heart,
  Phone,
  Minimize2,
  AlertTriangle,
  Wind,
  Ear,
  Sparkles,
  BookOpen,
  Loader2,
} from "lucide-react"
import { analyzeSentiment, generateBotResponse, detectCrisis, buildConversationContext } from "@/lib/bot-ai"
import type { User } from "@/lib/types"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "crisis" | "breathing" | "grounding" | "support" | "venting" | "affirmation" | "journaling"
}

interface ConsolyBotProps {
  currentUser: User | null
}

export function ConsolyBot({ currentUser }: ConsolyBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentExercise, setCurrentExercise] = useState<
    "breathing" | "grounding" | "affirmation" | "journaling" | null
  >(null)
  const [exerciseStep, setExerciseStep] = useState(0)
  const [userName, setUserName] = useState<string>("")
  const [isAIThinking, setIsAIThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Generate a friendly name for the session
      const friendlyNames = ["friend", "buddy", "pal", "dear"]
      const randomName = friendlyNames[Math.floor(Math.random() * friendlyNames.length)]
      setUserName(randomName)

      // Initial greeting
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Hey there! I'm ConsolyBot, and I'm really glad you're here. Think of me as a supportive friend who's always ready to listen. I'm powered by AI to better understand and respond to your feelings. There's no judgment here - just a safe space for you to share whatever's on your heart. How are you feeling today?`,
        sender: "bot",
        timestamp: new Date(),
        type: "support",
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen])

  const addMessage = (content: string, sender: "user" | "bot", type?: Message["type"]) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content,
      sender,
      timestamp: new Date(),
      type,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const simulateTyping = async (duration = 1500) => {
    setIsTyping(true)
    await new Promise((resolve) => setTimeout(resolve, duration))
    setIsTyping(false)
  }

  const handleBreathingExercise = async () => {
    setCurrentExercise("breathing")
    setExerciseStep(0)

    const breathingSteps = [
      "Let's take a moment together to focus on your breathing. This can really help when things feel overwhelming.",
      "Find a comfortable position and let your shoulders relax. You're doing great just by being here.",
      "Now, let's breathe together. Take a slow, gentle breath in through your nose... 1... 2... 3... 4...",
      "Perfect. Now hold that breath softly... 1... 2... 3... 4...",
      "And slowly let it out through your mouth... 1... 2... 3... 4... 5... 6... Let all that tension go.",
      "You're doing wonderfully. Let's do that once more. Breathe in slowly... 1... 2... 3... 4...",
      "Hold gently... 1... 2... 3... 4...",
      "And release... 1... 2... 3... 4... 5... 6... Feel your body relaxing.",
      "How does that feel? You can use this breathing technique anytime you need to find your center. I'm proud of you for taking this moment for yourself.",
    ]

    for (let i = 0; i < breathingSteps.length; i++) {
      await simulateTyping(2000)
      addMessage(breathingSteps[i], "bot", "breathing")
      setExerciseStep(i + 1)
      if (i < breathingSteps.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    }

    setCurrentExercise(null)
    setExerciseStep(0)
  }

  const handleGroundingExercise = async () => {
    setCurrentExercise("grounding")
    setExerciseStep(0)

    const groundingSteps = [
      "I'm going to guide you through a gentle grounding exercise. This helps bring you back to the present moment when your mind feels scattered.",
      "Let's start by looking around you. Can you name 5 things you can see? Take your time - maybe the color of a wall, an object on a table, or the way light falls in the room.",
      "Great job. Now, let's focus on touch. Can you name 4 things you can feel right now? Maybe the texture of your clothes, the temperature of the air, or the surface you're sitting on.",
      "You're doing so well. Next, let's listen. Can you identify 3 different sounds around you? Maybe it's distant traffic, the hum of electronics, or even your own breathing.",
      "Perfect. Now, take a gentle breath in. Can you notice 2 different scents? Don't worry if it's subtle - maybe it's the air freshener, your soap, or just the general smell of your space.",
      "Finally, can you notice 1 thing you can taste? Maybe it's from something you drank earlier, or just the neutral taste in your mouth.",
      "You did amazing! This exercise helps anchor you when your thoughts are racing. You're more grounded now than when we started. How are you feeling?",
    ]

    for (let i = 0; i < groundingSteps.length; i++) {
      await simulateTyping(1800)
      addMessage(groundingSteps[i], "bot", "grounding")
      setExerciseStep(i + 1)
      if (i < groundingSteps.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 4000))
      }
    }

    setCurrentExercise(null)
    setExerciseStep(0)
  }

  const handleAffirmationExercise = async () => {
    setCurrentExercise("affirmation")
    setExerciseStep(0)

    const affirmations = [
      "Let's take a moment for some gentle affirmations. Sometimes we need to remind ourselves of our worth.",
      "I want you to know: You are enough, exactly as you are right now.",
      "Your feelings are valid. There's no 'wrong' way to feel about what you're going through.",
      "You have survived every difficult day in your life so far. That shows incredible strength.",
      "You deserve kindness and compassion - especially from yourself.",
      "It's okay to not have all the answers right now. You're figuring things out, and that's perfectly human.",
      "You matter. Your presence in this world makes a difference, even when it doesn't feel that way.",
      "Take a deep breath and remember: This difficult moment will pass. You don't have to carry it forever.",
    ]

    for (let i = 0; i < affirmations.length; i++) {
      await simulateTyping(2000)
      addMessage(affirmations[i], "bot", "affirmation")
      setExerciseStep(i + 1)
      if (i < affirmations.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2500))
      }
    }

    setCurrentExercise(null)
    setExerciseStep(0)
  }

  const handleJournalingPrompt = async () => {
    setCurrentExercise("journaling")
    setExerciseStep(0)

    const journalingPrompts = [
      "Sometimes writing down our thoughts can help us process them. I'll give you some gentle prompts to think about.",
      "You don't have to share your answers with me - this is just for you to reflect on.",
      "First prompt: What's one small thing that brought you even a tiny bit of comfort today? It could be as simple as a warm drink or a moment of quiet.",
      "Second prompt: If you could tell your past self from a week ago one thing, what would it be?",
      "Third prompt: What's one thing you're grateful for right now, even if it's small?",
      "Final prompt: What would you say to a friend who was feeling exactly how you're feeling right now?",
      "These are just gentle questions to help you connect with your thoughts. There are no right or wrong answers - just your truth.",
    ]

    for (let i = 0; i < journalingPrompts.length; i++) {
      await simulateTyping(2000)
      addMessage(journalingPrompts[i], "bot", "journaling")
      setExerciseStep(i + 1)
      if (i < journalingPrompts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    }

    setCurrentExercise(null)
    setExerciseStep(0)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping || currentExercise || isAIThinking) return

    const userMessage = inputValue.trim()
    addMessage(userMessage, "user")
    setInputValue("")

    // Check for crisis indicators first
    const crisisDetected = detectCrisis(userMessage)
    if (crisisDetected) {
      await simulateTyping()
      addMessage(
        `${userName}, I'm really worried about what you've shared with me. What you're feeling right now must be incredibly painful, and I want you to know that I'm here with you in this moment.`,
        "bot",
        "crisis",
      )

      await simulateTyping(1500)
      addMessage(
        "These feelings you're having - they're so overwhelming right now, but they don't have to be permanent. You deserve support from people who are trained to help with exactly what you're going through.",
        "bot",
        "crisis",
      )

      await simulateTyping(1500)
      addMessage(
        "Please reach out to someone who can provide the immediate help you need: Call 988 (Suicide & Crisis Lifeline) or text HOME to 741741. These people understand, and they want to help you through this.",
        "bot",
        "crisis",
      )
      return
    }

    // Show AI thinking indicator
    setIsAIThinking(true)

    try {
      // Analyze sentiment and generate AI response
      const sentiment = analyzeSentiment(userMessage)
      const conversationContext = buildConversationContext(messages)
      const response = await generateBotResponse(userMessage, sentiment, userName, conversationContext)

      setIsAIThinking(false)
      await simulateTyping(800) // Shorter typing simulation since AI already took time

      addMessage(response.message, "bot", response.type)

      // Offer appropriate support tools
      if (response.type === "breathing" && !currentExercise) {
        await simulateTyping(1000)
        addMessage(
          "Would you like me to guide you through a gentle breathing exercise? It might help calm your mind and body.",
          "bot",
        )
      } else if (response.type === "grounding" && !currentExercise) {
        await simulateTyping(1000)
        addMessage(
          "I can walk you through a grounding exercise that might help you feel more centered. Would that be helpful?",
          "bot",
        )
      } else if (response.type === "support" && !currentExercise) {
        await simulateTyping(1000)
        addMessage(
          "I have a few things that might help - some positive affirmations, journaling prompts, or breathing exercises. What sounds most appealing to you right now?",
          "bot",
        )
      }
    } catch (error) {
      console.error("Error generating response:", error)
      setIsAIThinking(false)
      await simulateTyping()
      addMessage(
        `I'm sorry ${userName}, I'm having a bit of trouble right now, but I'm still here with you. Your feelings matter, and I want you to know that you're not alone.`,
        "bot",
        "support",
      )
    }
  }

  const handleQuickResponse = async (
    response: string,
    action?: "breathing" | "grounding" | "affirmation" | "journaling",
  ) => {
    addMessage(response, "user")

    if (action === "breathing") {
      await simulateTyping()
      addMessage("That sounds perfect. Let's take some calming breaths together.", "bot", "breathing")
      setTimeout(() => handleBreathingExercise(), 1000)
    } else if (action === "grounding") {
      await simulateTyping()
      addMessage("Great choice! Let's ground ourselves in the present moment.", "bot", "grounding")
      setTimeout(() => handleGroundingExercise(), 1000)
    } else if (action === "affirmation") {
      await simulateTyping()
      addMessage("I'd love to share some gentle reminders with you.", "bot", "affirmation")
      setTimeout(() => handleAffirmationExercise(), 1000)
    } else if (action === "journaling") {
      await simulateTyping()
      addMessage(
        "Journaling can be so helpful. Let me give you some gentle prompts to think about.",
        "bot",
        "journaling",
      )
      setTimeout(() => handleJournalingPrompt(), 1000)
    } else {
      await simulateTyping()
      addMessage(
        `Thank you for sharing that with me, ${userName}. I'm here to listen and support you however I can.`,
        "bot",
        "support",
      )
    }
  }

  const getMessageIcon = (type?: Message["type"]) => {
    switch (type) {
      case "crisis":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "breathing":
        return <Wind className="h-4 w-4 text-blue-500" />
      case "grounding":
        return <Heart className="h-4 w-4 text-green-500" />
      case "affirmation":
        return <Sparkles className="h-4 w-4 text-purple-500" />
      case "journaling":
        return <BookOpen className="h-4 w-4 text-orange-500" />
      case "venting":
        return <Ear className="h-4 w-4 text-pink-500" />
      default:
        return <Heart className="h-4 w-4 text-indigo-500" />
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-indigo-600 hover:bg-indigo-700 shadow-lg"
        >
          <Bot className="h-6 w-6" />
          <span className="sr-only">Open ConsolyBot</span>
        </Button>
        <div className="absolute -top-2 -left-2">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl border-2 border-indigo-200 dark:border-indigo-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Bot className="h-5 w-5 text-indigo-600" />
              <span>ConsolyBot</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <Badge variant="secondary" className="text-xs">
                AI-Powered
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Your AI-powered supportive friend • Always here to listen</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="h-80 overflow-y-auto space-y-3 pr-2">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : message.type === "crisis"
                        ? "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
                        : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {message.sender === "bot" && (
                    <div className="flex items-center space-x-2 mb-2">
                      {getMessageIcon(message.type)}
                      <span className="text-xs font-medium">ConsolyBot</span>
                    </div>
                  )}
                  <p
                    className={`text-sm ${
                      message.type === "crisis"
                        ? "text-red-800 dark:text-red-200"
                        : message.sender === "user"
                          ? "text-white"
                          : "text-foreground"
                    }`}
                  >
                    {message.content}
                  </p>
                  {message.type === "crisis" && (
                    <div className="mt-3 space-y-2">
                      <Button size="sm" asChild className="w-full bg-red-600 hover:bg-red-700">
                        <a href="tel:988" className="flex items-center justify-center space-x-2">
                          <Phone className="h-3 w-3" />
                          <span>Call 988 Now</span>
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" asChild className="w-full">
                        <a href="sms:741741?body=HOME" className="flex items-center justify-center space-x-2">
                          <MessageCircle className="h-3 w-3" />
                          <span>Text Crisis Line</span>
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {(isTyping || isAIThinking) && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-indigo-600" />
                    {isAIThinking ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs text-muted-foreground">AI is thinking...</span>
                      </div>
                    ) : (
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Response Buttons */}
          {!currentExercise && !isTyping && !isAIThinking && messages.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickResponse("Yes, breathing sounds helpful", "breathing")}
                className="text-xs"
              >
                <Wind className="h-3 w-3 mr-1" />
                Breathing
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickResponse("I'd like to try grounding", "grounding")}
                className="text-xs"
              >
                <Heart className="h-3 w-3 mr-1" />
                Grounding
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickResponse("I could use some affirmations", "affirmation")}
                className="text-xs"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Affirmations
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickResponse("Journaling prompts sound good", "journaling")}
                className="text-xs"
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Journaling
              </Button>
            </div>
          )}

          {/* Input */}
          {!currentExercise && (
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Share what's on your mind..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isTyping || isAIThinking}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping || isAIThinking} size="sm">
                {isAIThinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          )}

          {/* Exercise Progress */}
          {currentExercise && (
            <div className="text-center">
              <Badge variant="secondary" className="animate-pulse">
                {currentExercise === "breathing" && "Breathing Exercise in Progress"}
                {currentExercise === "grounding" && "Grounding Exercise in Progress"}
                {currentExercise === "affirmation" && "Sharing Affirmations"}
                {currentExercise === "journaling" && "Journaling Prompts"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
