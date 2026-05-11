import { getServerSession } from "next-auth"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { z } from "zod"

import { authOptions } from "@/auth"
import { getTrackerMetadataByUserId } from "@/lib/db/tracker-metadata"
import { refreshGoogleAccessToken } from "@/lib/google/tracker-provisioning"
import { upsertDailyLogEntry } from "@/lib/google/tracker-daily-log"

const dailyLogPayloadSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must match yyyy-MM-dd"),
  bodyweight: z.string().regex(/^\d+(?:\.\d+)?$/, "Bodyweight must be a numeric string").nullable(),
  calories: z.string().regex(/^\d+(?:\.\d+)?$/, "Calories must be a numeric string").nullable(),
  sleep: z.number().int().min(1).max(5),
  soreness: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  stress: z.number().int().min(1).max(5),
  workoutCompleted: z.enum(["yes", "no"]),
  notes: z.string(),
})

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const json = await request.json().catch(() => null)
  const parsed = dailyLogPayloadSchema.safeParse(json)

  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid daily log payload",
        issues: parsed.error.flatten(),
      },
      { status: 400 }
    )
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

    const result = await upsertDailyLogEntry(
      accessToken,
      metadata.googleTrackerSpreadsheetId,
      parsed.data
    )

    return Response.json({
      checkIn: parsed.data,
      synced: true,
      rowNumber: result.rowNumber,
      operation: result.operation,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not write daily log to the provisioned Google tracker."

    const status =
      message === 'Missing "Daily Log" tab in the provisioned tracker.'
        ? 404
        : message.includes("reconnect Google")
          ? 400
          : message.includes("permission")
            ? 403
            : message.includes("not found")
              ? 404
              : 502

    return Response.json({ error: message }, { status })
  }
}
