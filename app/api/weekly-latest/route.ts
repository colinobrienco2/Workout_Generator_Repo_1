import { NextResponse } from "next/server"

const BASE_URL = process.env.GOOGLE_SHEETS_API_URL

export async function GET() {
  if (!BASE_URL) {
    return NextResponse.json(
      { error: "Missing GOOGLE_SHEETS_API_URL" },
      { status: 500 },
    )
  }

  const upstream = await fetch(`${BASE_URL}?resource=weekly_latest`, {
    method: "GET",
    cache: "no-store",
  })

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Failed to fetch Google Sheets data" },
      { status: upstream.status },
    )
  }

  const data = await upstream.json()
  return NextResponse.json(data)
}
