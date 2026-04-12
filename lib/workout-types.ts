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
  score_band: "green" | "yellow" | "red"
  status: string
  reason: string
  volume_mode: string
}

export interface ProgressionSummary {
  primary_goal: string
  week_strategy: string
  load_bias: string
}

export interface Exercise {
  exercise_id: string
  name: string
  category: string
  movement_type: string
  primary_muscle: string
  secondary_muscle: string
  equipment: string
  sets: number
  reps: string
  rest: string
  effort_target: string
  cue: string
  progression: string
  media_key: string
  substitution_ids: string[]
  is_abs_finisher: boolean
  tips?: string[]
}

export interface Workout {
  session_name: string
  focus: string
  estimated_duration: string
  readiness: Readiness
  coach_message: string
  include_abs: boolean
  progression_summary: ProgressionSummary
  exercises: Exercise[]
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export type CoachAction = 
  | "swap-exercise"
  | "explain-movement"
  | "adjust-intensity"
  | "shorten-workout"
  | "equipment-alternative"
