/**
 * AI Assistant Chat Interface
 * Customer-facing chat widget powered by RAG
 */

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  PaperPlaneTilt,
  Brain,
  User,
  Sparkle,
  ArrowsClockwise,
  ThumbsUp,
  ThumbsDown,
  Warning,
  Info,
  Lightning,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  sentiment?: "positive" | "neutral" | "negative" | "very_negative"
  category?: string
  sources?: Array<{ title: string; type: string }>
}

interface AIAssistantProps {
  className?: string
  embedded?: boolean
}

const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:5000"

export function AIAssistant({ className, embedded = false }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hi! I'm your PrintShop AI assistant. I can help you with:\n\n• **Pricing questions** - Get instant quotes\n• **Turnaround times** - Know when your order will be ready\n• **Design requirements** - File formats, colors, and resolution\n• **Product recommendations** - Find the right blank for your project\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Create a session on first message
  const ensureSession = async (): Promise<string> => {
    if (sessionId) return sessionId

    try {
      const response = await fetch(`${AI_API_URL}/chat/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        throw new Error("Failed to create session")
      }

      const data = await response.json()
      setSessionId(data.session_id)
      return data.session_id
    } catch (err) {
      console.error("Session creation error:", err)
      // Use a fallback session ID for demo purposes
      const fallbackId = `local-${Date.now()}`
      setSessionId(fallbackId)
      return fallbackId
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      const sid = await ensureSession()

      const response = await fetch(`${AI_API_URL}/chat/sessions/${sid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response_text,
        timestamp: new Date(),
        sentiment: data.sentiment,
        category: data.category,
        sources: data.sources?.map((s: { title: string; type: string }) => ({
          title: s.title,
          type: s.type,
        })),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error("Chat error:", err)
      setError("Unable to connect to AI service. Please try again.")

      // Add a fallback response for demo purposes
      const fallbackMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          "I'm currently running in demo mode. In production, I'd connect to our AI service to provide detailed answers about:\n\n• Screen printing: $8-15/shirt, 5-7 day turnaround\n• DTG printing: $12-20/shirt, 3-5 day turnaround\n• Embroidery: $5-8/location, 7-10 day turnaround\n\nPlease contact our team for specific quotes!",
        timestamp: new Date(),
        category: "demo",
      }
      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([messages[0]]) // Keep welcome message
    setSessionId(null)
    setError(null)
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/10 text-green-600"
      case "negative":
        return "bg-orange-500/10 text-orange-600"
      case "very_negative":
        return "bg-red-500/10 text-red-600"
      default:
        return "bg-blue-500/10 text-blue-600"
    }
  }

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting with safe React components
    return content.split("\n").map((line, i) => {
      // Parse bold text and return React elements
      const parts = line.split(/\*\*(.+?)\*\*/)
      const formattedParts = parts.map((part, j) => {
        // Odd indices are the bold content
        if (j % 2 === 1) {
          return <strong key={j}>{part}</strong>
        }
        return part
      })

      // Bullet points
      if (line.startsWith("• ")) {
        return (
          <div key={i} className="flex gap-2 ml-2">
            <span>•</span>
            <span>{formattedParts.slice(0).map((p, idx) => 
              typeof p === 'string' ? p.replace(/^• /, '') : p
            )}</span>
          </div>
        )
      }
      
      // Empty lines
      if (!line.trim()) {
        return <div key={i}>&nbsp;</div>
      }
      
      return <div key={i}>{formattedParts}</div>
    })
  }

  const containerClass = embedded
    ? "w-full h-full"
    : "max-w-2xl mx-auto"

  return (
    <Card className={cn(containerClass, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Brain className="text-white" size={22} weight="fill" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkle size={12} className="text-yellow-500" />
                Powered by RAG
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={clearChat} title="Clear chat">
            <ArrowsClockwise size={18} />
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0 flex flex-col" style={{ height: embedded ? "calc(100% - 80px)" : "500px" }}>
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Brain className="text-white" size={16} weight="fill" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="text-sm leading-relaxed">
                    {formatMessageContent(message.content)}
                  </div>

                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Info size={12} />
                        Sources:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {message.sources.map((source, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {source.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.category && message.role === "assistant" && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge className={cn("text-xs", getSentimentColor(message.sentiment))}>
                        {message.category}
                      </Badge>
                    </div>
                  )}

                  {message.role === "assistant" && message.id !== "welcome" && (
                    <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                      <button className="hover:text-green-600 transition-colors" title="Helpful">
                        <ThumbsUp size={14} />
                      </button>
                      <button className="hover:text-red-600 transition-colors" title="Not helpful">
                        <ThumbsDown size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="text-primary" size={16} weight="fill" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Brain className="text-white animate-pulse" size={16} weight="fill" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lightning className="animate-pulse" size={14} />
                    Thinking...
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/20 rounded-lg px-4 py-2">
                <Warning size={16} />
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about pricing, turnaround, designs..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <PaperPlaneTilt size={18} weight="fill" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI responses may not be 100% accurate. Verify important details with our team.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
