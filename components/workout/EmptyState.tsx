import { Card, CardContent } from "@/components/ui/card"
import { Dumbbell } from "lucide-react"

export function EmptyState() {
  return (
    <Card className="surface-card border-border/50 border-dashed shadow-sm">
      <CardContent className="flex min-h-[330px] flex-col items-center justify-center px-8 py-16 text-center sm:px-12">
        <div className="mb-5 flex h-18 w-18 items-center justify-center rounded-full border border-border/60 bg-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <Dumbbell className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          No Workout Generated Yet
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Configure your workout settings and click &ldquo;Generate Workout&rdquo; to create your personalized training session.
        </p>
      </CardContent>
    </Card>
  )
}
