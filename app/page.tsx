"use client"

import { useCallback, useEffect, useState } from "react"
import ConnectSheet from "@/components/connect-sheet"
import { WorkoutSettingsForm } from "@/components/workout/WorkoutSettingsForm"
import { WorkoutCard } from "@/components/workout/WorkoutCard"
import { CoachPanel } from "@/components/workout/CoachPanel"
import { EmptyState } from "@/components/workout/EmptyState"
import { LoadingState } from "@/components/workout/LoadingState"
import { ErrorState } from "@/components/workout/ErrorState"
import { clearStoredApiUrl, getStoredApiUrl } from "@/lib/api-url"
import type { WorkoutSettings, Workout, Exercise } from "@/lib/workout-types"
import type { WeeklyStatus } from "@/lib/types/weekly-status"
import type { RenderedWorkout, RenderedExercise } from "@/lib/types/rendered-workout"
import { buildWorkoutFromStatus } from "@/lib/adapters/build-workout-from-status"
import { Dumbbell } from "lucide-react"

type AppState = "idle" | "loading" | "success" | "error"

function mapScoreBand(scoreBand: string): "green" | "yellow" | "red" {
  const normalized = scoreBand.toLowerCase()

  if (normalized.includes("high") || normalized === "green") return "green"
  if (
    normalized.includes("moderate") ||
    normalized.includes("medium") ||
    normalized.includes("low_data") ||
    normalized.includes("low data") ||
    normalized === "yellow"
  ) {
    return "yellow"
  }
  return "red"
}

function mapRenderedExerciseToLegacy(exercise: RenderedExercise): Exercise {
  return {
    exercise_id: exercise.exercise_id,
    name: exercise.name,
    category: exercise.category,
    movement_type: "Unknown",
    primary_muscle: exercise.primary_muscle,
    secondary_muscle: "",
    equipment: exercise.equipment,
    sets: exercise.sets,
    reps: exercise.reps,
    rest: exercise.rest,
    effort_target: exercise.effort_target ?? "Moderate",
    cue: exercise.cue ?? "",
    progression: exercise.progression ?? "",
    media_key: exercise.media_key ?? "",
    substitution_ids: exercise.substitution_ids ?? [],
    is_abs_finisher: exercise.is_abs_finisher ?? false,
    tips: exercise.tips ?? [],
  }
}

function mapRenderedWorkoutToLegacy(rendered: RenderedWorkout): Workout {
  return {
    session_name: rendered.session_name,
    focus: rendered.focus,
    estimated_duration: rendered.estimated_duration,
    readiness: {
      status: rendered.readiness.status,
      reason: rendered.readiness.reason,
      volume_mode: rendered.readiness.volume_mode,
      score_band: mapScoreBand(rendered.readiness.score_band),
    },
    coach_message: rendered.coach_message,
    include_abs: rendered.include_abs,
    progression_summary: {
      primary_goal: rendered.progression_summary.progression_focus,
      week_strategy: rendered.progression_summary.week_strategy,
      load_bias: rendered.progression_summary.deload_flag
        ? "Deload / reduced fatigue"
        : rendered.progression_summary.calorie_adjustment > 0
          ? "Support recovery and growth"
          : rendered.progression_summary.calorie_adjustment < 0
            ? "Slight nutritional pullback"
            : "Maintain current course",
    },
    exercises: rendered.exercises.map(mapRenderedExerciseToLegacy),
  }
}

export default function WorkoutGeneratorPage() {
  const [apiUrl, setApiUrl] = useState<string | null>(null)
  const [state, setState] = useState<AppState>("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [settings, setSettings] = useState<WorkoutSettings>({
    trainingFocus: "chest-triceps",
    sessionLength: "medium",
    equipment: "full-gym",
    includeAbs: true,
  })
  const [workout, setWorkout] = useState<Workout | null>(null)

  useEffect(() => {
    const storedUrl = getStoredApiUrl()
    setApiUrl(storedUrl)
  }, [])

  const handleConnect = useCallback(() => {
    const storedUrl = getStoredApiUrl()
    setApiUrl(storedUrl)
    setState("idle")
    setWorkout(null)
    setErrorMessage("")
  }, [])

  const handleDisconnect = useCallback(() => {
    clearStoredApiUrl()
    setApiUrl(null)
    setState("idle")
    setWorkout(null)
    setErrorMessage("")
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!apiUrl) return

    setState("loading")
    setErrorMessage("")

    try {
      const response = await fetch(
        `/api/weekly-latest?url=${encodeURIComponent(apiUrl)}`
      )

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(
          payload?.error || "Could not load weekly status from your Apps Script URL."
        )
      }

      const weeklyStatus = (await response.json()) as WeeklyStatus

      const renderedWorkout = buildWorkoutFromStatus(weeklyStatus, {
        trainingFocus: settings.trainingFocus,
        sessionLength: settings.sessionLength,
        equipment: settings.equipment,
        includeAbs: settings.includeAbs,
      })

      const legacyWorkout = mapRenderedWorkoutToLegacy(renderedWorkout)

      setWorkout(legacyWorkout)
      setState("success")
    } catch (error) {
      setState("error")
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while generating the workout."
      )
    }
  }, [apiUrl, settings])

  const handleRetry = useCallback(() => {
    handleGenerate()
  }, [handleGenerate])

  const handleSwapExercise = useCallback((exerciseId: string) => {
    if (!workout) return

    setWorkout((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        exercises: prev.exercises.map((exercise) =>
          exercise.exercise_id === exerciseId
            ? {
                ...exercise,
                name: `${exercise.name} (Swapped)`,
              }
            : exercise
        ),
      }
    })
  }, [workout])

  if (!apiUrl) {
    return <ConnectSheet onConnect={handleConnect} />
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary p-2">
                <Dumbbell className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Workout Generator
                </h1>
                <p className="text-sm text-muted-foreground">
                  Deterministic workout builder powered by your weekly Sheets coaching engine.
                </p>
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Change Sheet
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[340px_1fr_380px]">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <WorkoutSettingsForm
              settings={settings}
              onSettingsChange={setSettings}
              onGenerate={handleGenerate}
              isGenerating={state === "loading"}
            />
          </aside>

          <section className="min-w-0">
            {state === "idle" && <EmptyState />}
            {state === "loading" && <LoadingState />}
            {state === "error" && (
              <ErrorState
                onRetry={handleRetry}
                message={errorMessage}
              />
            )}
            {state === "success" && workout && (
              <WorkoutCard
                workout={workout}
                onSwapExercise={handleSwapExercise}
              />
            )}
          </section>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <CoachPanel />
          </aside>
        </div>
      </main>
    </div>
  )
}