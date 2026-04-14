import type { WeeklyStatus } from "@/lib/types/weekly-status"
import type { ExerciseLibraryItem } from "@/lib/types/exercise"
import type { RenderedExercise, RenderedWorkout } from "@/lib/types/rendered-workout"
import type { GuidedHelpCatalog, GuidedHelpCategory, GuidedHelpPrompt } from "@/lib/types/guided-help"

export type TrainingFocus = "chest-triceps" | "legs-shoulders" | "back-biceps"
export type SessionLength = "short" | "medium" | "long"
export type Equipment = "full-gym" | "dumbbell-only" | "bodyweight"

export interface WorkoutSettings {
  trainingFocus: TrainingFocus
  sessionLength: SessionLength
  equipment: Equipment
  includeAbs: boolean
}

export interface Readiness {
  score_band: string
  status: string
  reason: string
  volume_mode: string
}

export interface ProgressionSummary {
  progression_focus: string
  week_strategy: string
  calorie_adjustment: number
  deload_flag: boolean
}

export type Exercise = RenderedExercise
export type Workout = RenderedWorkout

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export { type WeeklyStatus, type ExerciseLibraryItem, type RenderedExercise, type RenderedWorkout, type GuidedHelpCatalog, type GuidedHelpCategory, type GuidedHelpPrompt }
