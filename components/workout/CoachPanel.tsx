"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  RefreshCw, 
  HelpCircle, 
  Gauge, 
  Timer, 
  Wrench, 
  Send, 
  Bot,
  User
} from "lucide-react"
import type { ChatMessage, CoachAction } from "@/lib/workout-types"
import { quickPrompts, coachResponses } from "@/lib/mock-data"

interface CoachPanelProps {
  onAction?: (action: string) => void
}

const actionIcons: Record<string, React.ReactNode> = {
  "swap-exercise": <RefreshCw className="h-3.5 w-3.5" />,
  "explain-movement": <HelpCircle className="h-3.5 w-3.5" />,
  "adjust-intensity": <Gauge className="h-3.5 w-3.5" />,
  "shorten-workout": <Timer className="h-3.5 w-3.5" />,
  "equipment-alternative": <Wrench className="h-3.5 w-3.5" />
}

export function CoachPanel({ onAction }: CoachPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "I'm here to help you customize your workout. Use the quick actions below or type your question.",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [selectedAction, setSelectedAction] = useState<CoachAction | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const addMessage = (role: "user" | "assistant", content: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const getCoachResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes("dumbbell")) {
      return coachResponses["swap-dumbbell"][Math.floor(Math.random() * coachResponses["swap-dumbbell"].length)]
    }
    if (lowerMessage.includes("bodyweight")) {
      return coachResponses["swap-bodyweight"][Math.floor(Math.random() * coachResponses["swap-bodyweight"].length)]
    }
    if (lowerMessage.includes("explain") || lowerMessage.includes("cue") || lowerMessage.includes("why")) {
      return coachResponses["explain-cue"][Math.floor(Math.random() * coachResponses["explain-cue"].length)]
    }
    if (lowerMessage.includes("reduce") || lowerMessage.includes("shorter") || lowerMessage.includes("less")) {
      return coachResponses["reduce-volume"][Math.floor(Math.random() * coachResponses["reduce-volume"].length)]
    }
    if (lowerMessage.includes("harder") || lowerMessage.includes("increase") || lowerMessage.includes("more intense")) {
      return coachResponses["increase-intensity"][Math.floor(Math.random() * coachResponses["increase-intensity"].length)]
    }
    if (lowerMessage.includes("easier") || lowerMessage.includes("decrease") || lowerMessage.includes("less intense")) {
      return coachResponses["decrease-intensity"][Math.floor(Math.random() * coachResponses["decrease-intensity"].length)]
    }
    
    return coachResponses["default"][Math.floor(Math.random() * coachResponses["default"].length)]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    addMessage("user", inputValue)
    
    // Simulate typing delay
    setTimeout(() => {
      const response = getCoachResponse(inputValue)
      addMessage("assistant", response)
      onAction?.(inputValue)
    }, 500)
    
    setInputValue("")
    setSelectedAction(null)
  }

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt)
    setSelectedAction(null)
  }

  const handleActionClick = (action: CoachAction) => {
    setSelectedAction(selectedAction === action ? null : action)
  }

  return (
    <Card className="border-border/50 shadow-sm flex flex-col h-[600px]">
      <CardHeader className="pb-3 border-b border-border/50 shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-primary" />
          Coach Panel
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Messages area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="shrink-0 h-8 w-8 rounded-full bg-foreground/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Quick action prompts */}
        {selectedAction && quickPrompts[selectedAction] && (
          <div className="px-4 py-3 border-t border-border/50 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Select a prompt:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts[selectedAction].prompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="px-4 py-3 border-t border-border/50 shrink-0">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(quickPrompts) as CoachAction[]).map((action) => (
              <Button
                key={action}
                variant={selectedAction === action ? "default" : "outline"}
                size="sm"
                onClick={() => handleActionClick(action)}
                className="gap-1.5 text-xs"
              >
                {actionIcons[action]}
                {quickPrompts[action].label}
              </Button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 shrink-0">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask your coach..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!inputValue.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
