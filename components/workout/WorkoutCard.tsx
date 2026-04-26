"use client"

import { Clock, MessageCircle, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Workout } from "@/lib/workout-types"
import { ExerciseCard } from "./ExerciseCard"
import { ProgressionSummary } from "./ProgressionSummary"
import { ReadinessPanel } from "./ReadinessPanel"

interface WorkoutCardProps {
  workout: Workout
  onSwapExercise: (exerciseId: string) => void
}

function splitSessionName(sessionName: string) {
  const parts = sessionName.split(/\s(?:-|\u2013|\u2014)\s/)

  if (parts.length < 2) {
    return { title: sessionName, status: "" }
  }

  return {
    title: parts[0],
    status: parts.slice(1).join(" - "),
  }
}

export function WorkoutCard({ workout, onSwapExercise }: WorkoutCardProps) {
  const mainExercises = workout.exercises.filter((ex) => !ex.is_abs_finisher)
  const absExercises = workout.exercises.filter((ex) => ex.is_abs_finisher)
  const sessionMeta = splitSessionName(workout.session_name)

  return (
    <div className="space-y-6">
      <Card className="surface-card border-border/50 shadow-sm">
        <CardHeader className="space-y-5 pb-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <CardTitle className="text-2xl sm:text-[2.05rem]">{sessionMeta.title}</CardTitle>
              {sessionMeta.status ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="eyebrow text-primary/85">Weekly Status</span>
                  <span className="meta-pill inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary/70" />
                    {sessionMeta.status}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:max-w-[260px] lg:justify-end">
              <Badge variant="secondary" className="meta-pill gap-1.5 border-0 px-3 py-1.5 text-[0.8rem]">
                <Target className="h-3 w-3" />
                {workout.focus}
              </Badge>
              <Badge variant="outline" className="meta-pill gap-1.5 px-3 py-1.5 text-[0.8rem]">
                <Clock className="h-3 w-3" />
                {workout.estimated_duration}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-5">
          <div className="surface-subtle rounded-[1.4rem] border border-border/60 p-3.5 sm:p-4">
            <div className="mb-3 flex items-center gap-3 px-1">
              <span className="eyebrow text-primary/85">Weekly Coaching Summary</span>
              <div className="h-px flex-1 bg-gradient-to-r from-border/80 via-border/55 to-transparent" />
            </div>

            <div className="space-y-3">
              <ReadinessPanel readiness={workout.readiness} />

              <div className="detail-panel rounded-2xl border border-primary/18 bg-primary/[0.055] px-4 py-4 sm:px-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/12 bg-primary/10">
                    <MessageCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">Coach Note</p>
                    <p className="max-w-[50ch] whitespace-pre-line text-sm leading-relaxed text-foreground">
                      {workout.coach_message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ProgressionSummary summary={workout.progression_summary} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1 pt-1">
          <h3 className="font-semibold text-foreground">Exercises</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-border/85 via-border/60 to-transparent" />
        </div>
        <div className="space-y-5">
          {mainExercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.exercise_id}
              exercise={exercise}
              index={index + 1}
              onSwap={onSwapExercise}
            />
          ))}
        </div>
      </div>

      {absExercises.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <h3 className="font-semibold text-foreground">Abs Finisher</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-border/85 via-border/60 to-transparent" />
          </div>
          <div className="space-y-5">
            {absExercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.exercise_id}
                exercise={exercise}
                index={mainExercises.length + index + 1}
                onSwap={onSwapExercise}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
