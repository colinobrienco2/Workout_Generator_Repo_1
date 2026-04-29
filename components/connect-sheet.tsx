"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Link2, Loader2 } from "lucide-react"
import { setStoredApiUrl } from "@/lib/api-url"
import { validateAppsScriptUrl } from "@/lib/connection"

interface ConnectSheetProps {
  onConnect: (url: string) => void
}

export default function ConnectSheet({ onConnect }: ConnectSheetProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    const trimmedUrl = url.trim()

    if (!trimmedUrl) {
      setError("Paste your Apps Script Web App URL to continue.")
      return
    }

    if (!trimmedUrl.includes("script.google.com")) {
      setError("Enter a valid Google Apps Script Web App URL.")
      return
    }

    setIsConnecting(true)
    setError("")

    try {
      await validateAppsScriptUrl(trimmedUrl)
      setStoredApiUrl(trimmedUrl)
      onConnect(trimmedUrl)
    } catch (connectionError) {
      setError(
        connectionError instanceof Error
          ? connectionError.message
          : "Could not connect to the supplied Apps Script URL."
      )
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="surface-card w-full max-w-2xl border-border/50 shadow-sm">
        <CardHeader className="space-y-4 pb-4">
          <div className="meta-pill inline-flex w-fit items-center gap-2 px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.08em] text-primary uppercase">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Google Sheets Setup
          </div>

          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/12 bg-primary/10 text-primary">
              <Link2 className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Connect your training system</CardTitle>
              <CardDescription className="max-w-xl text-sm leading-relaxed">
                Paste your Google Apps Script Web App URL once. This app will remember it on this
                device and load your own Google Sheets-driven coaching data automatically on future
                visits.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="detail-panel space-y-2 rounded-2xl border border-border/60 p-4">
            <label htmlFor="apps-script-url" className="text-sm font-medium text-foreground">
              Apps Script Web App URL
            </label>
            <Input
              id="apps-script-url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="control-surface"
            />
            <p className="text-xs text-muted-foreground">
              Use the deployed Web App URL from the Apps Script project tied to your tracker sheet.
            </p>
          </div>

          <div className="surface-subtle rounded-2xl border border-border/60 p-4 text-sm text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">Quick setup</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Make a copy of the workout tracker sheet.</li>
              <li>
                In Sheets:
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>Open Extensions &gt; Apps Script &gt; Code.gs.</li>
                  <li>Create a new deployment, choose Web App, and allow access for anyone.</li>
                  <li>Deploy, then authorize access.</li>
                </ul>
              </li>
              <li>Copy the deployment URL and paste it here.</li>
            </ol>
          </div>

          {error ? (
            <div className="rounded-2xl border border-destructive/18 bg-destructive/[0.06] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-destructive/14 bg-destructive/10 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Connection check failed</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Sheet"
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Your Apps Script URL stays on this device unless you choose Change Sheet later.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
