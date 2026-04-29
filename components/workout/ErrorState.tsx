import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  onRetry: () => void
  message?: string
}

export function ErrorState({ onRetry, message }: ErrorStateProps) {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="surface-card flex w-full max-w-2xl flex-col rounded-[1.6rem] border border-border/60 p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-destructive/14 bg-destructive/[0.08]">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>

        <h2 className="text-2xl font-semibold text-foreground">Could not generate your workout</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Your connection and workout logic are still intact. The app just could not finish this
          request with the current data pull.
        </p>

        <div className="detail-panel mt-5 rounded-2xl border border-border/60 px-4 py-3 text-left">
          <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Details
          </p>
          <p className="mt-1 text-sm text-foreground">
            {message || "Something went wrong while creating your workout. Please try again."}
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <p className="text-xs text-muted-foreground">
            If the problem keeps showing up, use Change Sheet to verify the saved Apps Script URL.
          </p>
        </div>
      </div>
    </div>
  )
}
