import type { ExerciseLibraryItem } from "@/lib/types/exercise"
import type { Equipment } from "@/lib/workout-types"
import chestTricepsExercises from "@/data/exercises/chest-triceps.json"
import backBicepsExercises from "@/data/exercises/back-biceps.json"
import legsShouldersExercises from "@/data/exercises/legs-shoulders.json"
import absCoreExercises from "@/data/exercises/abs-core.json"

const ALL_EXERCISES = [
  ...chestTricepsExercises,
  ...backBicepsExercises,
  ...legsShouldersExercises,
  ...absCoreExercises,
] as ExerciseLibraryItem[]

const equipmentModeMap: Record<Equipment, string[]> = {
  "full-gym": ["full_gym"],
  "dumbbell-only": ["dumbbell_only", "hotel_gym"],
  bodyweight: ["bodyweight", "hotel_gym", "dumbbell_only"],
}

export function getExerciseSwapOptions(
  exerciseId: string,
  usedExerciseIds: string[],
  equipmentMode: Equipment,
): ExerciseLibraryItem[] {
  const current = ALL_EXERCISES.find((exercise) => exercise.exercise_id === exerciseId)

  if (!current?.substitution_ids?.length) return []

  const allowedModes = equipmentModeMap[equipmentMode]

  return current.substitution_ids
    .map((id) => ALL_EXERCISES.find((candidate) => candidate.exercise_id === id))
    .filter((candidate): candidate is ExerciseLibraryItem => Boolean(candidate))
    .filter((candidate) => !usedExerciseIds.includes(candidate.exercise_id))
    .filter((candidate) => {
      const modes = candidate.constraints?.allowed_equipment_modes ?? []
      return modes.length === 0 || modes.some((mode) => allowedModes.includes(mode))
    })
}
