"use client"

import { useMemo, useState, type ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User, RefreshCw, HelpCircle, Timer, Wrench, BarChart3, HeartPulse, Apple } from "lucide-react"
import guidedHelpCatalog from "@/data/tips/guided-help-categories.json"
import type { ChatMessage, WeeklyStatus } from "@/lib/workout-types"
import type { GuidedHelpCategory, GuidedHelpPrompt } from "@/lib/types/guided-help"

interface CoachPanelProps {
  weeklyStatus?: WeeklyStatus | null
}

function buildDeterministicResponse(prompt: GuidedHelpPrompt, weeklyStatus?: WeeklyStatus | null) {
  if (!weeklyStatus) {
    return "Generate a workout first to load your weekly strategy, recovery context, and guided coaching details."
  }

  switch (prompt.question_id) {
    case "why_this_week":
      return `${weeklyStatus.readiness_status} week: ${weeklyStatus.trigger_reason} ${weeklyStatus.progression_focus}`
    case "why_volume_changed":
      return `${weeklyStatus.volume_mode} mode is active this week. Volume adjustment: ${weeklyStatus.volume_adjustment_pct}% based on your current readiness.`
    case "what_low_data_means":
      return `Data quality is currently marked as ${weeklyStatus.data_quality_flag}. Log more days to improve weekly coaching precision.`
    case "focus_on_this_movement":
      return weeklyStatus.training_note
    case "why_this_exercise":
      return "This movement was selected to fill a fixed split slot inside your deterministic template while matching your current equipment and weekly strategy."
    case "swap_for_dumbbell":
      return "Available swaps are filtered deterministically by slot fit, equipment mode, duplicate prevention, and safe replacement rules."
    case "why_no_swap_available":
      return "Some exercises stay locked when there is no valid same-slot substitute that matches your equipment mode and session structure."
    default:
      return weeklyStatus.coach_notes.replace(/\n/g, " ")
  }
}

const categoryIcons: Record<string, ReactNode> = {
  weekly_strategy: <BarChart3 className="h-3.5 w-3.5" />,
  exercise_help: <HelpCircle className="h-3.5 w-3.5" />,
  exercise_swap: <RefreshCw className="h-3.5 w-3.5" />,
  logging_data: <BarChart3 className="h-3.5 w-3.5" />,
  nutrition: <Apple className="h-3.5 w-3.5" />,
  recovery: <HeartPulse className="h-3.5 w-3.5" />,
  program_basics: <Timer className="h-3.5 w-3.5" />,
}

export function CoachPanel({ weeklyStatus }: CoachPanelProps) {
  const categories = guidedHelpCatalog.categories as GuidedHelpCategory[]
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.category_id ?? "")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Choose a guided coach request below. This panel is deterministic — no free typing.",
      timestamp: new Date(),
    },
  ])

  const selectedCategory = useMemo(
    () => categories.find((category) => category.category_id === selectedCategoryId) ?? categories[0],
    [categories, selectedCategoryId],
  )

  const handlePromptClick = (prompt: GuidedHelpPrompt) => {
    const now = Date.now()
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${now}`,
        role: "user",
        content: prompt.label,
        timestamp: new Date(now),
      },
      {
        id: `assistant-${now}`,
        role: "assistant",
        content: buildDeterministicResponse(prompt, weeklyStatus),
        timestamp: new Date(now + 1),
      },
    ])
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
        <ScrollArea className="flex-1 p-4">
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
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
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

        <div className="px-4 py-3 border-t border-border/50 bg-muted/20 shrink-0">
          <p className="text-xs text-muted-foreground mb-2">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.category_id}
                variant={selectedCategoryId === category.category_id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategoryId(category.category_id)}
                className="gap-1.5 text-xs"
              >
                {categoryIcons[category.category_id] ?? <Wrench className="h-3.5 w-3.5" />}
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border/50 shrink-0">
          <div className="rounded-xl border border-border/60 bg-background px-3 py-3">
            <div className="text-xs font-medium text-foreground mb-2">Choose a coach request…</div>
            <div className="flex flex-wrap gap-2">
              {selectedCategory?.questions.map((prompt) => (
                <button
                  key={prompt.question_id}
                  onClick={() => handlePromptClick(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/40 hover:bg-muted transition-colors"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
