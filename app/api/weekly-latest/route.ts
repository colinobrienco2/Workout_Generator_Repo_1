function isValidAppsScriptUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "https:" && url.hostname.includes("script.google.com")
  } catch {
    return false
  }
}

function buildAppsScriptRequestUrl(value: string) {
  const url = new URL(value)
  if (!url.searchParams.has("resource")) {
    url.searchParams.set("resource", "weekly_latest")
  }
  return url.toString()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const targetUrl = searchParams.get("url")

  if (!targetUrl) {
    return Response.json({ error: "Missing Apps Script URL" }, { status: 400 })
  }

  if (!isValidAppsScriptUrl(targetUrl)) {
    return Response.json({ error: "Invalid Apps Script URL" }, { status: 400 })
  }

  try {
    const upstreamResponse = await fetch(buildAppsScriptRequestUrl(targetUrl), {
      method: "GET",
      cache: "no-store",
    })

    if (!upstreamResponse.ok) {
      return Response.json(
        { error: `Apps Script request failed with status ${upstreamResponse.status}` },
        { status: 502 }
      )
    }

    const payload = await upstreamResponse.json()
    return Response.json(payload)
  } catch {
    return Response.json(
      { error: "Could not reach the Apps Script endpoint. Check deployment access and URL." },
      { status: 502 }
    )
  }
}
