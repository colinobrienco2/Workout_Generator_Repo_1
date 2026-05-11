import "server-only"

const DAILY_LOG_SHEET_NAME = "Daily Log"
const DAILY_LOG_FIRST_DATA_ROW = 2
const DAILY_LOG_LAST_DATA_ROW = 500
const DAILY_LOG_DATE_RANGE = `${DAILY_LOG_SHEET_NAME}!A${DAILY_LOG_FIRST_DATA_ROW}:A${DAILY_LOG_LAST_DATA_ROW}`

interface DailyLogEntryInput {
  date: string
  bodyweight: string | null
  calories: string | null
  sleep: number
  soreness: number
  energy: number
  stress: number
  workoutCompleted: "yes" | "no"
  notes: string
}

interface GoogleSheetValuesResponse {
  values?: unknown[][]
  updates?: {
    updatedRange?: string
  }
  tableRange?: string
  error?: {
    code?: number
    message?: string
    status?: string
  }
}

function buildDailyLogRow(entry: DailyLogEntryInput) {
  return [
    entry.date,
    entry.bodyweight ?? "",
    entry.calories ?? "",
    entry.sleep,
    entry.soreness,
    entry.energy,
    entry.stress,
    entry.workoutCompleted,
    entry.notes,
  ]
}

async function parseGoogleResponse(response: Response): Promise<GoogleSheetValuesResponse | null> {
  return (await response.json().catch(() => null)) as GoogleSheetValuesResponse | null
}

function handleGoogleSheetsError(response: Response, payload: GoogleSheetValuesResponse | null, missingTabName: string) {
  const status = payload?.error?.status
  const message = payload?.error?.message ?? "Google Sheets request failed."

  if (response.status === 401) {
    throw new Error("Your Google connection expired. Sign out and reconnect Google, then try again.")
  }

  if (
    response.status === 403 ||
    status === "PERMISSION_DENIED" ||
    status === "ACCESS_TOKEN_SCOPE_INSUFFICIENT"
  ) {
    throw new Error("Google Sheets permission is missing. Sign out and reconnect Google, then try again.")
  }

  if (response.status === 404) {
    if (message.includes(missingTabName)) {
      throw new Error(`Missing "${missingTabName}" tab in the provisioned tracker.`)
    }

    throw new Error("Provisioned Google tracker sheet was not found.")
  }

  throw new Error(message)
}

async function readDailyLogDates(accessToken: string, spreadsheetId: string) {
  const range = encodeURIComponent(DAILY_LOG_DATE_RANGE)
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${range}?majorDimension=ROWS`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  )

  const payload = await parseGoogleResponse(response)

  if (!response.ok) {
    handleGoogleSheetsError(response, payload, DAILY_LOG_SHEET_NAME)
  }

  return payload?.values ?? []
}

function normalizeSheetDate(value: unknown) {
  const normalized = String(value ?? "").trim()

  if (!normalized) {
    return ""
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized
  }

  const slashDateMatch = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashDateMatch) {
    const [, month, day, year] = slashDateMatch
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  return normalized
}

async function updateDailyLogRow(
  accessToken: string,
  spreadsheetId: string,
  rowNumber: number,
  values: unknown[]
) {
  const range = encodeURIComponent(`${DAILY_LOG_SHEET_NAME}!A${rowNumber}:I${rowNumber}`)
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range: `${DAILY_LOG_SHEET_NAME}!A${rowNumber}:I${rowNumber}`,
        majorDimension: "ROWS",
        values: [values],
      }),
      cache: "no-store",
    }
  )

  const payload = await parseGoogleResponse(response)

  if (!response.ok) {
    handleGoogleSheetsError(response, payload, DAILY_LOG_SHEET_NAME)
  }
}

function findDailyLogTargetRow(values: unknown[][], targetDate: string) {
  let firstEmptyRow: number | null = null

  for (let index = 0; index <= DAILY_LOG_LAST_DATA_ROW - DAILY_LOG_FIRST_DATA_ROW; index += 1) {
    const rowNumber = DAILY_LOG_FIRST_DATA_ROW + index
    const cellValue = Array.isArray(values[index]) ? values[index][0] : ""
    const normalizedDate = normalizeSheetDate(cellValue)

    if (normalizedDate === targetDate) {
      return {
        rowNumber,
        operation: "updated" as const,
      }
    }

    if (!normalizedDate && firstEmptyRow == null) {
      firstEmptyRow = rowNumber
    }
  }

  if (firstEmptyRow != null) {
    return {
      rowNumber: firstEmptyRow,
      operation: "inserted" as const,
    }
  }

  throw new Error("Daily Log is full in rows 2:500. Clear an empty row before logging more check-ins.")
}

export async function upsertDailyLogEntry(
  accessToken: string,
  spreadsheetId: string,
  entry: DailyLogEntryInput
) {
  const values = buildDailyLogRow(entry)
  const existingDates = await readDailyLogDates(accessToken, spreadsheetId)
  const target = findDailyLogTargetRow(existingDates, entry.date)

  await updateDailyLogRow(accessToken, spreadsheetId, target.rowNumber, values)

  return target
}
