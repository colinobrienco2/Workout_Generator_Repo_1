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
              <Badge variant="secondary" className="gap-1">
                <Target className="h-3 w-3" />
                {workout.focus}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {workout.estimated_duration}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ReadinessPanel readiness={workout.readiness} />
          
          {/* Coach message */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-primary mb-1">Coach Note</p>
                <p className="text-sm text-foreground leading-relaxed">{workout.coach_message}</p>
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
