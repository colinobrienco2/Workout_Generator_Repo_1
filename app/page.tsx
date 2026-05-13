"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { signOut, useSession } from "next-auth/react"
import ConnectSheet from "@/components/connect-sheet"
import {
  TodayCheckInCard,
  type CheckInValues,
} from "@/components/tracker/TodayCheckInCard"
import { WorkoutSettingsForm } from "@/components/workout/WorkoutSettingsForm"
import { WorkoutCard } from "@/components/workout/WorkoutCard"
import { CoachPanel } from "@/components/workout/CoachPanel"
import { EmptyState } from "@/components/workout/EmptyState"
import { LoadingState } from "@/components/workout/LoadingState"
import { ErrorState } from "@/components/workout/ErrorState"
import { Button } from "@/components/ui/button"
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
type TrackerConnectionMode = "none" | "manual" | "google"

interface TrackerMetadataResponse {
  trackerMetadata?: {
    trackerConnectionMode: TrackerConnectionMode
    googleTrackerSpreadsheetId: string | null
    manualAppsScriptUrlFallback: string | null
  }
}

interface TrackerProvisioningResult {
  trackerConnectionMode: TrackerConnectionMode
  googleTrackerSpreadsheetId: string | null
}

interface DailyLogResponse {
  checkIn?: {
    date: string
    bodyweight: string | null
    calories: string | null
    sleep: number
    soreness: number
    energy: number
    stress: number
    workoutCompleted: "yes" | "no"
    notes: string
  }
  synced?: boolean
  rowNumber?: number
  operation?: "updated" | "appended"
  error?: string
}

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
  const { data: session, status: sessionStatus } = useSession()
  const [apiUrl, setApiUrl] = useState<string | null>(null)
  const [isManagingTracker, setIsManagingTracker] = useState(false)
  const [trackerConnectionMode, setTrackerConnectionMode] = useState<TrackerConnectionMode>("none")
  const [googleTrackerSpreadsheetId, setGoogleTrackerSpreadsheetId] = useState<string | null>(null)
  const [state, setState] = useState<AppState>("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [savedCheckIn, setSavedCheckIn] = useState<CheckInValues | null>(null)
  const [isSavingCheckIn, setIsSavingCheckIn] = useState(false)
  const [checkInError, setCheckInError] = useState("")
  const [isCheckInSynced, setIsCheckInSynced] = useState(false)
  const [settings, setSettings] = useState<WorkoutSettings>({
    trainingFocus: "chest-triceps",
    sessionLength: "medium",
    equipment: "full-gym",
    includeAbs: true,
  })
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [weeklyStatus, setWeeklyStatus] = useState<WeeklyStatus | null>(null)
  const [lastGeneratedSettings, setLastGeneratedSettings] = useState<WorkoutSettings | null>(null)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const generationVariantRef = useRef(0)
  const selectedExercise =
    workout?.exercises.find((exercise) => exercise.exercise_id === selectedExerciseId) ?? null
  const hasGoogleSession = sessionStatus === "authenticated" && Boolean(session?.user?.email)

  useEffect(() => {
    const storedUrl = getStoredApiUrl()
    setApiUrl(storedUrl)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadTrackerMetadata() {
      if (sessionStatus !== "authenticated") {
        if (isMounted) {
          setTrackerConnectionMode("none")
          setGoogleTrackerSpreadsheetId(null)
        }
        return
      }

      try {
        const response = await fetch("/api/tracker/metadata", { cache: "no-store" })
        if (!response.ok) return

        const payload = (await response.json()) as TrackerMetadataResponse
        if (isMounted) {
          setTrackerConnectionMode(payload.trackerMetadata?.trackerConnectionMode ?? "none")
          setGoogleTrackerSpreadsheetId(payload.trackerMetadata?.googleTrackerSpreadsheetId ?? null)
        }
      } catch {
        if (isMounted) {
          setTrackerConnectionMode("none")
          setGoogleTrackerSpreadsheetId(null)
        }
      }
    }

    void loadTrackerMetadata()

    return () => {
      isMounted = false
    }
  }, [sessionStatus])

  const handleConnect = useCallback(() => {
    const storedUrl = getStoredApiUrl()
    setApiUrl(storedUrl)
    setIsManagingTracker(false)
    setState("idle")
    setWorkout(null)
    setWeeklyStatus(null)
    setLastGeneratedSettings(null)
    setSelectedExerciseId(null)
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
    setSelectedExerciseId(null)
    setErrorMessage("")
    setSavedCheckIn(null)
    setCheckInError("")
    setIsCheckInSynced(false)
    generationVariantRef.current = 0
  }, [])

  const handleGoogleTrackerProvisioned = useCallback(
    ({ trackerConnectionMode, googleTrackerSpreadsheetId }: TrackerProvisioningResult) => {
      setTrackerConnectionMode(trackerConnectionMode)
      setGoogleTrackerSpreadsheetId(googleTrackerSpreadsheetId)
      setIsManagingTracker(false)
      setState("idle")
      setWorkout(null)
      setWeeklyStatus(null)
      setLastGeneratedSettings(null)
      setSelectedExerciseId(null)
      setErrorMessage("")
      generationVariantRef.current = 0
    },
    []
  )

  const getLocalTodayDate = useCallback(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }, [])

  const handleSaveCheckIn = useCallback(async (values: CheckInValues) => {
    const shouldUseGoogleTracker =
      trackerConnectionMode === "google" && Boolean(googleTrackerSpreadsheetId)

    setCheckInError("")

    if (!shouldUseGoogleTracker) {
      setSavedCheckIn(values)
      setIsCheckInSynced(false)
      return { success: true }
    }

    setIsSavingCheckIn(true)

    try {
      const response = await fetch("/api/tracker/daily-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: getLocalTodayDate(),
          bodyweight: values.bodyweight.trim() ? values.bodyweight.trim() : null,
          calories: values.calories.trim() ? values.calories.trim() : null,
          sleep: Number(values.sleep),
          soreness: Number(values.soreness),
          energy: Number(values.energy),
          stress: Number(values.stress),
          workoutCompleted: values.workoutCompleted,
          notes: values.notes,
        }),
      })

      const payload = (await response.json().catch(() => null)) as DailyLogResponse | null

      if (!response.ok || !payload?.checkIn || !payload.synced) {
        throw new Error(payload?.error || "Could not save daily log to your Google tracker.")
      }

      setSavedCheckIn({
        bodyweight: payload.checkIn.bodyweight ?? "",
        calories: payload.checkIn.calories ?? "",
        sleep: String(payload.checkIn.sleep) as CheckInValues["sleep"],
        soreness: String(payload.checkIn.soreness) as CheckInValues["soreness"],
        energy: String(payload.checkIn.energy) as CheckInValues["energy"],
        stress: String(payload.checkIn.stress) as CheckInValues["stress"],
        workoutCompleted: payload.checkIn.workoutCompleted,
        notes: payload.checkIn.notes,
      })
      setIsCheckInSynced(true)
      return { success: true }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not save daily log to your Google tracker."

      setCheckInError(message)
      return { success: false, error: message }
    } finally {
      setIsSavingCheckIn(false)
    }
  }, [getLocalTodayDate, googleTrackerSpreadsheetId, trackerConnectionMode])

  const handleGenerate = useCallback(async () => {
    const shouldUseGoogleTracker =
      trackerConnectionMode === "google" && Boolean(googleTrackerSpreadsheetId)

    if (!shouldUseGoogleTracker && !apiUrl) return

    const currentSettings = { ...settings }
    const variantIndex = generationVariantRef.current
    generationVariantRef.current += 1

    setState("loading")
    setErrorMessage("")
    setSelectedExerciseId(null)

    try {
      const response = await fetch(
        shouldUseGoogleTracker
          ? "/api/tracker/weekly-latest"
          : `/api/weekly-latest?url=${encodeURIComponent(apiUrl ?? "")}`
      )

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(
          payload?.error ||
            (shouldUseGoogleTracker
              ? "Could not load weekly status from your provisioned Google tracker."
              : "Could not load weekly status from your Apps Script URL.")
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
  }, [apiUrl, googleTrackerSpreadsheetId, settings, trackerConnectionMode])

  const handleRetry = useCallback(() => {
    handleGenerate()
  }, [handleGenerate])

  const handleSelectExercise = useCallback((exerciseId: string) => {
    setSelectedExerciseId((prev) => (prev === exerciseId ? null : exerciseId))
  }, [])

  const handleSwapExercise = useCallback((exerciseId: string) => {
    if (!weeklyStatus || !lastGeneratedSettings) return

    let nextSelectedExerciseId: string | null | undefined

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

      if (selectedExerciseId === exerciseId) {
        nextSelectedExerciseId = replacement.exercise_id
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

    if (nextSelectedExerciseId) {
      setSelectedExerciseId(nextSelectedExerciseId)
    }
  }, [lastGeneratedSettings, selectedExerciseId, weeklyStatus])

  const hasDirectGoogleTracker =
    trackerConnectionMode === "google" && Boolean(googleTrackerSpreadsheetId)

  if (isManagingTracker || (!apiUrl && !hasDirectGoogleTracker)) {
    return (
      <ConnectSheet
        onConnect={handleConnect}
        onGoogleTrackerProvisioned={handleGoogleTrackerProvisioned}
        onBack={apiUrl || hasDirectGoogleTracker ? () => setIsManagingTracker(false) : undefined}
      />
    )
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
                {trackerConnectionMode === "google" ? "Google Tracker Created" : "Tracker: Manual URL"}
              </div>

              {hasGoogleSession ? (
                <div className="meta-pill inline-flex items-center gap-2 px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.08em] uppercase">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  Google connected
                </div>
              ) : null}

              <button
                onClick={() => setIsManagingTracker(true)}
                className="action-pill inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                Manage Tracker
              </button>

              {hasGoogleSession ? (
                <button
                  onClick={() => void signOut({ callbackUrl: "/" })}
                  className="action-pill inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
                >
                  Sign Out Google
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="app-main container mx-auto px-4 py-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)_380px]">
          <aside className="lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:pr-2">
            <div className="coach-scroll space-y-5 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:overscroll-contain">
              <TodayCheckInCard
                savedCheckIn={savedCheckIn}
                onSave={handleSaveCheckIn}
                isSaving={isSavingCheckIn}
                saveError={checkInError}
                isGoogleTracker={hasDirectGoogleTracker}
                synced={isCheckInSynced}
              />
              <WorkoutSettingsForm
                settings={settings}
                onSettingsChange={setSettings}
              />
            </div>
          </aside>

          <section className="min-w-0">
            <div className="brand-panel mb-6 rounded-2xl border border-border/50 px-5 py-4 shadow-sm md:mb-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-foreground">Workout Builder</p>
                  <p className="text-sm text-muted-foreground">
                    Adjust your settings, then generate a fresh session.
                  </p>
                </div>

                <Button
                  className="w-full shrink-0 px-6 focus-visible:ring-primary/24 sm:w-auto hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.26),0_22px_30px_-18px_rgba(58,119,255,0.72),0_16px_24px_-18px_rgba(15,23,42,0.26)] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_18px_-16px_rgba(58,119,255,0.5)]"
                  onClick={handleGenerate}
                  disabled={state === "loading"}
                >
                  {state === "loading" ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    "Generate Workout"
                  )}
                </Button>
              </div>
            </div>

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
                selectedExerciseId={selectedExerciseId}
                onSelectExercise={handleSelectExercise}
              />
            )}
          </section>

          <aside className="lg:col-span-2 lg:flex lg:justify-center xl:col-span-1 xl:sticky xl:top-8 xl:self-start xl:justify-end">
            <CoachPanel
              weeklyStatus={weeklyStatus}
              selectedExercise={selectedExercise}
            />
          </aside>
        </div>
      </main>
    </div>
  )
}
