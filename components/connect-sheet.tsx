"use client"

import { useEffect, useState } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Link2, Loader2, LogOut, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { setStoredApiUrl } from "@/lib/api-url"
import { validateAppsScriptUrl } from "@/lib/connection"

interface ConnectSheetProps {
  onConnect: (url: string) => void
}

export default function ConnectSheet({ onConnect }: ConnectSheetProps) {
  const { data: session, status } = useSession()
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [showManualFlow, setShowManualFlow] = useState(false)
  const [googleAuthAvailable, setGoogleAuthAvailable] = useState(false)
  const [isGoogleActionPending, setIsGoogleActionPending] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadProviders() {
      try {
        const response = await fetch("/api/auth/providers", { cache: "no-store" })
        if (!response.ok) return

        const providers = (await response.json()) as Record<string, { id: string }> | null
        if (isMounted) {
          setGoogleAuthAvailable(Boolean(providers?.google))
        }
      } catch {
        if (isMounted) {
          setGoogleAuthAvailable(false)
        }
      }
    }

    loadProviders()

    return () => {
      isMounted = false
    }
  }, [])

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

  const handleGoogleSignIn = async () => {
    setIsGoogleActionPending(true)

    try {
      await signIn("google", { callbackUrl: "/" })
    } finally {
      setIsGoogleActionPending(false)
    }
  }

  const handleGoogleSignOut = async () => {
    setIsGoogleActionPending(true)

    try {
      await signOut({ callbackUrl: "/" })
    } finally {
      setIsGoogleActionPending(false)
    }
  }

  const isGoogleConnected = status === "authenticated" && Boolean(session?.user?.email)
  const connectButtonDisabled = !googleAuthAvailable || isGoogleActionPending || status === "loading"

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="brand-panel surface-card w-full max-w-4xl overflow-hidden border-border/50">
        <CardHeader className="space-y-6 pb-5">
          <div className="meta-pill meta-pill-accent inline-flex w-fit items-center gap-2 px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.08em] uppercase">
            <CheckCircle2 className="h-3.5 w-3.5" />
            CO2 Connected Tracker
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/12 bg-primary/10 text-primary shadow-[0_20px_35px_-28px_rgba(58,119,255,0.7)]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl">CO2 Connected Tracker</CardTitle>
                  <CardDescription className="max-w-2xl text-sm leading-relaxed sm:text-[0.95rem]">
                    Connect a personal tracker so CO2 can read readiness trends, save daily
                    training metrics, and personalize workout guidance.
                  </CardDescription>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="surface-subtle rounded-2xl border border-border/60 p-4">
                  <p className="eyebrow text-primary">Recovery</p>
                  <p className="mt-2 text-sm text-foreground">Bring weekly readiness into your workout flow.</p>
                </div>
                <div className="surface-subtle rounded-2xl border border-border/60 p-4">
                  <p className="eyebrow text-primary">Metrics</p>
                  <p className="mt-2 text-sm text-foreground">Prepare for future check-ins without changing today’s generator.</p>
                </div>
                <div className="surface-subtle rounded-2xl border border-border/60 p-4">
                  <p className="eyebrow text-primary">Control</p>
                  <p className="mt-2 text-sm text-foreground">Keep the current manual Apps Script path as an advanced fallback.</p>
                </div>
              </div>
            </div>

            <div className="detail-panel flex flex-col justify-between gap-5 p-5">
              <div className="space-y-3">
                <p className="eyebrow text-primary">Recommended Path</p>
                <div>
                  <h2 className="section-heading text-xl text-foreground">Connect Google Tracker</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sign in with Google to connect your account foundation now. Tracker provisioning
                    and Google Sheet sync are still a later phase, so the manual Apps Script URL
                    remains required for workout data.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {isGoogleConnected ? (
                  <>
                    <div className="surface-subtle rounded-2xl border border-border/60 p-3 text-sm">
                      <p className="font-medium text-foreground">Google connected · Tracker not provisioned</p>
                      <p className="mt-1 text-muted-foreground">
                        Signed in as {session?.user?.email}. Manual tracker URL is still required until
                        Sheet provisioning is added.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleGoogleSignOut}
                      disabled={isGoogleActionPending}
                      className="w-full"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out of Google
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleGoogleSignIn} disabled={connectButtonDisabled} className="w-full">
                    {isGoogleActionPending || status === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting Google...
                      </>
                    ) : googleAuthAvailable ? (
                      "Connect Google Tracker"
                    ) : (
                      "Google Sign-In Not Configured"
                    )}
                  </Button>
                )}
                <div className="surface-subtle rounded-2xl border border-border/60 p-3 text-sm text-muted-foreground">
                  {googleAuthAvailable
                    ? "Google sign-in only creates a session in this phase. It does not create a tracker sheet or sync any metrics."
                    : "Add Google OAuth environment variables to enable sign-in. The manual Apps Script URL path still works without them."}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 border-t border-border/50 pt-5">
          <button
            type="button"
            onClick={() => setShowManualFlow((prev) => !prev)}
            className="action-pill inline-flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            <span className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/70 text-primary">
                <Link2 className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold">Use Apps Script URL instead</span>
                <span className="block text-xs text-muted-foreground">
                  Advanced manual fallback for the current tracker connection flow.
                </span>
              </span>
            </span>
            {showManualFlow ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showManualFlow ? (
            <div className="space-y-5 rounded-[1.4rem] border border-border/60 bg-white/45 p-4 sm:p-5">
              {isGoogleConnected ? (
                <div className="rounded-2xl border border-primary/18 bg-primary/[0.06] p-4 text-sm">
                  <p className="font-medium text-foreground">
                    Google connected. Manual tracker URL is still required until Sheet provisioning is added.
                  </p>
                </div>
              ) : null}

              <div className="detail-panel space-y-2 p-4">
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
                <p className="mb-2 font-medium text-foreground">Manual setup</p>
                <ol className="list-decimal space-y-1 pl-5">
                  <li>Make a copy of the workout tracker sheet.</li>
                  <li>Open Extensions &gt; Apps Script and deploy the project as a Web App.</li>
                  <li>Allow access, copy the deployment URL, and paste it here.</li>
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
                    "Connect Manual Tracker"
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Your Apps Script URL stays on this device unless you choose Manage Tracker later.
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
