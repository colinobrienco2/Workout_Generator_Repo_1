# Deterministic Workout Engine Rules v2.0

## 1. Source hierarchy

Use this order of truth:
1. Google Sheets formulas backup
2. Weekly Summary exported values
3. Exercise library metadata
4. Substitution rules
5. UI presentation defaults

Do not let frontend guesses override Sheets outputs.

---

## 2. Weekly strategy mapping

The app must accept the Sheets engine outputs as final.

Use:
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
- coach_notes

Interpretation:
- High => push emphasis
- Moderate => maintain emphasis
- Low => conservative / pullback emphasis
- Deload => recovery-first week
- Low Data => maintain, but warn that more logging is needed

---

## 3. Session construction

## 3.1 Fixed split templates

### chest_triceps
- short: chest_primary, chest_secondary, triceps_main, triceps_iso
- medium: chest_primary, chest_secondary, chest_accessory, triceps_main, triceps_secondary, triceps_iso
- long: same six slots, with longer rest or higher set count where allowed

### back_biceps
- short: back_vertical, back_row, biceps_main, biceps_secondary
- medium: back_vertical, back_row, back_accessory, biceps_main, biceps_secondary, biceps_accessory
- long: same six slots, with volume adjustment only

### legs_shoulders
- short: legs_primary, legs_secondary, shoulders_primary, shoulders_lateral
- medium: legs_primary, legs_secondary, legs_accessory, shoulders_primary, shoulders_lateral, shoulders_secondary
- long: same six slots, with volume adjustment only

### abs_core
- optional addon or separate compact session
- should not break the main split selection rules

---

## 4. Exercise selection filters

An exercise is eligible only if it passes all filters:
- matches training_focus
- matches required slot_id or slot_family
- allowed for current equipment_mode
- not already used in the session
- not blocked by deload/readiness constraints
- not explicitly excluded by the user later

Selection priority:
1. staple movement that fits exact slot
2. same movement_type and same slot_family
3. same muscle target and same slot_family
4. fallback within split only if marked safe for that slot

---

## 5. Sets and reps assignment

The app can keep exercise identity and only alter prescription display.

Base behavior:
- High / Push: keep standard structure, allow top-end set/reps prescription
- Moderate / Maintain: standard structure
- Low / Pullback: slightly reduced effort or lower set count where configured
- Deload: lower volume, simpler execution, avoid highest-fatigue options
- Low Data: maintain structure, but attach data-quality message

Do not change every exercise individually unless rules explicitly say so.
Prefer session-level prescription bands.

---

## 6. Coach banner assembly

Coach banner should be deterministic and short.

Compose from:
- weekly_strategy_label
- progression_focus
- trigger_reason
- coach_notes

Priority:
1. explain the week
2. clarify the training emphasis
3. avoid sounding random

---

## 7. Swap engine rules

When a user presses swap:
1. identify the current card's slot_id
2. fetch allowed substitutes for that slot
3. filter by equipment_mode
4. filter out duplicates already in the session
5. prefer same movement_type
6. prefer same prime muscle target
7. select the highest-ranked valid candidate
8. update only that card

If no valid candidate exists:
- keep the original card
- return deterministic message explaining why

---

## 8. Guided help rules

Guided help answers should be assembled from known fields.

Examples:
- "Why is this a deload week?" -> use readiness_status, trigger_reason, progression_focus
- "Why are calories unchanged?" -> use calorie_adjustment and nutrition_note
- "Why can’t I swap this?" -> use slot lock + equipment + candidate filter result
- "What should I focus on here?" -> use exercise coaching text + progression focus

No freeform generation. No speculative advice.

---

## 9. Logging/data behavior

If data_quality_flag is low_data:
- show a visible quality warning
- avoid overstating precision
- answer help questions by pointing back to logging consistency

If days_logged is below threshold:
- preserve structure
- avoid aggressive progression changes

---

## 10. Determinism standard

For identical inputs, the app must produce identical:
- session layout
- exercise ordering
- swap candidate ranking
- help response text
