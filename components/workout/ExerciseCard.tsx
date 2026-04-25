"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, RefreshCw, Play, Dumbbell, Gauge } from "lucide-react"
import type { Exercise } from "@/lib/workout-types"
import { formatEffortLabel } from "@/lib/formatters/effort-label"
import { getExerciseMedia } from "@/lib/media/get-exercise-media"

interface ExerciseCardProps {
  exercise: Exercise
  index: number
  onSwap: (exerciseId: string) => void
}

export function ExerciseCard({ exercise, index, onSwap }: ExerciseCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [thumbnailFailed, setThumbnailFailed] = useState(false)
  const media = getExerciseMedia(exercise)
  const thumbnailUrl = thumbnailFailed ? null : media.thumbnailUrl

  return (
    <Card className={`border-border/50 shadow-sm overflow-hidden ${exercise.is_abs_finisher ? "border-l-4 border-l-primary" : ""}`}>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3 flex-1 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {index}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-foreground">{exercise.name}</h4>
                  {exercise.is_abs_finisher && (
                    <Badge variant="secondary" className="text-xs">Finisher</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-xs font-normal">
                    {exercise.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{exercise.primary_muscle}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-lg font-bold text-foreground">
                {exercise.sets} x {exercise.reps}
              </div>
              <p className="text-xs text-muted-foreground">{exercise.rest} rest</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Dumbbell className="h-3.5 w-3.5" />
              <span className="text-xs">{exercise.equipment}</span>
            </div>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-xs gap-1">
              <Gauge className="h-3 w-3" />
              Effort: {formatEffortLabel(exercise.effort_target)}
            </Badge>
          </div>

          <div className="mt-3 rounded-md bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground italic">&ldquo;{exercise.cue}&rdquo;</p>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Progression:</span> {exercise.progression}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-md bg-muted">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={`${exercise.name} demo thumbnail`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={() => setThumbnailFailed(true)}
                  />
                ) : (
                  <Play className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              {media.tutorialUrl ? (
                <a
                  href={media.tutorialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  See Demo
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Demo unavailable: no media manifest or tutorial URL is configured for this exercise."
                  className="text-xs text-muted-foreground opacity-70 cursor-not-allowed"
                >
                  See Demo
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSwap(exercise.exercise_id)}
              className="gap-1.5"
              disabled={!exercise.allowed_swap_ids?.length}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Swap
            </Button>
          </div>
        </div>

        {exercise.tips && exercise.tips.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between border-t border-border/50 bg-muted/30 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                <span>Tips & Notes</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="px-4 pb-4 pt-2 space-y-2">
                {exercise.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  )
}
