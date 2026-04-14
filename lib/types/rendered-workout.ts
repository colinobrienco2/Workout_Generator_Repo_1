export interface RenderedExercise {
  exercise_id: string
  name: string
  category: string
  movement_type: string
  primary_muscle: string
  secondary_muscle?: string
  equipment: string
  sets: number
  reps: string
  rest: string
  effort_target?: string
  cue?: string
  progression: string
  media_key?: string
  substitution_ids?: string[]
  allowed_swap_ids?: string[]
  slot_id: string
  is_abs_finisher?: boolean
  tips?: string[]
}

export interface RenderedWorkout {
  session_name: string
  focus: string
  estimated_duration: string
  readiness: {
    status: string
    reason: string
    volume_mode: string
    score_band: string
  }
  coach_message: string
  include_abs: boolean
  progression_summary: {
    progression_focus: string
    week_strategy: string
    calorie_adjustment: number
    deload_flag: boolean
  }
  exercises: RenderedExercise[]
}
