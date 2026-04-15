import type { WeeklyStatus, Workout } from "./workout-types"

export async function validateAppsScriptUrl(url: string): Promise<WeeklyStatus> {
  const response = await fetch(`/api/weekly-latest?url=${encodeURIComponent(url)}`)

  if (!response.ok) {
    const errorPayload = await safeParseJson(response)
    throw new Error(errorPayload?.error || "Could not connect to the supplied Apps Script URL")
  }

  return response.json()
}

async function safeParseJson(response: Response): Promise<{ error?: string } | null> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function toTitleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

function mapReadinessBand(status: WeeklyStatus["readiness_status"]): Workout["readiness"]["score_band"] {
  switch (status) {
    case "High":
      return "green"
    case "Moderate":
      return "yellow"
    case "Low":
    case "Deload":
    case "Low Data":
    default:
      return "red"
  }
}

function mapWeeklyStrategyLabel(value: string) {
  if (!value) return "Deterministic weekly strategy"
  return toTitleCase(value)
}

function mapCalorieAdjustment(value: number) {
  if (value > 0) return `Increase calories by ${value}`
  if (value < 0) return `Reduce calories by ${Math.abs(value)}`
  return "Hold calories steady"
}

export function applyWeeklyStatusToWorkout(workout: Workout, weeklyStatus: WeeklyStatus): Workout {
  return {
    ...workout,
    readiness: {
      score_band: mapReadinessBand(weeklyStatus.readiness_status),
      status: weeklyStatus.readiness_status,
      reason: weeklyStatus.trigger_reason || weeklyStatus.recovery_note || "Weekly status imported from your Google Sheet",
      volume_mode: weeklyStatus.volume_mode,
    },
    coach_message: weeklyStatus.coach_notes || workout.coach_message,
    progression_summary: {
      primary_goal: weeklyStatus.progression_focus || workout.progression_summary.primary_goal,
      week_strategy: mapWeeklyStrategyLabel(weeklyStatus.weekly_strategy_label),
      load_bias: mapCalorieAdjustment(weeklyStatus.calorie_adjustment),
    },
  }
}
