import { Card, CardContent } from "@/components/ui/card"
import { Dumbbell } from "lucide-react"

export function EmptyState() {
  return (
    <Card className="surface-card border-border/50 border-dashed shadow-sm">
      <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center sm:px-10">
        <div className="meta-pill meta-pill-accent mb-4 inline-flex items-center gap-2 px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.08em] uppercase">
          Ready When You Are
        </div>
        <div className="mb-5 flex h-18 w-18 items-center justify-center rounded-full border border-border/60 bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]">
          <Dumbbell className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">No Workout Generated Yet</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Configure your workout settings and click &ldquo;Generate Workout&rdquo; to create your
          personalized training session.
        </p>
        <div className="detail-panel mt-5 max-w-md rounded-2xl border border-border/60 px-4 py-3">
          <p className="text-sm text-foreground">
            Your workout will appear here with readiness context, progression notes, and exercise
            swaps once the sheet data is loaded.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
