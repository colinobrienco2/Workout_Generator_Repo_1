import { getServerSession } from "next-auth"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { authOptions } from "@/auth"
import { upsertTrackerMetadata, getTrackerMetadataByUserId } from "@/lib/db/tracker-metadata"
import {
  buildProvisionedTrackerName,
  copyTrackerTemplate,
  GoogleTrackerProvisioningError,
  refreshGoogleAccessToken,
} from "@/lib/google/tracker-provisioning"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET })

  if (!token?.googleAccessToken && !token?.googleRefreshToken) {
    return Response.json(
      { error: "Google access is unavailable. Sign out and reconnect Google, then try again." },
      { status: 400 }
    )
  }

  if (!token?.googleRefreshToken) {
    return Response.json(
      { error: "Google reconnect required. Sign out and reconnect Google, then try again." },
      { status: 400 }
    )
  }

  try {
    let accessToken = token.googleAccessToken

    if (!accessToken || (token.googleAccessTokenExpiresAt && Date.now() >= token.googleAccessTokenExpiresAt - 60_000)) {
      const refreshedToken = await refreshGoogleAccessToken(token.googleRefreshToken)
      accessToken = refreshedToken.accessToken
    }

    const copiedTracker = await copyTrackerTemplate(
      accessToken,
      buildProvisionedTrackerName(session.user?.email ?? null)
    )
    const existingMetadata = await getTrackerMetadataByUserId(userId)
    const trackerMetadata = await upsertTrackerMetadata(userId, {
      email: session.user?.email ?? null,
      trackerConnectionMode: "google",
      googleTrackerSpreadsheetId: copiedTracker.spreadsheetId,
      manualAppsScriptUrlFallback: existingMetadata?.manualAppsScriptUrlFallback ?? null,
    })

    return Response.json({
      spreadsheetId: trackerMetadata.googleTrackerSpreadsheetId,
      trackerConnectionMode: trackerMetadata.trackerConnectionMode,
    })
  } catch (error) {
    if (error instanceof GoogleTrackerProvisioningError) {
      return Response.json({ error: error.message }, { status: error.status })
    }

    return Response.json(
      { error: "Tracker provisioning failed. Please try again." },
      { status: 500 }
    )
  }
}
