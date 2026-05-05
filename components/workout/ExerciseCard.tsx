"use client"

import { useState, type KeyboardEvent, type SyntheticEvent } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, RefreshCw, Play, Dumbbell, Gauge } from "lucide-react"
import type { Exercise } from "@/lib/workout-types"
import { formatEffortLabel } from "@/lib/formatters/effort-label"
import { getExerciseMedia } from "@/lib/media/get-exercise-media"

interface ExerciseCardProps {
  exercise: Exercise
  index: number
  onSwap: (exerciseId: string) => void
  isSelected?: boolean
  onSelect?: () => void
}

export function ExerciseCard({ exercise, index, onSwap, isSelected = false, onSelect }: ExerciseCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [thumbnailFailed, setThumbnailFailed] = useState(false)
  const media = getExerciseMedia(exercise)
  const thumbnailUrl = thumbnailFailed ? null : media.thumbnailUrl
  const isSelectable = Boolean(onSelect)

  const handleCardClick = () => {
    onSelect?.()
  }

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect) return
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    onSelect()
  }

  const stopSelectionPropagation = (event: SyntheticEvent) => {
    event.stopPropagation()
  }

  const handleThumbnailClick = (event: SyntheticEvent) => {
    event.stopPropagation()
    if (!thumbnailUrl) return
    setIsPreviewOpen(true)
  }

  const handleThumbnailKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    if (!thumbnailUrl) return
    setIsPreviewOpen(true)
  }

  const handlePreviewImageClick = (event: SyntheticEvent) => {
    event.stopPropagation()
    setIsPreviewOpen(false)
  }

  return (
    <Card
      className={`brand-panel overflow-hidden border-border/50 shadow-sm transition-[border-color,box-shadow,background-color] ${
        exercise.is_abs_finisher ? "border-l-4 border-l-primary/80" : ""
      } ${
        isSelectable ? "cursor-pointer" : ""
      } ${
        isSelected
          ? "border-primary/50 bg-primary/[0.035] ring-2 ring-primary/20 shadow-md"
          : "hover:border-primary/20 hover:shadow-md/40"
      }`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role={isSelectable ? "button" : undefined}
      tabIndex={isSelectable ? 0 : undefined}
      aria-pressed={isSelectable ? isSelected : undefined}
      aria-label={isSelectable ? `${exercise.name}${isSelected ? ", selected for Coach" : ""}` : undefined}
    >
      <CardContent className="p-0">
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-[linear-gradient(180deg,rgba(58,119,255,0.15)_0%,rgba(58,119,255,0.09)_100%)] text-sm font-semibold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_12px_20px_-18px_rgba(58,119,255,0.55)]">
                {index}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-foreground">{exercise.name}</h4>
                  {isSelected && (
                    <Badge className="meta-pill-accent border-0">Selected for Coach</Badge>
                  )}
                  {exercise.is_abs_finisher && (
                    <Badge variant="secondary">Finisher</Badge>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {exercise.category}
                  </Badge>
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

          <div className="mt-3 flex flex-wrap items-center gap-2.5 text-sm">
            <div className="meta-pill flex items-center gap-1.5 px-2.5 py-1 text-muted-foreground">
              <Dumbbell className="h-3.5 w-3.5" />
              <span className="text-xs">{exercise.equipment}</span>
            </div>
            <Badge className="meta-pill-accent border-0">
              <Gauge className="h-3 w-3" />
              Effort: {formatEffortLabel(exercise.effort_target)}
            </Badge>
          </div>

          <div className="detail-panel mt-3 rounded-xl p-3">
            <p className="text-sm italic leading-relaxed text-muted-foreground">&ldquo;{exercise.cue}&rdquo;</p>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-border/60 bg-white/60 px-3 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground">Progression</span>
            <p className="min-w-0 text-xs leading-relaxed text-muted-foreground">{exercise.progression}</p>
          </div>

          <div className="detail-panel mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl p-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleThumbnailClick}
                onKeyDown={handleThumbnailKeyDown}
                onMouseDown={stopSelectionPropagation}
                className={`flex h-12 w-20 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted transition-[transform,box-shadow,filter] focus-visible:outline-none ${
                  thumbnailUrl
                    ? "cursor-zoom-in hover:scale-[1.03] hover:ring-2 hover:ring-blue-300/70 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-blue-300/70"
                    : "cursor-default"
                }`}
                aria-label={thumbnailUrl ? `Open larger preview for ${exercise.name}` : `${exercise.name} demo thumbnail unavailable`}
                disabled={!thumbnailUrl}
              >
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
              </button>
              {media.tutorialUrl ? (
                <a
                  href={media.tutorialUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={stopSelectionPropagation}
                  className="inline-flex items-center rounded-full border border-primary/20 bg-[linear-gradient(180deg,rgba(58,119,255,0.1)_0%,rgba(58,119,255,0.06)_100%)] px-3 py-1 text-xs font-semibold text-primary transition-[background-color,border-color,box-shadow,color,transform] hover:-translate-y-px hover:border-primary/28 hover:bg-primary/[0.12] hover:text-primary/95 hover:shadow-[0_14px_22px_-20px_rgba(58,119,255,0.5)] active:translate-y-0"
                >
                  See Demo
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Demo unavailable: no media manifest or tutorial URL is configured for this exercise."
                  onClick={stopSelectionPropagation}
                  className="cursor-not-allowed text-xs text-muted-foreground opacity-70"
                >
                  See Demo
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation()
                onSwap(exercise.exercise_id)
              }}
              className="gap-1.5"
              disabled={!exercise.allowed_swap_ids?.length}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Swap
            </Button>
          </div>
        </div>

        {thumbnailUrl ? (
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent
              showCloseButton={false}
              className="w-auto max-w-[calc(100vw-2rem)] border-0 bg-transparent p-0 shadow-none sm:max-w-[calc(100vw-2rem)]"
              onClick={stopSelectionPropagation}
            >
              <DialogTitle className="sr-only">Preview image for {exercise.name}</DialogTitle>
              <img
                src={thumbnailUrl}
                alt={`${exercise.name} enlarged demo preview`}
                className="max-h-[80vh] max-w-[80vw] cursor-zoom-out rounded-2xl object-contain shadow-2xl"
                onClick={handlePreviewImageClick}
              />
            </DialogContent>
          </Dialog>
        ) : null}

        {exercise.tips && exercise.tips.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <button
                onClick={stopSelectionPropagation}
                className="flex w-full items-center justify-between border-t border-border/50 bg-muted/20 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/[0.05] hover:text-foreground"
              >
                <span>Tips & Notes</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="space-y-2 px-4 pb-4 pt-2">
                {exercise.tips.map((tip, i) => (
                  <li key={i} className="grid grid-cols-[auto_1fr] items-start gap-x-2 text-sm leading-relaxed text-muted-foreground">
                    <span aria-hidden="true" className="pt-[0.2em] leading-none text-primary">&bull;</span>
                    <span>{tip}</span>
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
