import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/auth"
import {
  getDefaultTrackerMetadata,
  getTrackerMetadataByUserId,
  TRACKER_CONNECTION_MODES,
  upsertTrackerMetadata,
} from "@/lib/db/tracker-metadata"

const trackerMetadataSchema = z.object({
  trackerConnectionMode: z.enum(TRACKER_CONNECTION_MODES),
  googleTrackerSpreadsheetId: z
    .string()
    .trim()
    .min(1)
    .max(256)
    .nullable()
    .optional(),
  manualAppsScriptUrlFallback: z
    .string()
    .trim()
    .url()
    .max(2048)
    .nullable()
    .optional(),
})

async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    return null
  }

  return {
    userId,
    email: session.user?.email ?? null,
  }
}

export async function GET() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const metadata = await getTrackerMetadataByUserId(user.userId)

  return Response.json({
    trackerMetadata: metadata ?? getDefaultTrackerMetadata(user.userId, user.email),
  })
}

export async function PUT(request: Request) {
  const user = await getAuthenticatedUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const json = await request.json()
  const parsed = trackerMetadataSchema.safeParse(json)

  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid tracker metadata payload",
        issues: parsed.error.flatten(),
      },
      { status: 400 }
    )
  }

  const metadata = await upsertTrackerMetadata(user.userId, {
    email: user.email,
    trackerConnectionMode: parsed.data.trackerConnectionMode,
    googleTrackerSpreadsheetId: parsed.data.googleTrackerSpreadsheetId ?? null,
    manualAppsScriptUrlFallback: parsed.data.manualAppsScriptUrlFallback ?? null,
  })

  return Response.json({ trackerMetadata: metadata })
}

export const POST = PUT
