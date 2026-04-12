"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dumbbell } from "lucide-react"
import type { WorkoutSettings, TrainingFocus, SessionLength, Equipment } from "@/lib/workout-types"

interface WorkoutSettingsFormProps {
  settings: WorkoutSettings
  onSettingsChange: (settings: WorkoutSettings) => void
  onGenerate: () => void
  isGenerating: boolean
}

export function WorkoutSettingsForm({
  settings,
  onSettingsChange,
  onGenerate,
  isGenerating
}: WorkoutSettingsFormProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Dumbbell className="h-5 w-5 text-primary" />
          Workout Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="training-focus">Training Focus</Label>
          <Select
            value={settings.trainingFocus}
            onValueChange={(value: TrainingFocus) =>
              onSettingsChange({ ...settings, trainingFocus: value })
            }
          >
            <SelectTrigger id="training-focus">
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
            <SelectTrigger id="session-length">
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
            <SelectTrigger id="equipment">
              <SelectValue placeholder="Select equipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-gym">Full Gym</SelectItem>
              <SelectItem value="dumbbell-only">Dumbbell Only</SelectItem>
              <SelectItem value="bodyweight">Bodyweight</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
          <Label htmlFor="include-abs" className="cursor-pointer">
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

        <Button
          className="w-full"
          size="lg"
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Generating...
            </>
          ) : (
            "Generate Workout"
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Uses structured training logic and exercise constraints to build your session.
        </p>
      </CardContent>
    </Card>
  )
}
