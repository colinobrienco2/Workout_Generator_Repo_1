"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Target, MessageCircle } from "lucide-react"
import { ReadinessPanel } from "./ReadinessPanel"
import { ProgressionSummary } from "./ProgressionSummary"
import { ExerciseCard } from "./ExerciseCard"
import type { Workout } from "@/lib/workout-types"

interface WorkoutCardProps {
  workout: Workout
  onSwapExercise: (exerciseId: string) => void
}

export function WorkoutCard({ workout, onSwapExercise }: WorkoutCardProps) {
  const mainExercises = workout.exercises.filter(ex => !ex.is_abs_finisher)
  const absExercises = workout.exercises.filter(ex => ex.is_abs_finisher)

  return (
    <div className="space-y-4">
      {/* Header card */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl">{workout.session_name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <Target className="h-3 w-3" />
                {workout.focus}
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <Clock className="h-3 w-3" />
                {workout.estimated_duration}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Exercise list */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground px-1">Exercises</h3>
        {mainExercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.exercise_id}
            exercise={exercise}
            index={index + 1}
            onSwap={onSwapExercise}
          />
        ))}
      </div>

      {/* Abs finisher section */}
      {absExercises.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground px-1">Abs Finisher</h3>
          {absExercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.exercise_id}
              exercise={exercise}
              index={mainExercises.length + index + 1}
              onSwap={onSwapExercise}
            />
          ))}
        </div>
      )}
    </div>
  )
}
