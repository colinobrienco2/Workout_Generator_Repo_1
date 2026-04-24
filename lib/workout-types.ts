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
  allowed_swap_ids?: string[]
  slot_id: string
  is_abs_finisher: boolean
  last_swapped_from_id?: string
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


export interface WeeklyStatus {
  program_week_start: string
  program_week: number
  program_week_key: string
  avg_recovery: number
  avg_weight: number
  w_w_weight_change: number
  days_logged: number
  workouts_completed: number
  readiness_status: "High" | "Moderate" | "Low" | "Deload" | "Low Data"
  readiness_score_band: string
  volume_mode: string
  volume_adjustment_pct: number
  calorie_adjustment: number
  deload_flag: boolean
  progression_focus: string
  weekly_strategy_label: string
  data_quality_flag: string
  trigger_reason: string
  training_note: string
  recovery_note: string
  nutrition_note: string
  coach_notes: string
  system_version: string
}
