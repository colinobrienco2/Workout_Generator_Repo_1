import type { Workout, WorkoutSettings, Exercise } from "./workout-types"

const chestTricepsExercises: Exercise[] = [
  {
    exercise_id: "ex-001",
    name: "Barbell Bench Press",
    category: "Compound",
    movement_type: "Horizontal Push",
    primary_muscle: "Chest",
    secondary_muscle: "Triceps, Anterior Delts",
    equipment: "Barbell, Bench",
    sets: 4,
    reps: "6-8",
    rest: "3 min",
    effort_target: "RPE 8",
    cue: "Drive through your heels and squeeze your shoulder blades together",
    progression: "Add 2.5kg when you hit 8 reps on all sets",
    media_key: "bench-press",
    substitution_ids: ["ex-007", "ex-008"],
    is_abs_finisher: false,
    tips: [
      "Keep wrists stacked over elbows throughout the lift",
      "Lower the bar to mid-chest level",
      "Maintain a slight arch in your lower back"
    ]
  },
  {
    exercise_id: "ex-002",
    name: "Incline Dumbbell Press",
    category: "Compound",
    movement_type: "Incline Push",
    primary_muscle: "Upper Chest",
    secondary_muscle: "Triceps, Front Delts",
    equipment: "Dumbbells, Incline Bench",
    sets: 3,
    reps: "8-10",
    rest: "2 min",
    effort_target: "RPE 7-8",
    cue: "Keep your elbows at 45 degrees and focus on the stretch at the bottom",
    progression: "Increase weight when form is solid at 10 reps",
    media_key: "incline-db-press",
    substitution_ids: ["ex-009"],
    is_abs_finisher: false,
    tips: [
      "Set the bench to 30-45 degrees",
      "Don&apos;t let the dumbbells drift too wide",
      "Control the eccentric for 2-3 seconds"
    ]
  },
  {
    exercise_id: "ex-003",
    name: "Cable Flyes",
    category: "Isolation",
    movement_type: "Horizontal Adduction",
    primary_muscle: "Chest",
    secondary_muscle: "Front Delts",
    equipment: "Cable Machine",
    sets: 3,
    reps: "12-15",
    rest: "90 sec",
    effort_target: "RIR 2",
    cue: "Imagine hugging a large tree and squeeze at the peak contraction",
    progression: "Focus on mind-muscle connection before adding weight",
    media_key: "cable-flyes",
    substitution_ids: ["ex-010"],
    is_abs_finisher: false,
    tips: [
      "Keep a slight bend in your elbows",
      "Step forward for more stretch",
      "Pause at the top for 1 second"
    ]
  },
  {
    exercise_id: "ex-004",
    name: "Close-Grip Bench Press",
    category: "Compound",
    movement_type: "Horizontal Push",
    primary_muscle: "Triceps",
    secondary_muscle: "Chest, Front Delts",
    equipment: "Barbell, Bench",
    sets: 3,
    reps: "8-10",
    rest: "2 min",
    effort_target: "RPE 7-8",
    cue: "Keep elbows tucked and hands shoulder-width apart",
    progression: "Add weight when you complete all reps with good form",
    media_key: "close-grip-bench",
    substitution_ids: ["ex-011"],
    is_abs_finisher: false,
    tips: [
      "Grip should be about shoulder width",
      "Lower the bar to the lower chest",
      "Lock out fully at the top"
    ]
  },
  {
    exercise_id: "ex-005",
    name: "Rope Pressdown",
    category: "Isolation",
    movement_type: "Elbow Extension",
    primary_muscle: "Triceps",
    secondary_muscle: "None",
    equipment: "Cable Machine, Rope",
    sets: 3,
    reps: "12-15",
    rest: "60 sec",
    effort_target: "RIR 1-2",
    cue: "Spread the rope at the bottom and squeeze your triceps hard",
    progression: "Add a drop set on the final set when ready",
    media_key: "rope-pressdown",
    substitution_ids: ["ex-012", "ex-013"],
    is_abs_finisher: false,
    tips: [
      "Keep your elbows pinned to your sides",
      "Don&apos;t lean forward excessively",
      "Full extension at the bottom is key"
    ]
  },
  {
    exercise_id: "ex-006",
    name: "Overhead Tricep Extension",
    category: "Isolation",
    movement_type: "Elbow Extension",
    primary_muscle: "Triceps (Long Head)",
    secondary_muscle: "None",
    equipment: "Dumbbell",
    sets: 3,
    reps: "10-12",
    rest: "60 sec",
    effort_target: "RIR 2",
    cue: "Keep your elbows close to your head and get a full stretch",
    progression: "Progress to two dumbbells when single dumbbell is easy",
    media_key: "overhead-extension",
    substitution_ids: ["ex-014"],
    is_abs_finisher: false,
    tips: [
      "Feel the stretch at the bottom",
      "Don&apos;t flare your elbows out",
      "Brace your core to protect your lower back"
    ]
  }
]

const absFinisher: Exercise = {
  exercise_id: "ex-abs-001",
  name: "Cable Crunch + Hanging Leg Raise Superset",
  category: "Core",
  movement_type: "Spinal Flexion",
  primary_muscle: "Rectus Abdominis",
  secondary_muscle: "Obliques, Hip Flexors",
  equipment: "Cable Machine, Pull-up Bar",
  sets: 3,
  reps: "15 + 10",
  rest: "60 sec",
  effort_target: "RIR 1",
  cue: "Crunch down with your abs, not your arms. On leg raises, control the swing.",
  progression: "Add weight to cable crunches as strength improves",
  media_key: "abs-superset",
  substitution_ids: ["ex-abs-002"],
  is_abs_finisher: true,
  tips: [
    "Focus on curling your ribcage toward your pelvis",
    "Exhale forcefully at the top of each rep",
    "For leg raises, stop at parallel to avoid hip flexor dominance"
  ]
}

export function generateWorkout(settings: WorkoutSettings): Workout {
  const focusLabels: Record<string, string> = {
    "chest-triceps": "Chest / Triceps",
    "legs-shoulders": "Legs / Shoulders",
    "back-biceps": "Back / Biceps"
  }

  const durationMap: Record<string, string> = {
    short: "35-45 min",
    medium: "50-60 min",
    long: "70-80 min"
  }

  let exercises = [...chestTricepsExercises]
  
  // Adjust for session length
  if (settings.sessionLength === "short") {
    exercises = exercises.slice(0, 4)
  } else if (settings.sessionLength === "long") {
    // Add an extra set to compounds
    exercises = exercises.map(ex => 
      ex.category === "Compound" ? { ...ex, sets: ex.sets + 1 } : ex
    )
  }

  // Adjust for equipment
  if (settings.equipment === "dumbbell-only") {
    exercises = exercises.map(ex => {
      if (ex.name === "Barbell Bench Press") {
        return { ...ex, name: "Dumbbell Bench Press", equipment: "Dumbbells, Bench" }
      }
      if (ex.name === "Close-Grip Bench Press") {
        return { ...ex, name: "Dumbbell Skull Crushers", equipment: "Dumbbells, Bench" }
      }
      if (ex.equipment.includes("Cable")) {
        return { ...ex, name: "Dumbbell Kickbacks", equipment: "Dumbbells" }
      }
      return ex
    })
  } else if (settings.equipment === "bodyweight") {
    exercises = [
      { ...exercises[0], name: "Push-ups", equipment: "None", sets: 4, reps: "15-20" },
      { ...exercises[1], name: "Incline Push-ups", equipment: "Elevated Surface", sets: 3, reps: "12-15" },
      { ...exercises[2], name: "Wide Push-ups", equipment: "None", sets: 3, reps: "12-15" },
      { ...exercises[3], name: "Diamond Push-ups", equipment: "None", sets: 3, reps: "10-12" },
      { ...exercises[4], name: "Tricep Dips", equipment: "Parallel Bars or Chair", sets: 3, reps: "10-12" },
      { ...exercises[5], name: "Bodyweight Tricep Extensions", equipment: "Bar or Sturdy Surface", sets: 3, reps: "12-15" }
    ].slice(0, settings.sessionLength === "short" ? 4 : 6)
  }

  if (settings.includeAbs) {
    exercises.push(absFinisher)
  }

  return {
    session_name: `${focusLabels[settings.trainingFocus]} Power Session`,
    focus: focusLabels[settings.trainingFocus],
    estimated_duration: durationMap[settings.sessionLength],
    readiness: {
      score_band: "green",
      status: "Optimal",
      reason: "Recovery metrics indicate readiness for high-intensity training",
      volume_mode: "Standard Volume"
    },
    coach_message: `Today's session targets your ${focusLabels[settings.trainingFocus].toLowerCase()} with a focus on progressive overload. We've structured the workout to hit compound movements first while you're fresh, then finish with isolation work for maximum pump and muscle fatigue.`,
    include_abs: settings.includeAbs,
    progression_summary: {
      primary_goal: "Hypertrophy with strength emphasis",
      week_strategy: "Week 2 of 4 - Building phase",
      load_bias: "Moderate to heavy loads, controlled tempo"
    },
    exercises
  }
}

export const coachResponses: Record<string, string[]> = {
  "swap-dumbbell": [
    "I replaced the barbell exercise with a dumbbell variation while maintaining the same movement pattern and muscle targeting.",
    "Switched to dumbbells. This will give you better range of motion and help address any strength imbalances."
  ],
  "swap-bodyweight": [
    "I've swapped this for a bodyweight alternative that targets the same muscles effectively.",
    "Replaced with a bodyweight variation. Focus on time under tension to maintain intensity."
  ],
  "explain-cue": [
    "This cue helps you maintain proper form and maximize muscle engagement throughout the movement.",
    "The coaching cue is designed to help you feel the target muscle working and prevent compensation from other muscle groups."
  ],
  "reduce-volume": [
    "I've reduced the total volume while keeping the key exercises. You'll still get an effective workout in less time.",
    "Volume reduced. We've prioritized the compound movements that give you the most bang for your buck."
  ],
  "increase-intensity": [
    "I've increased the RPE targets. Focus on taking each set closer to failure while maintaining good form.",
    "Intensity ramped up. Make sure to use controlled negatives and really squeeze at peak contraction."
  ],
  "decrease-intensity": [
    "I've backed off the intensity a bit. This will help with recovery while still providing a training stimulus.",
    "RPE targets lowered. This is a good approach for a deload or when recovery is compromised."
  ],
  "default": [
    "I've made that adjustment to your workout. The session maintains its effectiveness while accommodating your request.",
    "Change applied. Your workout structure remains balanced and effective."
  ]
}

export const quickPrompts: Record<string, { label: string; prompts: string[] }> = {
  "swap-exercise": {
    label: "Swap Exercise",
    prompts: [
      "Swap for dumbbell-only option",
      "Swap for bodyweight alternative",
      "Swap for a machine variation",
      "Replace with similar movement"
    ]
  },
  "explain-movement": {
    label: "Explain Movement",
    prompts: [
      "Explain this exercise cue",
      "What muscles does this target?",
      "Why is this exercise in my routine?",
      "Show me common mistakes to avoid"
    ]
  },
  "adjust-intensity": {
    label: "Adjust Intensity",
    prompts: [
      "Make this workout harder",
      "Reduce the intensity",
      "Add more sets",
      "Reduce rest times"
    ]
  },
  "shorten-workout": {
    label: "Shorten Workout",
    prompts: [
      "Remove one exercise",
      "Reduce total volume by 20%",
      "Cut to essential exercises only",
      "Create a 30-minute version"
    ]
  },
  "equipment-alternative": {
    label: "Equipment Alternative",
    prompts: [
      "No cable machine available",
      "Dumbbell-only alternatives",
      "Bodyweight substitutes",
      "Home gym modifications"
    ]
  }
}
