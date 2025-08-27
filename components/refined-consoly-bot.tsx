"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bot,
  Send,
  MessageCircle,
  Heart,
  Phone,
  Minimize2,
  AlertTriangle,
  Wind,
  Sparkles,
  BookOpen,
  Brain,
  TrendingUp,
  Lightbulb,
  Target,
  Zap,
  BarChart3,
  Shuffle,
} from "lucide-react"
import {
  analyzeUserInputEnhanced,
  generatePersonalizedResponseEnhanced,
  generateDynamicAffirmationsEnhanced,
  type AIAnalysis,
} from "@/lib/enhanced-ai-engine"
import type { User } from "@/lib/types"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "affirmation" | "validation" | "guidance" | "breathing" | "grounding" | "crisis" | "celebration" | "question"
  analysis?: AIAnalysis
  tone?: "gentle" | "encouraging" | "celebratory" | "urgent" | "calm" | "warm" | "reflective"
  conversationalStyle?: "empathetic" | "supportive" | "curious" | "validating" | "guiding"
}

interface ConsolyBotProps {
  currentUser: User | null
}

export function RefinedConsolyBot({ currentUser }: ConsolyBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null)
  const [activeTab, setActiveTab] = useState("chat")
  const [userName, setUserName] = useState<string>("")
  const [emotionalState, setEmotionalState] = useState({
    primary: "neutral",
    intensity: 5,
    trend: "stable",
  })
  const [conversationMetrics, setConversationMetrics] = useState({
    responseVariety: 10,
    conversationDepth: 0,
    emotionalProgress: 0,
  })
  const [previousResponses, setPreviousResponses] = useState<string[]>([])
  const [previousAffirmations, setPreviousAffirmations] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Generate varied greeting
      const greetingVariations = [
        "Hello! I'm ConsolyBot, and I'm really glad you're here.",
        "Hi there! I'm ConsolyBot, your AI companion for emotional support.",
        "Welcome! I'm ConsolyBot, and I'm here to listen and understand.",
        "Good to meet you! I'm ConsolyBot, ready to support you however I can.",
        "Hello! I'm ConsolyBot, and this is a safe space for you to share.",
      ]

      const nameVariations = ["friend", "there", ""]
      const selectedName = nameVariations[Math.floor(Math.random() * nameVariations.length)]
      setUserName(selectedName || "friend")

      const randomGreeting = greetingVariations[Math.floor(Math.random() * greetingVariations.length)]

      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `${randomGreeting} I use advanced AI to understand your feelings and provide personalized support. What's on your mind today?`,
        sender: "bot",
        timestamp: new Date(),
        type: "question",
        tone: "warm",
        conversationalStyle: "curious",
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen])

  const addMessage = (
    content: string,
    sender: "user" | "bot",
    analysis?: AIAnalysis,
    type?: Message["type"],
    tone?: Message["tone"],
    conversationalStyle?: Message["conversationalStyle"],
  ) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content,
      sender,
      timestamp: new Date(),
      analysis,
      type,
      tone,
      conversationalStyle,
    }
    setMessages((prev) => [...prev, newMessage])

    // Track bot responses for variety analysis
    if (sender === "bot") {
      setPreviousResponses((prev) => [...prev.slice(-10), content]) // Keep last 10 responses
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isAnalyzing || isTyping) return

    const userMessage = inputValue.trim()
    addMessage(userMessage, "user")
    setInputValue("")

    // Start AI analysis
    setIsAnalyzing(true)

    try {
      // Get conversation history for context
      const conversationHistory = messages
        .filter((msg) => msg.sender === "user")
        .slice(-5)
        .map((msg) => msg.content)

      // Enhanced analysis with variety tracking
      const analysis = await analyzeUserInputEnhanced(userMessage, conversationHistory, previousResponses)
      setCurrentAnalysis(analysis)

      // Update conversation metrics
      setConversationMetrics((prev) => ({
        responseVariety: analysis.contextualFactors.responseVariety || prev.responseVariety,
        conversationDepth: Math.min(10, prev.conversationDepth + 1),
        emotionalProgress: calculateEmotionalProgress(analysis, emotionalState),
      }))

      // Update emotional state tracking
      setEmotionalState((prev) => ({
        primary: analysis.sentiment.primary,
        intensity: analysis.sentiment.intensity,
        trend:
          analysis.sentiment.intensity > prev.intensity
            ? "improving"
            : analysis.sentiment.intensity < prev.intensity
              ? "declining"
              : "stable",
      }))

      setIsAnalyzing(false)
      setIsTyping(true)

      // Handle crisis situations immediately
      if (analysis.urgency === "crisis") {
        setTimeout(() => {
          setIsTyping(false)
          addMessage(
            `I'm deeply concerned about what you've shared. These feelings must be incredibly overwhelming, and I want you to know that you're not alone in this moment.`,
            "bot",
            analysis,
            "crisis",
            "urgent",
            "empathetic",
          )

          setTimeout(() => {
            addMessage(
              "Please reach out for immediate support: Call 988 (Suicide & Crisis Lifeline) or text HOME to 741741. You deserve help and support.",
              "bot",
              undefined,
              "crisis",
              "urgent",
              "empathetic",
            )
          }, 1500)
        }, 1000)
        return
      }

      // Generate varied, personalized AI response
      const personalizedResponse = await generatePersonalizedResponseEnhanced(
        userMessage,
        analysis,
        userName,
        conversationHistory,
        previousResponses,
      )

      setTimeout(() => {
        setIsTyping(false)
        addMessage(
          personalizedResponse.message,
          "bot",
          analysis,
          personalizedResponse.type,
          personalizedResponse.tone,
          personalizedResponse.conversationalStyle,
        )

        // Add varied follow-up if available
        if (personalizedResponse.followUp) {
          setTimeout(() => {
            addMessage(personalizedResponse.followUp!, "bot", undefined, "question", "encouraging", "curious")
          }, 2000)
        }
      }, 1500)
    } catch (error) {
      console.error("Error processing message:", error)
      setIsAnalyzing(false)
      setIsTyping(false)

      // Varied error responses
      const errorResponses = [
        "I'm having a technical moment, but I'm still here with you. Your feelings matter.",
        "Something's not quite working on my end, but I want you to know I'm listening.",
        "I'm experiencing a brief hiccup, but please know that you're not alone.",
        "Technical difficulties aside, I'm here and I care about what you're going through.",
      ]

      const randomError = errorResponses[Math.floor(Math.random() * errorResponses.length)]
      addMessage(randomError, "bot", undefined, "validation", "gentle", "supportive")
    }
  }

  const handleGenerateAffirmations = async () => {
    if (!currentAnalysis) return

    setIsTyping(true)
    try {
      const affirmations = await generateDynamicAffirmationsEnhanced(currentAnalysis, userName, previousAffirmations)

      // Track affirmations to avoid repetition
      setPreviousAffirmations((prev) => [...prev, ...affirmations])

      setTimeout(() => {
        setIsTyping(false)

        const introVariations = [
          `Here are some personalized affirmations for you:`,
          `I've created these affirmations specifically for your situation:`,
          `These affirmations are tailored to what you're experiencing:`,
          `Let me share some empowering thoughts with you:`,
          `Here are some truths I want you to remember:`,
        ]

        const randomIntro = introVariations[Math.floor(Math.random() * introVariations.length)]
        addMessage(randomIntro, "bot", undefined, "affirmation", "encouraging", "supportive")

        affirmations.forEach((affirmation, index) => {
          setTimeout(
            () => {
              addMessage(`✨ ${affirmation}`, "bot", undefined, "affirmation", "encouraging", "supportive")
            },
            (index + 1) * 1000,
          )
        })
      }, 1000)
    } catch (error) {
      setIsTyping(false)
      addMessage(
        "I'm having trouble generating affirmations right now, but remember: you are worthy, you are strong, and you matter.",
        "bot",
        undefined,
        "affirmation",
        "encouraging",
        "supportive",
      )
    }
  }

  const calculateEmotionalProgress = (analysis: AIAnalysis, currentState: any): number => {
    // Simple progress calculation based on emotional intensity trends
    if (analysis.sentiment.primary === "hopeful" || analysis.sentiment.primary === "grateful") {
      return Math.min(10, currentState.intensity + 1)
    }
    if (analysis.sentiment.intensity < currentState.intensity) {
      return Math.max(0, currentState.intensity - 0.5)
    }
    return currentState.intensity
  }

  const getEmotionColor = (emotion: string) => {
    const colors = {
      sad: "text-blue-600",
      anxious: "text-yellow-600",
      angry: "text-red-600",
      hopeful: "text-green-600",
      neutral: "text-gray-600",
      excited: "text-purple-600",
      grateful: "text-emerald-600",
      lonely: "text-indigo-600",
      frustrated: "text-orange-600",
      overwhelmed: "text-pink-600",
      confused: "text-cyan-600",
      hurt: "text-rose-600",
      disappointed: "text-amber-600",
      relieved: "text-lime-600",
    }
    return colors[emotion as keyof typeof colors] || "text-gray-600"
  }

  const getMessageIcon = (type?: Message["type"]) => {
    switch (type) {
      case "crisis":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "breathing":
        return <Wind className="h-4 w-4 text-blue-500" />
      case "grounding":
        return <Target className="h-4 w-4 text-green-500" />
      case "affirmation":
        return <Sparkles className="h-4 w-4 text-purple-500" />
      case "validation":
        return <Heart className="h-4 w-4 text-pink-500" />
      case "guidance":
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case "celebration":
        return <Zap className="h-4 w-4 text-green-500" />
      case "question":
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Heart className="h-4 w-4 text-indigo-500" />
    }
  }

  const getConversationalStyleBadge = (style?: Message["conversationalStyle"]) => {
    const styles = {
      empathetic: { color: "bg-pink-100 text-pink-800", icon: "💝" },
      supportive: { color: "bg-green-100 text-green-800", icon: "🤗" },
      curious: { color: "bg-blue-100 text-blue-800", icon: "🤔" },
      validating: { color: "bg-purple-100 text-purple-800", icon: "✅" },
      guiding: { color: "bg-yellow-100 text-yellow-800", icon: "🧭" },
    }

    if (!style) return null

    const styleInfo = styles[style]
    return (
      <Badge className={`text-xs ${styleInfo.color}`}>
        {styleInfo.icon} {style}
      </Badge>
    )
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
        >
          <Bot className="h-7 w-7" />
          <span className="sr-only">Open ConsolyBot</span>
        </Button>
        <div className="absolute -top-1 -right-1">
          <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
            <Shuffle className="h-3 w-3 text-white" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[420px] max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Bot className="h-5 w-5 text-indigo-600" />
              <span>ConsolyBot</span>
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-indigo-100 to-purple-100">
                Refined AI
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Enhanced Emotional State Indicator */}
          {currentAnalysis && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Current mood:</span>
                <Badge className={`${getEmotionColor(emotionalState.primary)} bg-transparent border`}>
                  {emotionalState.primary}
                </Badge>
                <Progress value={emotionalState.intensity * 10} className="w-16 h-2" />
                <span className="text-xs text-muted-foreground">
                  {emotionalState.trend === "improving" ? "↗️" : emotionalState.trend === "declining" ? "↘️" : "→"}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-muted-foreground">Conversation:</span>
                <Badge variant="outline" className="text-xs">
                  Variety: {conversationMetrics.responseVariety}/10
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Depth: {conversationMetrics.conversationDepth}/10
                </Badge>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="text-xs">
                Chat
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-xs">
                Insights
              </TabsTrigger>
              <TabsTrigger value="tools" className="text-xs">
                Tools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              {/* Messages */}
              <div className="h-80 overflow-y-auto space-y-3 pr-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                          : message.type === "crisis"
                            ? "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
                            : message.type === "affirmation"
                              ? "bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800"
                              : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      {message.sender === "bot" && (
                        <div className="flex items-center space-x-2 mb-2 flex-wrap">
                          {getMessageIcon(message.type)}
                          <span className="text-xs font-medium">ConsolyBot</span>
                          {getConversationalStyleBadge(message.conversationalStyle)}
                          {message.analysis && (
                            <Badge variant="outline" className="text-xs">
                              {message.analysis.sentiment.confidence > 0.8 ? "High confidence" : "Analyzing..."}
                            </Badge>
                          )}
                        </div>
                      )}
                      <p
                        className={`text-sm ${
                          message.type === "crisis"
                            ? "text-red-800 dark:text-red-200"
                            : message.type === "affirmation"
                              ? "text-purple-800 dark:text-purple-200"
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

                {(isAnalyzing || isTyping) && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4 text-indigo-600" />
                        {isAnalyzing ? (
                          <div className="flex items-center space-x-2">
                            <Brain className="h-3 w-3 animate-pulse text-purple-600" />
                            <span className="text-xs text-muted-foreground">Understanding your message...</span>
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

              {/* Input */}
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Share what's on your mind..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isAnalyzing || isTyping}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isAnalyzing || isTyping} size="sm">
                  {isAnalyzing ? <Brain className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="h-80 overflow-y-auto space-y-4">
                {currentAnalysis && (
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Current Analysis
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Primary Emotion:</span>
                        <Badge className={`ml-2 ${getEmotionColor(currentAnalysis.sentiment.primary)}`}>
                          {currentAnalysis.sentiment.primary}
                        </Badge>
                        {currentAnalysis.sentiment.secondary && (
                          <Badge className={`ml-1 ${getEmotionColor(currentAnalysis.sentiment.secondary)} opacity-70`}>
                            {currentAnalysis.sentiment.secondary}
                          </Badge>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium">Intensity:</span>
                        <Progress value={currentAnalysis.sentiment.intensity * 10} className="mt-1" />
                        <span className="text-xs text-muted-foreground">{currentAnalysis.sentiment.intensity}/10</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Conversation Stage:</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {currentAnalysis.contextualFactors.conversationStage}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Themes:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentAnalysis.themes.map((theme, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Response Variety:</span>
                        <Progress value={conversationMetrics.responseVariety * 10} className="mt-1" />
                        <span className="text-xs text-muted-foreground">
                          {conversationMetrics.responseVariety}/10 (Higher = More Varied)
                        </span>
                      </div>
                    </div>
                  </Card>
                )}

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Conversation Quality
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Response Diversity:</span>
                      <Badge variant={conversationMetrics.responseVariety > 7 ? "default" : "secondary"}>
                        {conversationMetrics.responseVariety > 7
                          ? "Excellent"
                          : conversationMetrics.responseVariety > 5
                            ? "Good"
                            : "Improving"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversation Depth:</span>
                      <Badge variant={conversationMetrics.conversationDepth > 5 ? "default" : "secondary"}>
                        {conversationMetrics.conversationDepth > 5 ? "Deep" : "Developing"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Emotional Trend:</span>
                      <Badge variant={emotionalState.trend === "improving" ? "default" : "secondary"}>
                        {emotionalState.trend === "improving"
                          ? "↗️ Improving"
                          : emotionalState.trend === "declining"
                            ? "↘️ Needs Support"
                            : "→ Stable"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="space-y-4">
              <div className="h-80 overflow-y-auto space-y-3">
                <Button
                  onClick={handleGenerateAffirmations}
                  disabled={!currentAnalysis || isTyping}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Fresh Affirmations
                </Button>

                <Button
                  onClick={() => {
                    const breathingPrompts = [
                      "I'd like to try a breathing exercise",
                      "Can you guide me through some breathing?",
                      "I need help with my breathing",
                      "Could we do some breathing work together?",
                    ]
                    const randomPrompt = breathingPrompts[Math.floor(Math.random() * breathingPrompts.length)]
                    setInputValue(randomPrompt)
                  }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Wind className="h-4 w-4 mr-2" />
                  Guided Breathing Exercise
                </Button>

                <Button
                  onClick={() => {
                    const groundingPrompts = [
                      "Can you help me feel more grounded?",
                      "I need a grounding technique",
                      "Help me connect with the present moment",
                      "I'd like to try grounding exercises",
                    ]
                    const randomPrompt = groundingPrompts[Math.floor(Math.random() * groundingPrompts.length)]
                    setInputValue(randomPrompt)
                  }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Grounding Technique
                </Button>

                <Button
                  onClick={() => {
                    const guidancePrompts = [
                      "I could use some guidance",
                      "What would you suggest I do?",
                      "I'm not sure what to do next",
                      "Can you help me think through this?",
                    ]
                    const randomPrompt = guidancePrompts[Math.floor(Math.random() * guidancePrompts.length)]
                    setInputValue(randomPrompt)
                  }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Ask for Guidance
                </Button>

                <Button
                  onClick={() => {
                    const journalingPrompts = [
                      "Can you give me some journaling prompts?",
                      "I'd like to explore my thoughts through writing",
                      "What should I reflect on today?",
                      "Help me process this through journaling",
                    ]
                    const randomPrompt = journalingPrompts[Math.floor(Math.random() * journalingPrompts.length)]
                    setInputValue(randomPrompt)
                  }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Journaling Prompts
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
