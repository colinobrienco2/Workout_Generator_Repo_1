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
  volume_mode: "Push" | "Maintain" | "Pullback" | "Deload"
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
