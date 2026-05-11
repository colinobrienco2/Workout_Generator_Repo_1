import "server-only"

import { z } from "zod"

import type { WeeklyStatus } from "@/lib/types/weekly-status"

const WEEKLY_SUMMARY_SHEET_NAME = "Weekly Summary"

const weeklyStatusSchema = z.object({
  program_week_start: z.string().min(1),
  program_week: z.number(),
  program_week_key: z.string().min(1),
  avg_recovery: z.number(),
  avg_weight: z.number(),
  w_w_weight_change: z.number(),
  days_logged: z.number(),
  workouts_completed: z.number(),
  readiness_status: z.enum(["High", "Moderate", "Low", "Deload", "Low Data"]),
  readiness_score_band: z.string().min(1),
  volume_mode: z.enum(["Push", "Maintain", "Pullback", "Deload"]),
  volume_adjustment_pct: z.number(),
  calorie_adjustment: z.number(),
  deload_flag: z.boolean(),
  progression_focus: z.string().min(1),
  weekly_strategy_label: z.string().min(1),
  data_quality_flag: z.string().min(1),
  trigger_reason: z.string().min(1),
  training_note: z.string().min(1),
  recovery_note: z.string().min(1),
  nutrition_note: z.string().min(1),
  coach_notes: z.string().min(1),
  system_version: z.string().min(1),
})

function normalizeHeader(header: unknown) {
  return String(header ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")
}

function coerceNumber(value: unknown, fieldName: string) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const normalized = value.trim()
    if (normalized) {
      const parsed = Number(normalized)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  throw new Error(`Weekly Summary field "${fieldName}" is not a valid number.`)
}

function coerceBoolean(value: unknown, fieldName: string) {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (normalized === "true") return true
    if (normalized === "false") return false
  }

  throw new Error(`Weekly Summary field "${fieldName}" is not a valid boolean.`)
}

function coerceString(value: unknown) {
  if (value == null) {
    return ""
  }

  return String(value).trim()
}

function buildWeeklyStatusCandidate(row: Record<string, unknown>) {
  return {
    program_week_start: coerceString(row.program_week_start),
    program_week: coerceNumber(row.program_week, "program_week"),
    program_week_key: coerceString(row.program_week_key),
    avg_recovery: coerceNumber(row.avg_recovery, "avg_recovery"),
    avg_weight: coerceNumber(row.avg_weight, "avg_weight"),
    w_w_weight_change: coerceNumber(row.w_w_weight_change, "w_w_weight_change"),
    days_logged: coerceNumber(row.days_logged, "days_logged"),
    workouts_completed: coerceNumber(row.workouts_completed, "workouts_completed"),
    readiness_status: coerceString(row.readiness_status),
    readiness_score_band: coerceString(row.readiness_score_band),
    volume_mode: coerceString(row.volume_mode),
    volume_adjustment_pct: coerceNumber(row.volume_adjustment_pct, "volume_adjustment_pct"),
    calorie_adjustment: coerceNumber(row.calorie_adjustment, "calorie_adjustment"),
    deload_flag: coerceBoolean(row.deload_flag, "deload_flag"),
    progression_focus: coerceString(row.progression_focus),
    weekly_strategy_label: coerceString(row.weekly_strategy_label),
    data_quality_flag: coerceString(row.data_quality_flag),
    trigger_reason: coerceString(row.trigger_reason),
    training_note: coerceString(row.training_note),
    recovery_note: coerceString(row.recovery_note),
    nutrition_note: coerceString(row.nutrition_note),
    coach_notes: coerceString(row.coach_notes),
    system_version: coerceString(row.system_version),
  }
}

export function mapWeeklySummaryValuesToWeeklyStatus(values: unknown[][]): WeeklyStatus {
  if (!Array.isArray(values) || values.length < 2) {
    throw new Error(`Weekly Summary sheet is empty or missing data rows.`)
  }

  const [headerRow, ...dataRows] = values
  const headers = headerRow.map((header) => normalizeHeader(header))
  const latestDataRow = [...dataRows].reverse().find((row) => {
    const firstCell = Array.isArray(row) ? row[0] : undefined
    return firstCell !== "" && firstCell != null
  })

  if (!latestDataRow) {
    throw new Error(`Weekly Summary sheet does not contain a populated weekly row.`)
  }

  const normalizedRow = headers.reduce<Record<string, unknown>>((result, header, index) => {
    if (!header) {
      return result
    }

    result[header] = latestDataRow[index]
    return result
  }, {})

  return weeklyStatusSchema.parse(buildWeeklyStatusCandidate(normalizedRow))
}

export async function readWeeklyStatusFromGoogleSheet(accessToken: string, spreadsheetId: string) {
  const range = encodeURIComponent(WEEKLY_SUMMARY_SHEET_NAME)
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${range}?majorDimension=ROWS`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  )

  const payload = (await response.json().catch(() => null)) as
    | {
        values?: unknown[][]
        error?: {
          code?: number
          message?: string
          status?: string
        }
      }
    | null

  if (!response.ok) {
    const status = payload?.error?.status
    const message = payload?.error?.message ?? "Google Sheets request failed."

    if (response.status === 401) {
      throw new Error("Your Google connection expired. Sign out and reconnect Google, then try again.")
    }

    if (response.status === 403 || status === "PERMISSION_DENIED" || status === "ACCESS_TOKEN_SCOPE_INSUFFICIENT") {
      throw new Error("Google Sheets permission is missing. Sign out and reconnect Google, then try again.")
    }

    if (response.status === 404) {
      if (message.includes(WEEKLY_SUMMARY_SHEET_NAME)) {
        throw new Error(`Missing "${WEEKLY_SUMMARY_SHEET_NAME}" tab in the provisioned tracker.`)
      }

      throw new Error("Provisioned Google tracker sheet was not found.")
    }

    throw new Error(message)
  }

  return mapWeeklySummaryValuesToWeeklyStatus(payload?.values ?? [])
}
