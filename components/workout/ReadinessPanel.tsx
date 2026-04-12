import type { Readiness } from "@/lib/workout-types"
import { Activity } from "lucide-react"

interface ReadinessPanelProps {
  readiness: Readiness
}

export function ReadinessPanel({ readiness }: ReadinessPanelProps) {
  const bandColors = {
    green: "bg-emerald-100 text-emerald-800 border-emerald-200",
    yellow: "bg-amber-100 text-amber-800 border-amber-200",
    red: "bg-red-100 text-red-800 border-red-200"
  }

  const dotColors = {
    green: "bg-emerald-500",
    yellow: "bg-amber-500",
    red: "bg-red-500"
  }

  return (
    <div className={`rounded-lg border p-4 ${bandColors[readiness.score_band]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Activity className="h-4 w-4" />
        <span className="font-semibold text-sm">Readiness Check</span>
        <div className={`h-2 w-2 rounded-full ${dotColors[readiness.score_band]}`} />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{readiness.status}</p>
        <p className="text-sm opacity-80">{readiness.reason}</p>
        <p className="text-xs font-medium mt-2">{readiness.volume_mode}</p>
      </div>
    </div>
  )
}
