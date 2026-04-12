import { Card, CardContent } from "@/components/ui/card"
import { Dumbbell } from "lucide-react"

export function EmptyState() {
  return (
    <Card className="border-border/50 border-dashed shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Dumbbell className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg text-foreground mb-2">
          No Workout Generated Yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Configure your workout settings and click &ldquo;Generate Workout&rdquo; to create your personalized training session.
        </p>
      </CardContent>
    </Card>
  )
}
