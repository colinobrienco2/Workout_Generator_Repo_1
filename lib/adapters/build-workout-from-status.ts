import type { Equipment, MuscleGroup, SessionLength, TrainingFocus } from "@/lib/workout-types"
import type { WeeklyStatus } from "@/lib/types/weekly-status"
import type { ExerciseLibraryItem } from "@/lib/types/exercise"
import type { RenderedExercise, RenderedWorkout } from "@/lib/types/rendered-workout"
import chestTricepsExercises from "@/data/exercises/chest-triceps.json"
import backBicepsExercises from "@/data/exercises/back-biceps.json"
import legsShouldersExercises from "@/data/exercises/legs-shoulders.json"
import absCoreExercises from "@/data/exercises/abs-core.json"

const muscleSlotTemplates: Record<MuscleGroup, Record<SessionLength, string[]>> = {
  chest: {
    short: ["chest_primary", "chest_secondary"],
    medium: ["chest_primary", "chest_secondary", "chest_accessory"],
    long: ["chest_primary", "chest_secondary", "chest_accessory"],
  },
  back: {
    short: ["back_vertical", "back_row"],
    medium: ["back_vertical", "back_row", "back_accessory"],
    long: ["back_vertical", "back_row", "back_accessory"],
  },
  legs: {
    short: ["legs_primary", "legs_secondary"],
    medium: ["legs_primary", "legs_secondary", "legs_accessory"],
    long: ["legs_primary", "legs_secondary", "legs_accessory"],
  },
  shoulders: {
    short: ["shoulders_primary", "shoulders_lateral"],
    medium: ["shoulders_primary", "shoulders_lateral", "shoulders_secondary"],
    long: ["shoulders_primary", "shoulders_lateral", "shoulders_secondary"],
  },
  biceps: {
    short: ["biceps_main", "biceps_secondary"],
    medium: ["biceps_main", "biceps_secondary", "biceps_accessory"],
    long: ["biceps_main", "biceps_secondary", "biceps_accessory"],
  },
  triceps: {
    short: ["triceps_main", "triceps_iso"],
    medium: ["triceps_main", "triceps_secondary", "triceps_iso"],
    long: ["triceps_main", "triceps_secondary", "triceps_iso"],
  },
}

const legacyFocusMuscles: Record<TrainingFocus, [MuscleGroup, MuscleGroup]> = {
  "chest-triceps": ["chest", "triceps"],
  "back-biceps": ["back", "biceps"],
  "legs-shoulders": ["legs", "shoulders"],
}

const allExercises = [
  ...(chestTricepsExercises as ExerciseLibraryItem[]),
  ...(backBicepsExercises as ExerciseLibraryItem[]),
  ...(legsShouldersExercises as ExerciseLibraryItem[]),
] as ExerciseLibraryItem[]

const equipmentModeMap: Record<Equipment, string[]> = {
  "full-gym": ["full_gym"],
  "dumbbell-only": ["dumbbell_only", "hotel_gym"],
  bodyweight: ["bodyweight", "hotel_gym", "dumbbell_only"],
}

const durationLabels: Record<SessionLength, string> = {
  short: "35-45 min",
  medium: "50-60 min",
  long: "70-80 min",
}

function getFallbackSecondaryMuscle(primaryMuscle: MuscleGroup): MuscleGroup {
  return primaryMuscle === "triceps" ? "chest" : "triceps"
}

function normalizeSelectedMuscles(
  primaryMuscle: MuscleGroup,
  secondaryMuscle: MuscleGroup,
): [MuscleGroup, MuscleGroup] {
  if (primaryMuscle === secondaryMuscle) {
    return [primaryMuscle, getFallbackSecondaryMuscle(primaryMuscle)]
  }

  return [primaryMuscle, secondaryMuscle]
}

function getMusclesFromOptions(options: {
  trainingFocus?: TrainingFocus
  primaryMuscle?: MuscleGroup
  secondaryMuscle?: MuscleGroup
}): [MuscleGroup, MuscleGroup] {
  if (options.primaryMuscle && options.secondaryMuscle) {
    return normalizeSelectedMuscles(options.primaryMuscle, options.secondaryMuscle)
  }

  if (options.trainingFocus) {
    return legacyFocusMuscles[options.trainingFocus]
  }

  return ["chest", "triceps"]
}

function getSlotTemplateForMuscles(
  primaryMuscle: MuscleGroup,
  secondaryMuscle: MuscleGroup,
  sessionLength: SessionLength,
): string[] {
  return [
    ...muscleSlotTemplates[primaryMuscle][sessionLength],
    ...muscleSlotTemplates[secondaryMuscle][sessionLength],
  ]
}

function getFocusLabel(primaryMuscle: MuscleGroup, secondaryMuscle: MuscleGroup): string {
  return `${titleCase(primaryMuscle)} + ${titleCase(secondaryMuscle)}`
}

function matchesSlot(exercise: ExerciseLibraryItem, slotId: string): boolean {
  const tags = exercise.slot_tags ?? []

  const has = (value: string) => tags.includes(value)

  switch (slotId) {
    case "chest_primary":
      return has("chest_slot") && has("primary_compound")
    case "chest_secondary":
      return has("chest_slot") && has("secondary_compound")
    case "chest_accessory":
      return has("chest_slot") && (has("accessory") || has("isolation"))
    case "triceps_main":
      return has("triceps_slot") && (has("primary_compound") || has("secondary_compound"))
    case "triceps_secondary":
      return has("triceps_slot") && has("accessory")
    case "triceps_iso":
      return has("triceps_slot") && has("isolation")
    case "back_vertical":
      return has("back_slot") && exercise.movement_type === "vertical_pull"
    case "back_row":
      return has("back_slot") && exercise.movement_type === "horizontal_pull"
    case "back_accessory":
      return has("back_slot") && (has("accessory") || has("isolation"))
    case "biceps_main":
      return has("biceps_slot") && has("primary_compound")
    case "biceps_secondary":
      return has("biceps_slot") && has("secondary_compound")
    case "biceps_accessory":
      return has("biceps_slot") && (has("accessory") || has("isolation"))
    case "legs_primary":
      return has("legs_slot") && has("primary_compound")
    case "legs_secondary":
      return has("legs_slot") && has("secondary_compound")
    case "legs_accessory":
      return has("legs_slot") && (has("accessory") || has("isolation"))
    case "shoulders_primary":
      return has("shoulders_slot") && (has("primary_compound") || has("secondary_compound")) && exercise.movement_type === "vertical_press"
    case "shoulders_lateral":
      return has("shoulders_slot") && exercise.movement_type === "raise"
    case "shoulders_secondary":
      return has("shoulders_slot") && (has("accessory") || has("secondary_compound")) && exercise.movement_type !== "raise"
    default:
      return false
  }
}

function getPrescription(slotId: string, volumeMode: WeeklyStatus["volume_mode"], deloadFlag: boolean) {
  const base: Record<string, { sets: number; reps: string; rest: string; effort: string; category: string }> = {
    chest_primary: { sets: 4, reps: "6-8", rest: "2-3 min", effort: "RPE 8", category: "Primary Compound" },
    chest_secondary: { sets: 3, reps: "8-10", rest: "2 min", effort: "RPE 7-8", category: "Secondary Compound" },
    chest_accessory: { sets: 3, reps: "10-15", rest: "60-90 sec", effort: "RIR 2", category: "Accessory" },
    triceps_main: { sets: 3, reps: "8-10", rest: "90 sec", effort: "RPE 7-8", category: "Main Triceps" },
    triceps_secondary: { sets: 3, reps: "10-12", rest: "60-90 sec", effort: "RIR 2", category: "Accessory" },
    triceps_iso: { sets: 2, reps: "12-15", rest: "60 sec", effort: "RIR 1-2", category: "Isolation" },
    back_vertical: { sets: 3, reps: "8-10", rest: "2 min", effort: "RPE 7-8", category: "Primary Pull" },
    back_row: { sets: 3, reps: "8-10", rest: "2 min", effort: "RPE 7-8", category: "Row" },
    back_accessory: { sets: 3, reps: "10-15", rest: "60-90 sec", effort: "RIR 2", category: "Accessory" },
    biceps_main: { sets: 3, reps: "8-10", rest: "60-90 sec", effort: "RPE 7-8", category: "Main Curl" },
    biceps_secondary: { sets: 3, reps: "10-12", rest: "60 sec", effort: "RIR 2", category: "Secondary Curl" },
    biceps_accessory: { sets: 2, reps: "12-15", rest: "45-60 sec", effort: "RIR 1-2", category: "Accessory" },
    legs_primary: { sets: 4, reps: "6-8", rest: "2-3 min", effort: "RPE 8", category: "Primary Compound" },
    legs_secondary: { sets: 3, reps: "8-10", rest: "2 min", effort: "RPE 7-8", category: "Secondary Compound" },
    legs_accessory: { sets: 3, reps: "10-15", rest: "60-90 sec", effort: "RIR 2", category: "Accessory" },
    shoulders_primary: { sets: 3, reps: "8-10", rest: "90 sec", effort: "RPE 7-8", category: "Primary Press" },
    shoulders_lateral: { sets: 3, reps: "12-15", rest: "45-60 sec", effort: "RIR 1-2", category: "Lateral Raise" },
    shoulders_secondary: { sets: 2, reps: "12-15", rest: "45-60 sec", effort: "RIR 2", category: "Accessory" },
    abs_finisher: { sets: 3, reps: "12-15", rest: "45-60 sec", effort: "RIR 2", category: "Finisher" },
  }

  const value = { ...base[slotId] }

  if (volumeMode === "Push" && (slotId.includes("primary") || slotId.includes("main"))) {
    value.sets += 1
  }

  if (volumeMode === "Pullback") {
    value.sets = Math.max(2, value.sets - 1)
  }

  if (deloadFlag) {
    value.sets = Math.max(2, value.sets - 1)
    value.reps = value.reps.includes("-") ? value.reps.split("-")[0] + "-" + value.reps.split("-")[1] : value.reps
    value.effort = "RIR 3"
  }

  return value
}

export function titleCase(value: string): string {
  return value
    .split(/[_\- ]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function buildProgressionNote(exercise: ExerciseLibraryItem, weeklyStatus: WeeklyStatus): string {
  const method = exercise.coaching?.default_progression_method ?? "add_reps"

  if (weeklyStatus.deload_flag) return "Deload week: keep form sharp and leave extra reps in reserve."

  switch (method) {
    case "add_weight":
      return "When all sets look clean, add a small weight increase next session."
    case "add_reps":
      return "Progress by adding reps before increasing load."
    case "improve_control":
      return "Keep tempo controlled and earn load increases with better execution."
    default:
      return weeklyStatus.progression_focus
  }
}

export function getTips(exercise: ExerciseLibraryItem, weeklyStatus: WeeklyStatus): string[] {
  return [
    exercise.coaching?.default_cue ?? "Focus on smooth, repeatable execution.",
    weeklyStatus.progression_focus,
    weeklyStatus.training_note,
  ]
}

export function normalizeEquipment(equipment: string | string[]): string {
  if (Array.isArray(equipment)) return equipment.join(", ")
  return titleCase(equipment)
}

function chooseExercise(
  library: ExerciseLibraryItem[],
  slotId: string,
  weeklyStatus: WeeklyStatus,
  equipmentMode: Equipment,
  usedIds: Set<string>,
  sessionLength: SessionLength,
  variantIndex: number,
): ExerciseLibraryItem | undefined {
  const allowedModes = equipmentModeMap[equipmentMode]

  const candidates = library
    .filter((exercise) => matchesSlot(exercise, slotId))
    .filter((exercise) => !usedIds.has(exercise.exercise_id))
    .filter((exercise) => {
      const modes = exercise.constraints?.allowed_equipment_modes ?? []
      return modes.length === 0 || modes.some((mode) => allowedModes.includes(mode))
    })
    .filter((exercise) => {
      const preferred = exercise.constraints?.preferred_session_lengths ?? []
      return preferred.length === 0 || preferred.includes(sessionLength)
    })
    .filter((exercise) => !(weeklyStatus.readiness_status === "Low" && exercise.constraints?.avoid_when_low_readiness))
    .filter((exercise) => !(weeklyStatus.deload_flag && exercise.constraints?.avoid_on_deload))
    .sort((a, b) => Number(Boolean(b.is_staple)) - Number(Boolean(a.is_staple)) || a.name.localeCompare(b.name))

  if (candidates.length === 0) return undefined

  return candidates[variantIndex % candidates.length]
}

export function buildWorkoutFromStatus(
  weeklyStatus: WeeklyStatus,
  options: {
    trainingFocus?: TrainingFocus
    primaryMuscle?: MuscleGroup
    secondaryMuscle?: MuscleGroup
    sessionLength: SessionLength
    equipment: Equipment
    includeAbs: boolean
    variantIndex?: number
  },
): RenderedWorkout {
  const [primaryMuscle, secondaryMuscle] = getMusclesFromOptions(options)
  const library = allExercises
  const slotIds = getSlotTemplateForMuscles(primaryMuscle, secondaryMuscle, options.sessionLength)
  const usedIds = new Set<string>()
  const variantIndex = options.variantIndex ?? 0
  const focusLabel = getFocusLabel(primaryMuscle, secondaryMuscle)

  const exercises = slotIds
    .map<RenderedExercise | null>((slotId, slotIndex) => {
      const selected = chooseExercise(
        library,
        slotId,
        weeklyStatus,
        options.equipment,
        usedIds,
        options.sessionLength,
        variantIndex + slotIndex,
      )
      if (!selected) return null
      usedIds.add(selected.exercise_id)
      const prescription = getPrescription(slotId, weeklyStatus.volume_mode, weeklyStatus.deload_flag)
      return {
        exercise_id: selected.exercise_id,
        name: selected.name,
        category: prescription.category,
        movement_type: titleCase(selected.movement_type),
        primary_muscle: titleCase(selected.primary_muscle),
        secondary_muscle: Array.isArray(selected.secondary_muscle)
          ? selected.secondary_muscle.map(titleCase).join(", ")
          : selected.secondary_muscle ? titleCase(selected.secondary_muscle) : undefined,
        equipment: normalizeEquipment(selected.equipment),
        sets: prescription.sets,
        reps: prescription.reps,
        rest: prescription.rest,
        effort_target: prescription.effort,
        cue: selected.coaching?.default_cue ?? weeklyStatus.training_note,
        progression: buildProgressionNote(selected, weeklyStatus),
        media_key: selected.media_key,
        substitution_ids: selected.substitution_ids ?? [],
        allowed_swap_ids: selected.substitution_ids ?? [],
        slot_id: slotId,
        is_abs_finisher: false,
        tips: getTips(selected, weeklyStatus),
      } satisfies RenderedExercise
    })
    .filter((exercise): exercise is RenderedExercise => Boolean(exercise))

  if (options.includeAbs) {
    const allowedModes = equipmentModeMap[options.equipment]
    const absCandidates = (absCoreExercises as ExerciseLibraryItem[])
      .filter((exercise) => (exercise.constraints?.allowed_equipment_modes ?? []).some((mode) => allowedModes.includes(mode)))
      .filter((exercise) => !(weeklyStatus.deload_flag && exercise.constraints?.avoid_on_deload))
      .sort((a, b) => Number(Boolean(b.is_staple)) - Number(Boolean(a.is_staple)) || a.name.localeCompare(b.name))

    const absExercise =
      absCandidates.length > 0
        ? absCandidates[variantIndex % absCandidates.length]
        : undefined

    if (absExercise) {
      const prescription = getPrescription("abs_finisher", weeklyStatus.volume_mode, weeklyStatus.deload_flag)
      exercises.push({
        exercise_id: absExercise.exercise_id,
        name: absExercise.name,
        category: prescription.category,
        movement_type: titleCase(absExercise.movement_type),
        primary_muscle: titleCase(absExercise.primary_muscle),
        secondary_muscle: Array.isArray(absExercise.secondary_muscle)
          ? absExercise.secondary_muscle.map(titleCase).join(", ")
          : absExercise.secondary_muscle ? titleCase(absExercise.secondary_muscle) : undefined,
        equipment: normalizeEquipment(absExercise.equipment),
        sets: prescription.sets,
        reps: prescription.reps,
        rest: prescription.rest,
        effort_target: prescription.effort,
        cue: absExercise.coaching?.default_cue ?? "Control the movement and avoid rushing the reps.",
        progression: buildProgressionNote(absExercise, weeklyStatus),
        media_key: absExercise.media_key,
        substitution_ids: absExercise.substitution_ids ?? [],
        allowed_swap_ids: absExercise.substitution_ids ?? [],
        slot_id: "abs_finisher",
        is_abs_finisher: true,
        tips: getTips(absExercise, weeklyStatus),
      })
    }
  }

  return {
    session_name: `${focusLabel} — ${titleCase(weeklyStatus.weekly_strategy_label)}`,
    focus: focusLabel,
    estimated_duration: durationLabels[options.sessionLength],
    readiness: {
      status: weeklyStatus.readiness_status,
      reason: weeklyStatus.trigger_reason,
      volume_mode: weeklyStatus.volume_mode,
      score_band: weeklyStatus.readiness_score_band,
    },
    coach_message: weeklyStatus.coach_notes.replace(/\n/g, "\n"),
    include_abs: options.includeAbs,
    progression_summary: {
      progression_focus: weeklyStatus.progression_focus,
      week_strategy: weeklyStatus.weekly_strategy_label,
      calorie_adjustment: weeklyStatus.calorie_adjustment,
      deload_flag: weeklyStatus.deload_flag,
    },
    exercises,
  }
}
