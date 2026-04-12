import type { ProgressionSummary as ProgressionSummaryType } from "@/lib/workout-types"
import { TrendingUp, Calendar, Weight } from "lucide-react"

interface ProgressionSummaryProps {
  summary: ProgressionSummaryType
}

export function ProgressionSummary({ summary }: ProgressionSummaryProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
      <h4 className="font-semibold text-sm mb-3 text-foreground">Progression Summary</h4>
      <div className="grid gap-3">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Primary Goal</p>
            <p className="text-sm font-medium">{summary.primary_goal}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Calendar className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Week Strategy</p>
            <p className="text-sm font-medium">{summary.week_strategy}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Weight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Load Bias</p>
            <p className="text-sm font-medium">{summary.load_bias}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
