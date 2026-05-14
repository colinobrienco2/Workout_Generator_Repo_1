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
import type { WorkoutSettings, MuscleGroup, SessionLength, Equipment } from "@/lib/workout-types"

interface WorkoutSettingsFormProps {
  settings: WorkoutSettings
  onSettingsChange: (settings: WorkoutSettings) => void
}

export function WorkoutSettingsForm({
  settings,
  onSettingsChange,
}: WorkoutSettingsFormProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const muscleLabelMap: Record<MuscleGroup, string> = {
    chest: "Chest",
    back: "Back",
    legs: "Legs",
    shoulders: "Shoulders",
    biceps: "Biceps",
    triceps: "Triceps",
  }
  const getFallbackSecondaryMuscle = (primaryMuscle: MuscleGroup): MuscleGroup =>
    primaryMuscle === "triceps" ? "chest" : "triceps"
  const focusLabel = `${muscleLabelMap[settings.primaryMuscle]} + ${muscleLabelMap[settings.secondaryMuscle]}`
  const durationLabel = {
    short: "35-45 min",
    medium: "50-60 min",
    long: "70-80 min",
  }[settings.sessionLength]
  const availableSecondaryMuscles = (Object.keys(muscleLabelMap) as MuscleGroup[]).filter(
    (muscle) => muscle !== settings.primaryMuscle,
  )

  const settingsFields = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="primary-muscle">Primary Muscle</Label>
        <Select
          value={settings.primaryMuscle}
          onValueChange={(value: MuscleGroup) =>
            onSettingsChange({
              ...settings,
              primaryMuscle: value,
              secondaryMuscle:
                value === settings.secondaryMuscle
                  ? getFallbackSecondaryMuscle(value)
                  : settings.secondaryMuscle,
            })
          }
        >
          <SelectTrigger id="primary-muscle" className="w-full">
            <SelectValue placeholder="Select primary muscle" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(muscleLabelMap) as MuscleGroup[]).map((muscle) => (
              <SelectItem key={muscle} value={muscle}>
                {muscleLabelMap[muscle]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="secondary-muscle">Secondary Muscle</Label>
        <Select
          value={settings.secondaryMuscle}
          onValueChange={(value: MuscleGroup) =>
            onSettingsChange({ ...settings, secondaryMuscle: value })
          }
        >
          <SelectTrigger id="secondary-muscle" className="w-full">
            <SelectValue placeholder="Select secondary muscle" />
          </SelectTrigger>
          <SelectContent>
            {availableSecondaryMuscles.map((muscle) => (
              <SelectItem key={muscle} value={muscle}>
                {muscleLabelMap[muscle]}
              </SelectItem>
            ))}
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
