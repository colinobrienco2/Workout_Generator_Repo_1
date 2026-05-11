import { getServerSession } from "next-auth"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

import { authOptions } from "@/auth"
import { getTrackerMetadataByUserId } from "@/lib/db/tracker-metadata"
import { refreshGoogleAccessToken } from "@/lib/google/tracker-provisioning"
import { readWeeklyStatusFromGoogleSheet } from "@/lib/google/tracker-weekly-status"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const metadata = await getTrackerMetadataByUserId(userId)

  if (!metadata?.googleTrackerSpreadsheetId || metadata.trackerConnectionMode !== "google") {
    return Response.json(
      { error: "No provisioned Google tracker was found for this account." },
      { status: 404 }
    )
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

    if (
      !accessToken ||
      (token.googleAccessTokenExpiresAt && Date.now() >= token.googleAccessTokenExpiresAt - 60_000)
    ) {
      const refreshedToken = await refreshGoogleAccessToken(token.googleRefreshToken)
      accessToken = refreshedToken.accessToken
    }

    const weeklyStatus = await readWeeklyStatusFromGoogleSheet(
      accessToken,
      metadata.googleTrackerSpreadsheetId
    )

    return Response.json(weeklyStatus)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not read weekly status from the provisioned Google tracker."

    const status =
      message === 'Missing "Weekly Summary" tab in the provisioned tracker.'
        ? 404
        : message.includes("reconnect Google")
          ? 400
          : message.includes("permission")
            ? 403
            : 502

    return Response.json({ error: message }, { status })
  }
}
