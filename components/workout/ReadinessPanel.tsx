import type { Readiness } from "@/lib/workout-types"
import { Activity } from "lucide-react"

interface ReadinessPanelProps {
  readiness: Readiness
}

export function ReadinessPanel({ readiness }: ReadinessPanelProps) {
  const bandColors: Record<string, string> = {
    high: "border-emerald-200/90 bg-emerald-50/95 text-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
    moderate: "border-amber-300/80 bg-amber-50/95 text-amber-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]",
    low: "border-red-200/90 bg-red-50/95 text-red-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)]",
    deload: "border-blue-200/90 bg-blue-50/95 text-blue-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]",
    low_data: "border-amber-300/80 bg-amber-50/95 text-amber-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]",
  }

  const dotColors: Record<string, string> = {
    high: "bg-emerald-500",
    moderate: "bg-amber-500",
    low: "bg-red-500",
    deload: "bg-blue-500",
    low_data: "bg-amber-500",
  }

  const key = readiness.score_band ?? "moderate"

  return (
    <div className={`rounded-2xl border px-4 py-4 sm:px-5 ${bandColors[key] ?? bandColors.moderate}`}>
      <div className="mb-3 flex items-center gap-2">
        <Activity className="h-4 w-4" />
        <span className="text-sm font-semibold">Readiness Check</span>
        <div className={`h-2 w-2 rounded-full ${dotColors[key] ?? dotColors.moderate}`} />
      </div>
      <div className="space-y-2">
        <p className="text-[1.1rem] font-semibold tracking-[-0.02em]">{readiness.status}</p>
        <p className="text-sm leading-relaxed opacity-85">{readiness.reason}</p>
        <p className="pt-1 text-xs font-semibold tracking-[-0.01em]">Volume Mode: {readiness.volume_mode}</p>
      </div>
    </div>
  )
}
