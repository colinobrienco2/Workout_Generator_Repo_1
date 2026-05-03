import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LoadingState() {
  return (
    <div className="space-y-4">
      <Card className="brand-panel surface-card border-border/50 shadow-sm">
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="meta-pill meta-pill-accent inline-flex items-center gap-2 px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.08em] uppercase">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/45" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                Loading Weekly Training Data
              </div>
              <div className="space-y-2">
                <Skeleton className="h-7 w-56 sm:w-72" />
                <Skeleton className="h-4 w-64 sm:w-80" />
              </div>
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>

          <div className="detail-panel space-y-4 rounded-2xl border border-border/60 p-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="brand-panel surface-card border-border/50 shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex justify-between gap-4">
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
