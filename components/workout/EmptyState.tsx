import { Card, CardContent } from "@/components/ui/card"
import { Dumbbell } from "lucide-react"

export function EmptyState() {
  return (
    <Card className="brand-panel surface-card border-border/50 border-dashed shadow-sm">
      <CardContent className="flex flex-col items-center justify-center px-5 py-10 text-center sm:px-10 sm:py-16">
        <div className="meta-pill meta-pill-accent mb-3 inline-flex items-center gap-2 px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.08em] uppercase">
          Ready When You Are
        </div>
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border/60 bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] sm:mb-5 sm:h-18 sm:w-18">
          <Dumbbell className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">No Workout Generated Yet</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Choose your settings and tap &ldquo;Generate Workout&rdquo; to build today&apos;s session.
        </p>
        <div className="detail-panel mt-4 max-w-md rounded-2xl border border-border/60 px-4 py-3">
          <p className="text-sm text-foreground">
            Your workout will appear here with coaching notes, progression context, and exercise swaps.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
