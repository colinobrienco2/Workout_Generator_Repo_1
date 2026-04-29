import type { Readiness } from "@/lib/workout-types"
import { Activity } from "lucide-react"

interface ReadinessPanelProps {
  readiness: Readiness
}

export function ReadinessPanel({ readiness }: ReadinessPanelProps) {
  const bandColors: Record<string, string> = {
    high: "border-emerald-200/80 bg-emerald-50/85 text-emerald-900",
    moderate: "border-amber-200/80 bg-amber-50/85 text-amber-900",
    low: "border-red-200/80 bg-red-50/85 text-red-900",
    deload: "border-blue-200/80 bg-blue-50/85 text-blue-900",
    low_data: "border-slate-200/80 bg-slate-50/95 text-slate-900",
  }

  const dotColors: Record<string, string> = {
    high: "bg-emerald-500",
    moderate: "bg-amber-500",
    low: "bg-red-500",
    deload: "bg-blue-500",
    low_data: "bg-slate-500",
  }

  const key = readiness.score_band ?? "moderate"
  const isLowData = key === "low_data"

  return (
    <div
      className={`rounded-[1.1rem] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] ${
        bandColors[key] ?? bandColors.moderate
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <Activity className="h-4 w-4" />
        <span className="text-sm font-semibold">Readiness Check</span>
        <div className={`h-2 w-2 rounded-full ${dotColors[key] ?? dotColors.moderate}`} />
        {isLowData ? (
          <span className="rounded-full border border-slate-300/80 bg-white/75 px-2 py-0.5 text-[0.65rem] font-semibold tracking-[0.08em] uppercase text-slate-700">
            Low Data Week
          </span>
        ) : null}
      </div>
      <div className="space-y-1">
        <p className="font-medium">{readiness.status}</p>
        <p className="text-sm opacity-80">{readiness.reason}</p>
        <p className="mt-2 text-xs font-medium">Volume Mode: {readiness.volume_mode}</p>
        {isLowData ? (
          <p className="text-xs opacity-75">
            Keep logging consistently this week so the next recommendation can use a stronger trend.
          </p>
        ) : null}
      </div>
    </div>
  )
}
