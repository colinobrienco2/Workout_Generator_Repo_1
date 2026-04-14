"use client"

import { useState, useCallback } from "react"
import { WorkoutSettingsForm } from "@/components/workout/WorkoutSettingsForm"
import { WorkoutCard } from "@/components/workout/WorkoutCard"
import { CoachPanel } from "@/components/workout/CoachPanel"
import { EmptyState } from "@/components/workout/EmptyState"
import { LoadingState } from "@/components/workout/LoadingState"
import { ErrorState } from "@/components/workout/ErrorState"
import { fetchWeeklyStatus } from "@/lib/api/fetch-weekly-status"
import { buildWorkoutFromStatus, buildProgressionNote, getTips, normalizeEquipment, titleCase } from "@/lib/adapters/build-workout-from-status"
import { getExerciseSwapOptions } from "@/lib/adapters/get-exercise-swap-options"
import type { WorkoutSettings, Workout, WeeklyStatus, ExerciseLibraryItem } from "@/lib/workout-types"
import { Dumbbell } from "lucide-react"

type AppState = "idle" | "loading" | "success" | "error"

export default function WorkoutGeneratorPage() {
  const [state, setState] = useState<AppState>("idle")
  const [settings, setSettings] = useState<WorkoutSettings>({
    trainingFocus: "chest-triceps",
    sessionLength: "medium",
    equipment: "full-gym",
    includeAbs: true,
  })
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [weeklyStatus, setWeeklyStatus] = useState<WeeklyStatus | null>(null)

  const handleGenerate = useCallback(async () => {
    setState("loading")

    try {
      const latestStatus = await fetchWeeklyStatus()
      const nextWorkout = buildWorkoutFromStatus(latestStatus, settings)
      setWeeklyStatus(latestStatus)
      setWorkout(nextWorkout)
      setState("success")
    } catch {
      setState("error")
    }
  }, [settings])

  const handleSwapExercise = useCallback((exerciseId: string) => {
    if (!workout || !weeklyStatus) return

    setWorkout((prev) => {
      if (!prev) return prev

      const currentExercise = prev.exercises.find((exercise) => exercise.exercise_id === exerciseId)
      if (!currentExercise) return prev

      const usedExerciseIds = prev.exercises.map((exercise) => exercise.exercise_id)
      const replacement = getExerciseSwapOptions(exerciseId, usedExerciseIds, settings.equipment)[0]

      if (!replacement) {
        return {
          ...prev,
          exercises: prev.exercises.map((exercise) =>
            exercise.exercise_id === exerciseId
              ? {
                  ...exercise,
                  cue: "No valid deterministic swap was available for this slot.",
                }
              : exercise,
          ),
        }
      }

      const nextExercise = materializeSwapCandidate(replacement, currentExercise, weeklyStatus)

      return {
        ...prev,
        exercises: prev.exercises.map((exercise) =>
          exercise.exercise_id === exerciseId ? nextExercise : exercise,
        ),
      }
    })
  }, [settings.equipment, workout, weeklyStatus])

  const handleRetry = useCallback(() => {
    void handleGenerate()
  }, [handleGenerate])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Workout Generator</h1>
              <p className="text-sm text-muted-foreground">
                Deterministic workout builder powered by your weekly Sheets coaching engine.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[340px_1fr_380px]">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <WorkoutSettingsForm
              settings={settings}
              onSettingsChange={setSettings}
              onGenerate={() => void handleGenerate()}
              isGenerating={state === "loading"}
            />
          </aside>

          <section className="min-w-0">
            {state === "idle" && <EmptyState />}
            {state === "loading" && <LoadingState />}
            {state === "error" && <ErrorState onRetry={handleRetry} />}
            {state === "success" && workout && (
              <WorkoutCard workout={workout} onSwapExercise={handleSwapExercise} />
            )}
          </section>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <CoachPanel weeklyStatus={weeklyStatus} />
          </aside>
        </div>
      </main>
    </div>
  )
}

function materializeSwapCandidate(
  candidate: ExerciseLibraryItem,
  currentExercise: Workout["exercises"][number],
  weeklyStatus: WeeklyStatus,
): Workout["exercises"][number] {
  return {
    ...currentExercise,
    exercise_id: candidate.exercise_id,
    name: candidate.name,
    movement_type: titleCase(candidate.movement_type),
    primary_muscle: titleCase(candidate.primary_muscle),
    secondary_muscle: Array.isArray(candidate.secondary_muscle)
      ? candidate.secondary_muscle.map(titleCase).join(", ")
      : candidate.secondary_muscle ? titleCase(candidate.secondary_muscle) : undefined,
    equipment: normalizeEquipment(candidate.equipment),
    cue: candidate.coaching?.default_cue ?? weeklyStatus.training_note,
    progression: buildProgressionNote(candidate, weeklyStatus),
    media_key: candidate.media_key,
    substitution_ids: candidate.substitution_ids ?? [],
    allowed_swap_ids: candidate.substitution_ids ?? [],
    tips: getTips(candidate, weeklyStatus),
  }
}
