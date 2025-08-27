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
} from "lucide-react"
import {
  analyzeUserInput,
  generatePersonalizedResponse,
  generateDynamicAffirmations,
  generateConversationInsights,
  type AIAnalysis,
} from "@/lib/ai-engine"
import type { User } from "@/lib/types"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "affirmation" | "validation" | "guidance" | "breathing" | "grounding" | "crisis" | "celebration" | "question"
  analysis?: AIAnalysis
  tone?: "gentle" | "encouraging" | "celebratory" | "urgent" | "calm"
}

interface ConsolyBotProps {
  currentUser: User | null
}

export function EnhancedConsolyBot({ currentUser }: ConsolyBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null)
  const [conversationInsights, setConversationInsights] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("chat")
  const [userName, setUserName] = useState<string>("")
  const [emotionalState, setEmotionalState] = useState({
    primary: "neutral",
    intensity: 5,
    trend: "stable",
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const friendlyNames = ["friend", "buddy", "pal", "dear"]
      const randomName = friendlyNames[Math.floor(Math.random() * friendlyNames.length)]
      setUserName(randomName)

      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Hello there! I'm ConsolyBot, your AI-powered emotional companion. I'm here to understand, support, and grow with you. I use advanced AI to analyze your feelings and provide personalized responses. How are you feeling today, ${randomName}?`,
        sender: "bot",
        timestamp: new Date(),
        type: "question",
        tone: "encouraging",
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen])

  useEffect(() => {
    if (messages.length > 3) {
      updateConversationInsights()
    }
  }, [messages])

  const addMessage = (
    content: string,
    sender: "user" | "bot",
    analysis?: AIAnalysis,
    type?: Message["type"],
    tone?: Message["tone"],
  ) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content,
      sender,
      timestamp: new Date(),
      analysis,
      type,
      tone,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const updateConversationInsights = async () => {
    try {
      const insights = await generateConversationInsights(messages)
      setConversationInsights(insights)
    } catch (error) {
      console.error("Error updating insights:", error)
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

      // Analyze user input with AI
      const analysis = await analyzeUserInput(userMessage, conversationHistory)
      setCurrentAnalysis(analysis)

      // Update emotional state tracking
      setEmotionalState({
        primary: analysis.sentiment.primary,
        intensity: analysis.sentiment.intensity,
        trend:
          analysis.sentiment.intensity > emotionalState.intensity
            ? "improving"
            : analysis.sentiment.intensity < emotionalState.intensity
              ? "declining"
              : "stable",
      })

      setIsAnalyzing(false)
      setIsTyping(true)

      // Handle crisis situations immediately
      if (analysis.urgency === "crisis") {
        setTimeout(() => {
          setIsTyping(false)
          addMessage(
            `${userName}, I'm deeply concerned about what you've shared. These feelings must be incredibly overwhelming. Please know that you're not alone, and there are people trained to help you through this exact situation.`,
            "bot",
            analysis,
            "crisis",
            "urgent",
          )

          setTimeout(() => {
            addMessage(
              "Please reach out for immediate support: Call 988 (Suicide & Crisis Lifeline) or text HOME to 741741. You deserve help and support.",
              "bot",
              undefined,
              "crisis",
              "urgent",
            )
          }, 1500)
        }, 1000)
        return
      }

      // Generate personalized AI response
      const personalizedResponse = await generatePersonalizedResponse(
        userMessage,
        analysis,
        userName,
        conversationHistory,
      )

      setTimeout(() => {
        setIsTyping(false)
        addMessage(personalizedResponse.message, "bot", analysis, personalizedResponse.type, personalizedResponse.tone)

        // Add follow-up if available
        if (personalizedResponse.followUp) {
          setTimeout(() => {
            addMessage(personalizedResponse.followUp!, "bot", undefined, "question", "encouraging")
          }, 2000)
        }
      }, 1500)
    } catch (error) {
      console.error("Error processing message:", error)
      setIsAnalyzing(false)
      setIsTyping(false)

      addMessage(
        `I'm having a moment of technical difficulty, ${userName}, but I'm still here with you. Your feelings matter, and I want to support you.`,
        "bot",
        undefined,
        "validation",
        "gentle",
      )
    }
  }

  const handleGenerateAffirmations = async () => {
    if (!currentAnalysis) return

    setIsTyping(true)
    try {
      const affirmations = await generateDynamicAffirmations(currentAnalysis, userName)

      setTimeout(() => {
        setIsTyping(false)
        addMessage(
          `Here are some personalized affirmations for you, ${userName}:`,
          "bot",
          undefined,
          "affirmation",
          "encouraging",
        )

        affirmations.forEach((affirmation, index) => {
          setTimeout(
            () => {
              addMessage(`✨ ${affirmation}`, "bot", undefined, "affirmation", "encouraging")
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
      )
    }
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
            <Brain className="h-3 w-3 text-white" />
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
                AI-Enhanced
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Emotional State Indicator */}
          {currentAnalysis && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Current mood:</span>
              <Badge className={`${getEmotionColor(emotionalState.primary)} bg-transparent border`}>
                {emotionalState.primary}
              </Badge>
              <Progress value={emotionalState.intensity * 10} className="w-16 h-2" />
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
                        <div className="flex items-center space-x-2 mb-2">
                          {getMessageIcon(message.type)}
                          <span className="text-xs font-medium">ConsolyBot</span>
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
                            <span className="text-xs text-muted-foreground">Analyzing your message...</span>
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
                      </div>
                      <div>
                        <span className="text-sm font-medium">Intensity:</span>
                        <Progress value={currentAnalysis.sentiment.intensity * 10} className="mt-1" />
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
                    </div>
                  </Card>
                )}

                {conversationInsights && (
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Conversation Insights
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Progress:</span>
                        <p className="text-muted-foreground">{conversationInsights.progress}</p>
                      </div>
                      <div>
                        <span className="font-medium">Patterns:</span>
                        <ul className="text-muted-foreground list-disc list-inside">
                          {conversationInsights.patterns.map((pattern: string, index: number) => (
                            <li key={index}>{pattern}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                )}
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
                  Generate Personalized Affirmations
                </Button>

                <Button
                  onClick={() => {
                    addMessage("I'd like to try a breathing exercise", "user")
                    handleSendMessage()
                  }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Wind className="h-4 w-4 mr-2" />
                  Guided Breathing Exercise
                </Button>

                <Button
                  onClick={() => {
                    addMessage("Can you help me with grounding?", "user")
                    handleSendMessage()
                  }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Grounding Technique
                </Button>

                <Button
                  onClick={() => {
                    addMessage("I need some guidance", "user")
                    handleSendMessage()
                  }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Ask for Guidance
                </Button>

                <Button
                  onClick={() => {
                    addMessage("Can you give me some journaling prompts?", "user")
                    handleSendMessage()
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
