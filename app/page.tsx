"use client"

import { useState, useCallback } from "react"
import { WorkoutSettingsForm } from "@/components/workout/WorkoutSettingsForm"
import { WorkoutCard } from "@/components/workout/WorkoutCard"
import { CoachPanel } from "@/components/workout/CoachPanel"
import { EmptyState } from "@/components/workout/EmptyState"
import { LoadingState } from "@/components/workout/LoadingState"
import { ErrorState } from "@/components/workout/ErrorState"
import { generateWorkout } from "@/lib/mock-data"
import type { WorkoutSettings, Workout } from "@/lib/workout-types"
import { Dumbbell } from "lucide-react"

type AppState = "idle" | "loading" | "success" | "error"

export default function WorkoutGeneratorPage() {
  const [state, setState] = useState<AppState>("idle")
  const [settings, setSettings] = useState<WorkoutSettings>({
    trainingFocus: "chest-triceps",
    sessionLength: "medium",
    equipment: "full-gym",
    includeAbs: true
  })
  const [workout, setWorkout] = useState<Workout | null>(null)

  const handleGenerate = useCallback(() => {
    setState("loading")
    
    // Simulate loading delay
    setTimeout(() => {
      try {
        const generatedWorkout = generateWorkout(settings)
        setWorkout(generatedWorkout)
        setState("success")
      } catch {
        setState("error")
      }
    }, 1500)
  }, [settings])

  const handleSwapExercise = useCallback((exerciseId: string) => {
    if (!workout) return
    
    // Simple mock swap - just update the exercise name
    setWorkout(prev => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.exercise_id === exerciseId) {
            return {
              ...ex,
              name: ex.name + " (Swapped)",
              cue: "Alternative movement selected to match your preferences"
            }
          }
          return ex
        })
      }
    })
  }, [workout])

  const handleRetry = useCallback(() => {
    handleGenerate()
  }, [handleGenerate])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Workout Generator</h1>
              <p className="text-sm text-muted-foreground">
                Generate a structured workout and refine it with guided coaching
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[340px_1fr_380px]">
          {/* Settings sidebar */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <WorkoutSettingsForm
              settings={settings}
              onSettingsChange={setSettings}
              onGenerate={handleGenerate}
              isGenerating={state === "loading"}
            />
          </aside>

          {/* Workout output */}
          <section className="min-w-0">
            {state === "idle" && <EmptyState />}
            {state === "loading" && <LoadingState />}
            {state === "error" && <ErrorState onRetry={handleRetry} />}
            {state === "success" && workout && (
              <WorkoutCard
                workout={workout}
                onSwapExercise={handleSwapExercise}
              />
            )}
          </section>

          {/* Coach panel */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <CoachPanel />
          </aside>
        </div>
      </main>
    </div>
  )
}
