"use client"

import { useState } from "react"
import { ChevronDown, Dumbbell, Gauge, Play, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { formatEffortLabel } from "@/lib/formatters/effort-label"
import { getExerciseMedia } from "@/lib/media/get-exercise-media"
import type { Exercise } from "@/lib/workout-types"

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
    <Card className={`surface-card overflow-hidden border-border/50 shadow-sm ${exercise.is_abs_finisher ? "border-l-4 border-l-primary" : ""}`}>
      <CardContent className="p-0">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-5">
            <div className="flex min-w-0 flex-1 gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/14 bg-primary/[0.08] text-sm font-semibold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                {index}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-foreground">{exercise.name}</h4>
                  {exercise.is_abs_finisher && <Badge variant="secondary">Finisher</Badge>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{exercise.category}</Badge>
                  <span className="meta-pill px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    {exercise.primary_muscle}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-panel shrink-0 rounded-xl px-3 py-2 text-right">
              <div className="text-lg font-bold text-foreground">
                {exercise.sets} x {exercise.reps}
              </div>
              <p className="text-xs text-muted-foreground">{exercise.rest} rest</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5 text-sm">
            <div className="meta-pill flex items-center gap-1.5 px-2.5 py-1 text-muted-foreground">
              <Dumbbell className="h-3.5 w-3.5" />
              <span className="text-xs">{exercise.equipment}</span>
            </div>
            <Badge className="meta-pill-accent border-0">
              <Gauge className="h-3 w-3" />
              Effort: {formatEffortLabel(exercise.effort_target)}
            </Badge>
          </div>

          <div className="detail-panel mt-4 rounded-xl p-3">
            <p className="text-sm italic leading-relaxed text-muted-foreground">&ldquo;{exercise.cue}&rdquo;</p>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-border/60 bg-white/60 px-3 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground">Progression</span>
            <p className="min-w-0 text-xs leading-relaxed text-muted-foreground">{exercise.progression}</p>
          </div>

          <div className="detail-panel mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl p-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted">
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
                  className="inline-flex items-center rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/[0.1] hover:text-primary/90"
                >
                  See Demo
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Demo unavailable: no media manifest or tutorial URL is configured for this exercise."
                  className="cursor-not-allowed text-xs text-muted-foreground opacity-70"
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
              <button className="flex w-full items-center justify-between border-t border-border/50 bg-muted/20 px-5 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/[0.05] hover:text-foreground">
                <span>Tips & Notes</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="space-y-2 px-5 pb-5 pt-3">
                {exercise.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 text-primary">&bull;</span>
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
