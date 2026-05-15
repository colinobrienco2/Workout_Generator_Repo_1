"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Clock, Target, MessageCircle, ChevronDown } from "lucide-react"
import { ReadinessPanel } from "./ReadinessPanel"
import { ProgressionSummary } from "./ProgressionSummary"
import { ExerciseCard } from "./ExerciseCard"
import type { Workout } from "@/lib/workout-types"

interface WorkoutCardProps {
  workout: Workout
  onSwapExercise: (exerciseId: string) => void
  selectedExerciseId?: string | null
  onSelectExercise?: (exerciseId: string) => void
}

export function WorkoutCard({
  workout,
  onSwapExercise,
  selectedExerciseId,
  onSelectExercise,
}: WorkoutCardProps) {
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false)
  const mainExercises = workout.exercises.filter(ex => !ex.is_abs_finisher)
  const absExercises = workout.exercises.filter(ex => ex.is_abs_finisher)
  const readinessLabel = workout.readiness.status.trim()
  const volumeModeLabel = workout.readiness.volume_mode.trim()
  const summarySubtitle = `${readinessLabel} · ${volumeModeLabel}`
  const workoutSupportDetails = (
    <>
      <ReadinessPanel readiness={workout.readiness} />

      {/* Coach message */}
      <div className="detail-panel rounded-xl border border-primary/18 bg-primary/[0.06] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/12 bg-primary/10">
            <MessageCircle className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold tracking-[0.08em] text-primary uppercase">Coach Note</p>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{workout.coach_message}</p>
          </div>
        </div>
      </div>

      <ProgressionSummary summary={workout.progression_summary} />
    </>
  )

  return (
    <div className="space-y-4">
      {/* Header card */}
      <Card className="engine-panel border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="engine-header-band rounded-[1.35rem] p-4 sm:p-4.5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="section-kicker mb-2 text-[0.68rem] font-semibold">Generated Session</p>
                <CardTitle className="text-[1.35rem] sm:text-[1.45rem]">{workout.session_name}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{workout.focus}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Badge variant="secondary" className="brand-chip-active gap-1.5">
                  <Target className="h-3 w-3" />
                  {workout.focus}
                </Badge>
                <Badge variant="outline" className="gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.84),0_12px_18px_-22px_rgba(15,23,42,0.14)]">
                  <Clock className="h-3 w-3" />
                  {workout.estimated_duration}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Collapsible
            open={isMobileSummaryOpen}
            onOpenChange={setIsMobileSummaryOpen}
            className="md:hidden"
          >
            <div className="engine-metric rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="section-kicker mb-1 text-[0.68rem] font-semibold">Readiness & Progression</p>
                  <p className="text-sm font-semibold text-foreground">{summarySubtitle}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Current engine recommendation and weekly adjustment state.</p>
                </div>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="premium-interactive action-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:text-primary"
                    aria-label={isMobileSummaryOpen ? "Collapse readiness and progression details" : "Expand readiness and progression details"}
                  >
                    {isMobileSummaryOpen ? "Collapse" : "Expand"}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isMobileSummaryOpen ? "rotate-180" : ""}`} />
                  </button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="mt-4 space-y-4">
                {workoutSupportDetails}
              </CollapsibleContent>
            </div>
          </Collapsible>

          <div className="hidden md:block space-y-4">
            {workoutSupportDetails}
          </div>
        </CardContent>
      </Card>

      {/* Exercise list */}
      <div className="space-y-3">
        <h3 className="section-kicker section-kicker-line px-1 text-[0.8rem] font-semibold">Exercises</h3>
        {mainExercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.exercise_id}
            exercise={exercise}
            index={index + 1}
            onSwap={onSwapExercise}
            isSelected={selectedExerciseId === exercise.exercise_id}
            onSelect={onSelectExercise ? () => onSelectExercise(exercise.exercise_id) : undefined}
          />
        ))}
      </div>

      {/* Abs finisher section */}
      {absExercises.length > 0 && (
        <div className="space-y-3">
          <h3 className="section-kicker section-kicker-line px-1 text-[0.8rem] font-semibold">Abs Finisher</h3>
          {absExercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.exercise_id}
              exercise={exercise}
              index={mainExercises.length + index + 1}
              onSwap={onSwapExercise}
              isSelected={selectedExerciseId === exercise.exercise_id}
              onSelect={onSelectExercise ? () => onSelectExercise(exercise.exercise_id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
