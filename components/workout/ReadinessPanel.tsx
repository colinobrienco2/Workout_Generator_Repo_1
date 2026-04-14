import type { Readiness } from "@/lib/workout-types"
import { Activity } from "lucide-react"

interface ReadinessPanelProps {
  readiness: Readiness
}

export function ReadinessPanel({ readiness }: ReadinessPanelProps) {
  const bandColors: Record<string, string> = {
    high: "bg-emerald-100 text-emerald-800 border-emerald-200",
    moderate: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-red-100 text-red-800 border-red-200",
    deload: "bg-blue-100 text-blue-800 border-blue-200",
    low_data: "bg-slate-100 text-slate-800 border-slate-200",
  }

  const dotColors: Record<string, string> = {
    high: "bg-emerald-500",
    moderate: "bg-amber-500",
    low: "bg-red-500",
    deload: "bg-blue-500",
    low_data: "bg-slate-500",
  }

  const key = readiness.score_band ?? "moderate"

  return (
    <div className={`rounded-lg border p-4 ${bandColors[key] ?? bandColors.moderate}`}>
      <div className="flex items-center gap-2 mb-2">
        <Activity className="h-4 w-4" />
        <span className="font-semibold text-sm">Readiness Check</span>
        <div className={`h-2 w-2 rounded-full ${dotColors[key] ?? dotColors.moderate}`} />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{readiness.status}</p>
        <p className="text-sm opacity-80">{readiness.reason}</p>
        <p className="text-xs font-medium mt-2">Volume Mode: {readiness.volume_mode}</p>
      </div>
    </div>
  )
}
