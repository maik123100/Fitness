# Calculations Plan

Goal: remove hardcoded nutrition/training placeholders and compute targets from profile, logs, and trend data.

## Scope

- Nutrition targets
- Adaptive calorie strategy
- Exercise progression targets
- Micronutrient targets
- Weekly recalculation rules

## Values To Make Dynamic

- Set weight per exercise set to the last achieved working weight
- Set reps/targets per exercise set where needed
- Base calorie intake
- Macro targets from calorie target
- Vitamin targets from age/sex/profile data
- Mineral targets from age/sex/profile data
- Calorie adjustments over time from weight trend and compliance
- Hunger/energy-empty feedback score for calorie reduction tolerance
- Workout progression targets from prior logged sets

## Current Placeholder / Static Sources

- `app/macroGraphs.tsx`
  - Hardcoded vitamin target table
  - Hardcoded mineral target table
  - Fiber target fixed at `30`
  - Macro targets partly sourced from profile, but still mixed with static fallbacks
- `app/onboarding.tsx`
  - Uses one-time calorie formula and static macro split
  - Micronutrient targets are stored as `null`
- `services/database.ts`
  - Calorie targets in period views are based on a fixed profile value plus burned calories
  - Exercise progression is read-only display logic, not an adaptive target system

## Target Behavior

### Calories

- Compute baseline calories from profile data first.
- Adjust baseline by goal.
- Recompute target calories weekly from actual weight change vs target weight change.
- Blend in a hunger/energy feedback score only when weight loss is on track.
- Reject hunger feedback when weight loss stalls or reverses during a cut.
- Enforce a fat-based theoretical ceiling before suggesting more aggressive cuts.

### Micronutrients

- Resolve vitamin and mineral targets from age, sex, and optionally weight.
- Keep the resolver centralized and deterministic.
- Expose units and source metadata for UI transparency.
- Avoid hardcoded values in screen components.

### Exercise Sets

- Store actual weight and reps per set as the source of truth.
- The target weight for each set should default to the weight achieved last time.
- Derive next-session targets from recent performance.
- Support progressive overload rules by exercise type.
- Avoid treating placeholder targets as final values.

## Spec

### 1. Baseline Calorie Model

Inputs:

- `sex`
- `birthdate` or `age`
- `height`
- `weight`
- `activityLevel`
- `goalType`

Formula:

- `BMR = MifflinStJeor(weight, height, age, sex)`
- `TDEE = BMR * activityMultiplier(activityLevel)`
- `goalOffset = cutOrBulkOffset(goalType)`
- `baselineTarget = TDEE + goalOffset`

Initial output:

- `targetCaloriesWeek0 = baselineTarget`

### 2. Weekly Calorie Adjustment

Inputs:

- `targetWeightChangePerWeek`
- `actualWeightChangePerWeek`
- `hungerFeedbackScore`
- `currentWeight`
- `goalType`

Derived values:

- `weightError = actualWeightChangePerWeek - targetWeightChangePerWeek`
- `complianceRatio = clamp(actualWeightChangePerWeek / targetWeightChangePerWeek, 0, 1.5)`

Adjustment logic:

- If `goalType` is cut and `actualWeightChangePerWeek <= 0`, ignore hunger feedback.
- If `actualWeightChangePerWeek < targetWeightChangePerWeek`, reduce the influence of hunger feedback proportionally to `complianceRatio`.
- If the user is on track, use hunger feedback as a multiplier for a small calorie adjustment.

Example adjustment:

- `feedbackWeight = complianceRatio`
- `feedbackDelta = hungerScale(hungerFeedbackScore) * maxCutAdjustment`
- `weeklyAdjustment = weightErrorToCalories(weightError) + feedbackWeight * feedbackDelta`

Final update:

- `targetCaloriesNextWeek = clamp(baselineTarget + weeklyAdjustment, minCalories, maxCalories)`

### 3. Hunger / Energy Feedback Scale

Option A: 1-10 numeric scale.

- `1 = starving / empty`
- `5 = manageable`
- `10 = very comfortable`

Option B: mapped states.

- `very_hungry`
- `hungry`
- `neutral`
- `satisfied`
- `very_full`

Mapping rule:

- Convert states to a normalized value in `[-1, 1]`.
- Only allow negative adjustments when the user is not stalled.

### 4. Fat-Based Ceiling

Purpose:

- Estimate how aggressive the cut can be before it becomes unrealistic.

Inputs:

- `bodyFatMass`
- `estimatedEnergyPerKgFat`
- `weekDuration`

Formula:

- `maxWeeklyEnergyFromFat = bodyFatMass * energyPerKgFat`
- `maxWeeklyDeficit = maxWeeklyEnergyFromFat * safetyFactor`

Use:

- If the user reports low hunger strain and the desired deficit is below the ceiling, suggest a more aggressive target.
- If the target deficit exceeds the ceiling, cap the plan and warn the user.

### 5. Set Progression

Inputs:

- last completed workout for the same exercise
- last achieved set weight
- last achieved reps
- target rep range

Rules:

- `targetSetWeight(n) = achievedSetWeightLastTime(n)`
- Qualification always compares against the original exercise slot target reps, not the last session's target reps.
- Accept a prior set as the next target only if `achievedReps >= initialTargetReps - 3`.
- Accept a prior set only if the achieved weight is higher than the original slot target weight.
- If no prior set qualifies, keep the template/default target for that slot.
- This prevents the target from ratcheting down over time and keeps the workout style stable.

### 6. Micronutrient Resolution

Inputs:

- `age`
- `sex`
- optional `pregnancy/lactation` if ever added

Output:

- `targetVitaminA`, `targetVitaminC`, etc.

Rules:

- Resolve values from a single source table.
- Prefer official guideline-based defaults.
- Keep units attached to each target.

### Vitamins / Minerals

- Derive micronutrient targets from basic profile info.
- Use age and sex as the primary inputs.
- Keep the target table centralized instead of hardcoding values in the graph screen.
- Support null/unknown cases by falling back to safe defaults.

## Proposed Implementation Steps

1. Create a target-calculation service for calories, macros, and micronutrients.
2. Move vitamin/mineral target tables out of the screen and into a reusable profile-based resolver.
3. Add weekly calorie adjustment logic based on target loss vs actual loss.
4. Add hunger/energy feedback weighting with a fallback to ignore it when weight loss stalls.
5. Define set progression rules so the next target weight equals the last achieved weight unless overridden.
6. Add the fat-based theoretical weekly loss ceiling and escalation prompt.
7. Update graph and onboarding screens to read calculated targets instead of static values.
8. Add validation and tests around the calculation rules.

## Data Flow

### Onboarding

- User enters profile basics.
- App computes baseline calories, macros, and micronutrient targets.
- Targets are saved with the profile.

### Daily Logging

- Food logs update daily nutrition totals.
- Workout logs update set completion and actual load/reps.
- Weight entries update weekly trend data.
- Hunger/energy score is recorded alongside daily or weekly check-in.

### Weekly Recalculation

- Aggregate 7-day weight trend.
- Compare actual change to target change.
- Compute calorie adjustment.
- Recompute target calories.
- Optionally recompute macros from updated calories.
- Update suggestion state for more aggressive cut if the fat ceiling allows it.

### Workout Progression

- Fetch last successful workout for the same template/exercise.
- Reuse achieved set weights as the next target weights.
- Derive progression hints from whether the user hit target reps.

### Micronutrients

- Load profile basics.
- Resolve age/sex-based targets through the central nutrient resolver.
- Render those values in charts and summaries.

## Notes

- Keep the first pass simple and deterministic.
- Prefer shared calculation helpers over screen-local formulas.
- Only add user-facing automation after the calculation source of truth is stable.
- Favor explainable adjustments over opaque optimization.
- Make every adaptive value traceable to a formula or rule.
