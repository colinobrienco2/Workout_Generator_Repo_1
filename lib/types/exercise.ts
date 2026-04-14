export interface ExerciseLibraryItem {
  exercise_id: string
  name: string
  split_tags: string[]
  slot_tags: string[]
  movement_type: string
  primary_muscle: string
  secondary_muscle?: string | string[]
  equipment: string | string[]
  difficulty?: string
  is_staple?: boolean
  media_key?: string
  substitution_ids?: string[]
  constraints?: {
    allowed_equipment_modes?: string[]
    avoid_when_low_readiness?: boolean
    avoid_on_deload?: boolean
    preferred_session_lengths?: string[]
  }
  coaching?: {
    default_cue?: string
    default_progression_method?: string
  }
}
