"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link2, Loader2 } from "lucide-react"
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl border-border/50 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Link2 className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl">Connect your training system</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Paste your Google Apps Script Web App URL once. This app will remember it on this device and load your own Google Sheets-driven coaching data automatically on future visits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="apps-script-url" className="text-sm font-medium text-foreground">
              Apps Script Web App URL
            </label>
            <Input
              id="apps-script-url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Quick setup</p>
            <ol className="space-y-1 list-decimal pl-5">
              <li>Make a copy of the workout tracker sheet.</li>
              <li>In Sheets:
                <ul className="list-disc pl-5 mt-1">
                  <li>Open Extensions → Apps Script → Code.gs</li>
                  <li>Create a new deployment → Select type: Web App (name it whatever) → Give access to anyone</li>
                  <li>Deploy → Authorize access</li>
                </ul>
              </li>
              <li>Copy the deployment URL and paste it here.</li>
            </ol>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

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
        </CardContent>
      </Card>
    </div>
  )
}
