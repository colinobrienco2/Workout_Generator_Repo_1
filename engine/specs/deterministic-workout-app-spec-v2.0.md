# Deterministic Workout App Spec v2.0

## 1. Product Summary

This app is a deterministic workout app that feels coach-like without using AI.

The app reads weekly coaching outputs from Google Sheets, combines them with structured exercise libraries and substitution rules, and displays a workout that the user can act on immediately.

The product should feel:
- structured
- responsive
- coach-like
- consistent
- not random

It should not:
- call OpenAI
- generate freeform chat
- rebuild the entire workout when one exercise is swapped
- produce unexplained changes

---

## 2. Product Goals

### Primary goals
- Display a workout for the current day or selected split
- Read weekly coaching state from the Sheets engine
- Translate weekly coaching state into deterministic workout behavior
- Allow single-exercise swaps with a button on each exercise card
- Provide a chatbot-like guided help experience using preset question flows

### Secondary goals
- Preserve exercise quality and split integrity
- Reuse existing exercise libraries and media mappings
- Be easy to scaffold in v0 and later refine in Codex

---

## 3. Inputs

## 3.1 Frontend inputs
- training_focus: chest_triceps | back_biceps | legs_shoulders | abs_core
- session_length: short | medium | long
- equipment_mode: full_gym | dumbbell_only | machine_only | bodyweight_only | hotel_gym
- include_abs: boolean
- current_day_label: optional string
- swap_request: optional object
- guided_help_request: optional object

## 3.2 Sheets engine inputs
- readiness_status
- readiness_score_band
- volume_mode
- volume_adjustment_pct
- calorie_adjustment
- deload_flag
- progression_focus
- weekly_strategy_label
- data_quality_flag
- trigger_reason
- training_note
- recovery_note
- nutrition_note
- coach_notes
- system_version
- program_week_number
- program_week_key

## 3.3 Exercise library inputs
- split exercise libraries
- master exercise library if retained and cleaned
- substitution map
- optional media manifest

---

## 4. Core Screens

## 4.1 Home / Today
Shows:
- weekly strategy banner
- coach notes summary
- generated workout cards
- swap buttons
- help launcher

## 4.2 Workout View
Shows:
- session name
- split
- estimated duration
- equipment mode
- strategy tag
- progression focus
- exercise cards in slot order

## 4.3 Guided Help
Shows:
- help categories
- preset questions
- deterministic answer cards
- optional follow-up actions

## 4.4 Settings / Preferences
Future:
- preferred equipment mode
- hide certain exercises
- favorite exercises
- injury constraints
- optional default session length

---

## 5. Workout Behavior

The app must build workouts using fixed slot structure per split.

Example medium sessions:
- chest_triceps: 3 chest + 3 triceps
- back_biceps: 3 back + 3 biceps
- legs_shoulders: 3 legs + 3 shoulders

The app uses the Sheets weekly outputs to decide:
- week strategy label
- load/progression emphasis
- whether volume should be push, maintain, pullback, or deload
- whether certain higher-fatigue exercise types should be filtered out

The app does not invent logic outside the Sheets contract.

---

## 6. Swap Behavior

Each exercise card includes a swap button.

Swap must:
- only replace that exercise card
- preserve split and slot identity
- preserve equipment compatibility
- preserve session structure
- avoid duplicates already in the current workout
- prefer same movement pattern first
- fall back to same muscle/slot family second
- return a clear reason when no substitute is available

Swap must not:
- reroll the whole workout
- silently change sets/reps for unrelated cards
- change the split
- insert invalid equipment options

---

## 7. Guided Help Behavior

The guided help system should mimic chat without free typing being required for core flows.

User enters via:
- category selection
- preset question chips
- optional context-specific follow-up chips

Examples:
- Why is this a pullback week?
- Why did calories stay the same?
- What should I focus on for this movement?
- Can I swap this for a dumbbell version?
- What does low data mean?
- What should I do on a deload week?

Responses are deterministic and assembled from:
- weekly engine outputs
- exercise metadata
- substitution rules
- preset answer templates

---

## 8. Success Criteria

The app succeeds when:
- the same inputs return the same workout
- the same swap request returns the same allowed substitute order
- weekly strategy messaging matches the Sheets engine exactly
- users feel guided without AI
- the app is easy to hand off to v0, GitHub, Vercel, and Codex

---

## 9. Non-Goals for this phase

- freeform AI chat
- auto-writing new program logic
- adaptive recommendations beyond the Sheets rule engine
- fully personalized long-term periodization inside the app
- storing every workout history edge case


## Schema normalization update
- `abs_core` is the canonical core split tag.
- All split libraries now use one canonical array schema.
- Google Sheets remains connected through the Apps Script endpoint documented in `setup/google-sheets-connection-guide-v1.1.md`.
