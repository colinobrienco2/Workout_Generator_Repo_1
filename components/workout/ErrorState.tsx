import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  onRetry: () => void
  message?: string
}

export function ErrorState({ onRetry, message }: ErrorStateProps) {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-red-200 bg-red-50/60 p-8">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>

        <h2 className="text-2xl font-semibold text-foreground">
          Failed to Generate Workout
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {message || "Something went wrong while creating your workout. Please try again."}
        </p>

        <Button onClick={onRetry} variant="outline" className="mt-6 gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  )
}