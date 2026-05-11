import "server-only"

export class GoogleTrackerProvisioningError extends Error {
  status: number

  constructor(message: string, status = 500) {
    super(message)
    this.name = "GoogleTrackerProvisioningError"
    this.status = status
  }
}

interface GoogleTokenRefreshResult {
  accessToken: string
  expiresAt: number
  refreshToken: string
}

function getTemplateSpreadsheetId() {
  const templateSpreadsheetId = process.env.GOOGLE_TRACKER_TEMPLATE_SPREADSHEET_ID?.trim()

  if (!templateSpreadsheetId) {
    throw new GoogleTrackerProvisioningError(
      "Tracker provisioning is not configured yet. Add GOOGLE_TRACKER_TEMPLATE_SPREADSHEET_ID.",
      500
    )
  }

  return templateSpreadsheetId
}

export function buildProvisionedTrackerName(email: string | null) {
  const suffix = email?.trim() || new Date().toISOString().slice(0, 10)
  return `CO2 Workout Tracker - ${suffix}`
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<GoogleTokenRefreshResult> {
  const clientId = process.env.AUTH_GOOGLE_ID
  const clientSecret = process.env.AUTH_GOOGLE_SECRET

  if (!clientId || !clientSecret) {
    throw new GoogleTrackerProvisioningError(
      "Google authentication is not configured correctly.",
      500
    )
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  })

  const payload = (await response.json().catch(() => null)) as
    | {
        access_token?: string
        expires_in?: number
        refresh_token?: string
      }
    | null

  if (!response.ok || !payload?.access_token || !payload.expires_in) {
    throw new GoogleTrackerProvisioningError(
      "Google reconnect required. Sign out and reconnect Google, then try again.",
      400
    )
  }

  return {
    accessToken: payload.access_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
    refreshToken: payload.refresh_token ?? refreshToken,
  }
}

export async function copyTrackerTemplate(accessToken: string, name: string) {
  const templateSpreadsheetId = getTemplateSpreadsheetId()
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(templateSpreadsheetId)}/copy`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
      cache: "no-store",
    }
  )

  const payload = (await response.json().catch(() => null)) as
    | {
        id?: string
        error?: {
          code?: number
          message?: string
          status?: string
        }
      }
    | null

  if (response.ok && payload?.id) {
    return {
      spreadsheetId: payload.id,
    }
  }

  const status = payload?.error?.status
  const message = payload?.error?.message ?? "Google Drive could not copy the tracker template."

  if (response.status === 401) {
    throw new GoogleTrackerProvisioningError(
      "Your Google connection expired. Sign out and reconnect Google, then try again.",
      401
    )
  }

  if (response.status === 403 || status === "PERMISSION_DENIED" || status === "ACCESS_TOKEN_SCOPE_INSUFFICIENT") {
    throw new GoogleTrackerProvisioningError(
      "Google permissions are missing for tracker creation. Sign out and reconnect Google, then try again.",
      403
    )
  }

  if (
    response.status === 404 &&
    payload?.error?.message?.includes(templateSpreadsheetId)
  ) {
    throw new GoogleTrackerProvisioningError(
      "Google could not access the tracker template with your current Drive permissions. If Google sign-in was connected before the latest scope update, sign out and reconnect Google, then try again.",
      403
    )
  }

  throw new GoogleTrackerProvisioningError(message, response.status || 500)
}
