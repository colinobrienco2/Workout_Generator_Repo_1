import "server-only"

import { neon } from "@neondatabase/serverless"

export const TRACKER_CONNECTION_MODES = ["none", "manual", "google"] as const

export type TrackerConnectionMode = (typeof TRACKER_CONNECTION_MODES)[number]

export interface TrackerMetadataRecord {
  userId: string
  email: string | null
  trackerConnectionMode: TrackerConnectionMode
  googleTrackerSpreadsheetId: string | null
  manualAppsScriptUrlFallback: string | null
  createdAt: string
  updatedAt: string
}

export interface TrackerMetadataUpdateInput {
  email: string | null
  trackerConnectionMode: TrackerConnectionMode
  googleTrackerSpreadsheetId: string | null
  manualAppsScriptUrlFallback: string | null
}

type TrackerMetadataRow = {
  user_id: string
  email: string | null
  tracker_connection_mode: TrackerConnectionMode
  google_tracker_spreadsheet_id: string | null
  manual_apps_script_url_fallback: string | null
  created_at: string
  updated_at: string
}

function getSql() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for tracker metadata persistence.")
  }

  return neon(databaseUrl)
}

function mapRow(row: TrackerMetadataRow): TrackerMetadataRecord {
  return {
    userId: row.user_id,
    email: row.email,
    trackerConnectionMode: row.tracker_connection_mode,
    googleTrackerSpreadsheetId: row.google_tracker_spreadsheet_id,
    manualAppsScriptUrlFallback: row.manual_apps_script_url_fallback,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function getDefaultTrackerMetadata(userId: string, email: string | null): TrackerMetadataRecord {
  const now = new Date(0).toISOString()

  return {
    userId,
    email,
    trackerConnectionMode: "none",
    googleTrackerSpreadsheetId: null,
    manualAppsScriptUrlFallback: null,
    createdAt: now,
    updatedAt: now,
  }
}

export async function getTrackerMetadataByUserId(userId: string): Promise<TrackerMetadataRecord | null> {
  const sql = getSql()
  const rows = await sql<TrackerMetadataRow[]>`
    SELECT
      user_id,
      email,
      tracker_connection_mode,
      google_tracker_spreadsheet_id,
      manual_apps_script_url_fallback,
      created_at,
      updated_at
    FROM tracker_metadata
    WHERE user_id = ${userId}
    LIMIT 1
  `

  return rows[0] ? mapRow(rows[0]) : null
}

export async function upsertTrackerMetadata(
  userId: string,
  input: TrackerMetadataUpdateInput
): Promise<TrackerMetadataRecord> {
  const sql = getSql()
  const rows = await sql<TrackerMetadataRow[]>`
    INSERT INTO tracker_metadata (
      user_id,
      email,
      tracker_connection_mode,
      google_tracker_spreadsheet_id,
      manual_apps_script_url_fallback
    )
    VALUES (
      ${userId},
      ${input.email},
      ${input.trackerConnectionMode},
      ${input.googleTrackerSpreadsheetId},
      ${input.manualAppsScriptUrlFallback}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      tracker_connection_mode = EXCLUDED.tracker_connection_mode,
      google_tracker_spreadsheet_id = EXCLUDED.google_tracker_spreadsheet_id,
      manual_apps_script_url_fallback = EXCLUDED.manual_apps_script_url_fallback,
      updated_at = NOW()
    RETURNING
      user_id,
      email,
      tracker_connection_mode,
      google_tracker_spreadsheet_id,
      manual_apps_script_url_fallback,
      created_at,
      updated_at
  `

  return mapRow(rows[0])
}
