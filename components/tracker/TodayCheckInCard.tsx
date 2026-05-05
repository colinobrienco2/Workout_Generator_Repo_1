"use client"

import { useMemo, useState } from "react"
import { CalendarCheck2, Edit3, MoonStar, NotebookPen, Plus, Sparkles, Weight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type RatingValue = "1" | "2" | "3" | "4" | "5"
type WorkoutCompleted = "yes" | "no"

interface CheckInValues {
  bodyweight: string
  calories: string
  sleep: RatingValue
  soreness: RatingValue
  energy: RatingValue
  stress: RatingValue
  workoutCompleted: WorkoutCompleted
  notes: string
}

const defaultValues: CheckInValues = {
  bodyweight: "",
  calories: "",
  sleep: "3",
  soreness: "3",
  energy: "3",
  stress: "3",
  workoutCompleted: "yes",
  notes: "",
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-white/55 px-2.5 py-2">
      <span className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}

export function TodayCheckInCard() {
  const [isOpen, setIsOpen] = useState(false)
  const [savedCheckIn, setSavedCheckIn] = useState<CheckInValues | null>(null)
  const [formValues, setFormValues] = useState<CheckInValues>(defaultValues)

  const summaryRows = useMemo(() => {
    if (!savedCheckIn) {
      return []
    }

    const rows = [
      { label: "Sleep", value: `${savedCheckIn.sleep}/5` },
      { label: "Energy", value: `${savedCheckIn.energy}/5` },
      { label: "Soreness", value: `${savedCheckIn.soreness}/5` },
      { label: "Stress", value: `${savedCheckIn.stress}/5` },
    ]

    if (savedCheckIn.bodyweight) {
      rows.push({ label: "Weight", value: savedCheckIn.bodyweight })
    }

    if (savedCheckIn.calories) {
      rows.push({ label: "Calories", value: savedCheckIn.calories })
    }

    return rows
  }, [savedCheckIn])

  const openForCreate = () => {
    setFormValues(savedCheckIn ?? defaultValues)
    setIsOpen(true)
  }

  const handleSave = () => {
    setSavedCheckIn(formValues)
    setIsOpen(false)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSave()
  }

  return (
    <>
      <Card className="brand-panel border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="meta-pill meta-pill-accent inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.08em] uppercase">
                <CalendarCheck2 className="h-3 w-3" />
                Today&apos;s Check-In
              </div>
              <CardTitle className="mt-2 flex items-center gap-1.5 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                Readiness snapshot
              </CardTitle>
            </div>
            <div className="meta-pill inline-flex items-center rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Local only
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {savedCheckIn ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                {summaryRows.map((row) => (
                  <MetricRow key={row.label} label={row.label} value={row.value} />
                ))}
              </div>

              {savedCheckIn.notes ? (
                <div className="surface-subtle rounded-xl border border-border/60 p-2.5">
                  <div className="mb-1 flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    <NotebookPen className="h-3 w-3" />
                    Notes
                  </div>
                  <p className="line-clamp-3 text-sm text-foreground">{savedCheckIn.notes}</p>
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/12 bg-primary/[0.05] px-3 py-2 text-sm">
                <span className="text-muted-foreground">
                  Workout:{" "}
                  <span className="font-semibold text-foreground">
                    {savedCheckIn.workoutCompleted === "yes" ? "Yes" : "No"}
                  </span>
                </span>
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-primary">
                  Not synced
                </span>
              </div>

              <Button type="button" variant="outline" size="sm" className="h-9 w-full" onClick={openForCreate}>
                <Edit3 className="mr-2 h-3.5 w-3.5" />
                Edit
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="surface-subtle rounded-xl border border-border/60 p-3">
                <p className="text-sm font-medium text-foreground">No check-in logged today.</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Log metrics to capture today&apos;s readiness.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="detail-panel flex items-center gap-2 px-2.5 py-2 text-sm text-muted-foreground">
                  <MoonStar className="h-3.5 w-3.5 text-primary" />
                  Sleep
                </div>
                <div className="detail-panel flex items-center gap-2 px-2.5 py-2 text-sm text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Energy
                </div>
                <div className="detail-panel flex items-center gap-2 px-2.5 py-2 text-sm text-muted-foreground">
                  <Weight className="h-3.5 w-3.5 text-primary" />
                  Weight
                </div>
              </div>

              <Button type="button" size="sm" className="h-9 w-full" onClick={openForCreate}>
                <Plus className="mr-2 h-3.5 w-3.5" />
                Log Metrics
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="surface-card max-h-[calc(100vh-3rem)] max-w-xl overflow-hidden rounded-[1.4rem] border-border/60 p-0">
          <form onSubmit={handleSubmit} className="flex max-h-[calc(100vh-3rem)] flex-col overflow-hidden">
            <DialogHeader className="shrink-0 border-b border-border/50 px-5 pt-5 pb-4 text-left">
              <div className="meta-pill meta-pill-accent inline-flex w-fit items-center gap-1.5 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.08em] uppercase">
                <CalendarCheck2 className="h-3 w-3" />
                Today&apos;s Check-In
              </div>
              <DialogTitle className="pt-2 text-xl">Log training metrics</DialogTitle>
              <DialogDescription className="max-w-lg text-sm">
                Local only in Phase 1. Nothing here writes to Google Sheets, Apps Script, or the
                workout engine.
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bodyweight">Bodyweight</Label>
                  <Input
                    id="bodyweight"
                    value={formValues.bodyweight}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, bodyweight: event.target.value }))
                    }
                    className="control-surface h-9"
                    placeholder="185.4 lb"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    value={formValues.calories}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, calories: event.target.value }))
                    }
                    className="control-surface h-9"
                    placeholder="2750"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sleep">Sleep</Label>
                  <Select
                    value={formValues.sleep}
                    onValueChange={(value: RatingValue) =>
                      setFormValues((prev) => ({ ...prev, sleep: value }))
                    }
                  >
                    <SelectTrigger id="sleep" className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Very poor</SelectItem>
                      <SelectItem value="2">2 - Below normal</SelectItem>
                      <SelectItem value="3">3 - Solid</SelectItem>
                      <SelectItem value="4">4 - Good</SelectItem>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="soreness">Soreness</Label>
                  <Select
                    value={formValues.soreness}
                    onValueChange={(value: RatingValue) =>
                      setFormValues((prev) => ({ ...prev, soreness: value }))
                    }
                  >
                    <SelectTrigger id="soreness" className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Very low</SelectItem>
                      <SelectItem value="2">2 - Mild</SelectItem>
                      <SelectItem value="3">3 - Noticeable</SelectItem>
                      <SelectItem value="4">4 - High</SelectItem>
                      <SelectItem value="5">5 - Very high</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="energy">Energy</Label>
                  <Select
                    value={formValues.energy}
                    onValueChange={(value: RatingValue) =>
                      setFormValues((prev) => ({ ...prev, energy: value }))
                    }
                  >
                    <SelectTrigger id="energy" className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Drained</SelectItem>
                      <SelectItem value="2">2 - Low</SelectItem>
                      <SelectItem value="3">3 - Steady</SelectItem>
                      <SelectItem value="4">4 - Strong</SelectItem>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="stress">Stress</Label>
                  <Select
                    value={formValues.stress}
                    onValueChange={(value: RatingValue) =>
                      setFormValues((prev) => ({ ...prev, stress: value }))
                    }
                  >
                    <SelectTrigger id="stress" className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Very low</SelectItem>
                      <SelectItem value="2">2 - Managed</SelectItem>
                      <SelectItem value="3">3 - Moderate</SelectItem>
                      <SelectItem value="4">4 - High</SelectItem>
                      <SelectItem value="5">5 - Very high</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="workout-completed">Workout completed</Label>
                  <Select
                    value={formValues.workoutCompleted}
                    onValueChange={(value: WorkoutCompleted) =>
                      setFormValues((prev) => ({ ...prev, workoutCompleted: value }))
                    }
                  >
                    <SelectTrigger id="workout-completed" className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formValues.notes}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, notes: event.target.value }))
                    }
                    rows={3}
                    className="control-surface min-h-[5.5rem] resize-none"
                    placeholder="Short notes on readiness, appetite, soreness, or training quality."
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="shrink-0 border-t border-border/50 bg-background/96 px-5 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Saved only in local React state for this session.
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Check-In
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
