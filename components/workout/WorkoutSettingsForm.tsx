"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronDown, Dumbbell } from "lucide-react"
import type { WorkoutSettings, TrainingFocus, SessionLength, Equipment } from "@/lib/workout-types"

interface WorkoutSettingsFormProps {
  settings: WorkoutSettings
  onSettingsChange: (settings: WorkoutSettings) => void
}

export function WorkoutSettingsForm({
  settings,
  onSettingsChange,
}: WorkoutSettingsFormProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const focusLabel = {
    "chest-triceps": "Chest / Triceps",
    "legs-shoulders": "Legs / Shoulders",
    "back-biceps": "Back / Biceps",
  }[settings.trainingFocus]
  const durationLabel = {
    short: "35-45 min",
    medium: "50-60 min",
    long: "70-80 min",
  }[settings.sessionLength]

  const settingsFields = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="training-focus">Training Focus</Label>
        <Select
          value={settings.trainingFocus}
          onValueChange={(value: TrainingFocus) =>
            onSettingsChange({ ...settings, trainingFocus: value })
          }
        >
          <SelectTrigger id="training-focus" className="w-full">
            <SelectValue placeholder="Select focus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chest-triceps">Chest / Triceps</SelectItem>
            <SelectItem value="legs-shoulders">Legs / Shoulders</SelectItem>
            <SelectItem value="back-biceps">Back / Biceps</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="session-length">Session Length</Label>
        <Select
          value={settings.sessionLength}
          onValueChange={(value: SessionLength) =>
            onSettingsChange({ ...settings, sessionLength: value })
          }
        >
          <SelectTrigger id="session-length" className="w-full">
            <SelectValue placeholder="Select length" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short">Short (35-45 min)</SelectItem>
            <SelectItem value="medium">Medium (50-60 min)</SelectItem>
            <SelectItem value="long">Long (70-80 min)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="equipment">Equipment</Label>
        <Select
          value={settings.equipment}
          onValueChange={(value: Equipment) =>
            onSettingsChange({ ...settings, equipment: value })
          }
        >
          <SelectTrigger id="equipment" className="w-full">
            <SelectValue placeholder="Select equipment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-gym">Full Gym</SelectItem>
            <SelectItem value="dumbbell-only">Dumbbell Only</SelectItem>
            <SelectItem value="bodyweight">Bodyweight</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="surface-subtle flex items-center justify-between rounded-xl border border-border/60 p-3.5">
        <Label htmlFor="include-abs" className="cursor-pointer text-foreground">
          Include Abs Finisher
        </Label>
        <Switch
          id="include-abs"
          checked={settings.includeAbs}
          onCheckedChange={(checked) =>
            onSettingsChange({ ...settings, includeAbs: checked })
          }
        />
      </div>
    </div>
  )

  return (
    <Card className="brand-panel border-border/50 shadow-sm">
      <Collapsible open={isMobileOpen} onOpenChange={setIsMobileOpen} className="lg:hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Dumbbell className="h-5 w-5 text-primary" />
                Workout Settings
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {focusLabel} • {durationLabel}
              </p>
            </div>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="action-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:text-primary"
                aria-label={isMobileOpen ? "Collapse workout settings" : "Expand workout settings"}
              >
                {isMobileOpen ? "Collapse" : "Expand"}
                <ChevronDown className={`h-4 w-4 transition-transform ${isMobileOpen ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-5">
            {settingsFields}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <div className="hidden lg:block">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Dumbbell className="h-5 w-5 text-primary" />
            Workout Settings
          </CardTitle>
        </CardHeader>
        <CardContent>{settingsFields}</CardContent>
      </div>
    </Card>
  )
}
