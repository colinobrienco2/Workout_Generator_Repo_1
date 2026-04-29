"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
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
import type { ExerciseLibraryItem } from "@/lib/types/exercise"
import { buildWorkoutFromStatus } from "@/lib/adapters/build-workout-from-status"
import {
  buildProgressionNote,
  getTips,
  normalizeEquipment,
  titleCase,
} from "@/lib/adapters/build-workout-from-status"
import { getExerciseSwapOptions } from "@/lib/adapters/get-exercise-swap-options"

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
    allowed_swap_ids: exercise.allowed_swap_ids ?? [],
    slot_id: exercise.slot_id,
    is_abs_finisher: exercise.is_abs_finisher ?? false,
    tips: exercise.tips ?? [],
  }
}

function formatSecondaryMuscle(secondaryMuscle?: string | string[]): string {
  if (Array.isArray(secondaryMuscle)) {
    return secondaryMuscle.map(titleCase).join(", ")
  }

  return secondaryMuscle ? titleCase(secondaryMuscle) : ""
}

function mapSwapCandidateToLegacy(
  currentExercise: Exercise,
  replacement: ExerciseLibraryItem,
  weeklyStatus: WeeklyStatus,
): Exercise {
  return {
    ...currentExercise,
    exercise_id: replacement.exercise_id,
    name: replacement.name,
    movement_type: titleCase(replacement.movement_type),
    primary_muscle: titleCase(replacement.primary_muscle),
    secondary_muscle: formatSecondaryMuscle(replacement.secondary_muscle),
    equipment: normalizeEquipment(replacement.equipment),
    cue: replacement.coaching?.default_cue ?? weeklyStatus.training_note,
    progression: buildProgressionNote(replacement, weeklyStatus),
    media_key: replacement.media_key ?? "",
    substitution_ids: replacement.substitution_ids ?? [],
    allowed_swap_ids: replacement.substitution_ids ?? [],
    last_swapped_from_id: currentExercise.exercise_id,
    tips: getTips(replacement, weeklyStatus),
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
  const [weeklyStatus, setWeeklyStatus] = useState<WeeklyStatus | null>(null)
  const [lastGeneratedSettings, setLastGeneratedSettings] = useState<WorkoutSettings | null>(null)
  const generationVariantRef = useRef(0)

  useEffect(() => {
    const storedUrl = getStoredApiUrl()
    setApiUrl(storedUrl)
  }, [])

  const handleConnect = useCallback(() => {
    const storedUrl = getStoredApiUrl()
    setApiUrl(storedUrl)
    setState("idle")
    setWorkout(null)
    setWeeklyStatus(null)
    setLastGeneratedSettings(null)
    setErrorMessage("")
    generationVariantRef.current = 0
  }, [])

  const handleDisconnect = useCallback(() => {
    clearStoredApiUrl()
    setApiUrl(null)
    setState("idle")
    setWorkout(null)
    setWeeklyStatus(null)
    setLastGeneratedSettings(null)
    setErrorMessage("")
    generationVariantRef.current = 0
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!apiUrl) return

    const currentSettings = { ...settings }
    const variantIndex = generationVariantRef.current
    generationVariantRef.current += 1

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
        trainingFocus: currentSettings.trainingFocus,
        sessionLength: currentSettings.sessionLength,
        equipment: currentSettings.equipment,
        includeAbs: currentSettings.includeAbs,
        variantIndex,
      })

      const legacyWorkout = mapRenderedWorkoutToLegacy(renderedWorkout)

      setWorkout(legacyWorkout)
      setWeeklyStatus(weeklyStatus)
      setLastGeneratedSettings(currentSettings)
      setState("success")
    } catch (error) {
      setState("error")
      setWeeklyStatus(null)
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
    if (!weeklyStatus || !lastGeneratedSettings) return

    setWorkout((prev) => {
      if (!prev) return prev

      const currentExercise = prev.exercises.find((exercise) => exercise.exercise_id === exerciseId)
      if (!currentExercise) return prev

      const usedExerciseIds = prev.exercises
        .filter((exercise) => exercise.exercise_id !== exerciseId)
        .map((exercise) => exercise.exercise_id)

      const swapOptions = getExerciseSwapOptions(
        currentExercise.exercise_id,
        usedExerciseIds,
        lastGeneratedSettings.equipment,
      )

      const preferredOptions = swapOptions.filter(
        (candidate) => candidate.exercise_id !== currentExercise.last_swapped_from_id,
      )

      const replacement = preferredOptions[0] ?? swapOptions[0]

      if (!replacement) {
        return prev
      }

      return {
        ...prev,
        exercises: prev.exercises.map((exercise) =>
          exercise.exercise_id === exerciseId
            ? mapSwapCandidateToLegacy(currentExercise, replacement, weeklyStatus)
            : exercise,
        ),
      }
    })
  }, [lastGeneratedSettings, weeklyStatus])

  if (!apiUrl) {
    return <ConnectSheet onConnect={handleConnect} />
  }

  return (
    <div className="app-shell min-h-screen bg-background">
      <header className="app-header border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 py-4 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3 sm:gap-4">
              <Image
                src="/co2-logo-transparent.png"
                alt="CO2 logo"
                width={1024}
                height={1024}
                className="h-16 w-auto shrink-0 sm:h-[4.5rem]"
                priority
              />
              <div className="min-w-0 pt-1">
                <div className="mb-1.5">
                  <h1 className="font-display text-[1.55rem] font-semibold leading-none tracking-[-0.055em] text-foreground sm:text-[1.75rem]">
                    <span className="text-primary">CO2</span> Workout Generator
                  </h1>
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                  Smarter strength workouts guided by your recovery, progression, and training
                  consistency.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:justify-end">
              <div className="meta-pill meta-pill-accent inline-flex items-center gap-2 px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.08em] uppercase">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                Training Data Connected
              </div>

              <button
                onClick={handleDisconnect}
                className="action-pill inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                Change Sheet
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main container mx-auto px-4 py-8 md:py-10">
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

          <aside className="lg:sticky lg:top-8 lg:self-start lg:flex lg:justify-end">
            <CoachPanel weeklyStatus={weeklyStatus} />
          </aside>
        </div>
      </main>
    </div>
  )
}
