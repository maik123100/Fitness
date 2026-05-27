# Adaptive Calorie System - Implementation Plan

## Overview
Incremental rollout of the adaptive calorie calculation system. Each phase builds on the previous one and is independently testable.

## Phase 1: Foundation (Database & Types)
**Goal**: Extend schema to support daily snapshots and historical tracking without changing UI.
**Testability**: Can query DB, no visible changes yet.

- [ x] Extend `UserProfile` schema with new fields (estimatedBMR, estimatedTDEE, confidenceLevel, etc.)
- [ x] Create `DailySnapshot` table schema
- [ x] Create `WeeklyRecalculation` table schema
- [ x] Add TypeScript types for new entities
- [ x] Update [services/db/schema.ts](services/db/schema.ts)
- [x ] Add Drizzle migration

**Estimated scope**: ~200 lines of schema code
**No UI changes**: ✓

---

## Phase 2: Daily Snapshot Recording
**Goal**: Begin capturing daily data without showing it to user yet.
**Testability**: Verify data is being saved to DailySnapshot table.

- [x] Create [services/dailySnapshotService.ts](services/dailySnapshotService.ts)
- [x] Implement `recordDailySnapshot()` function
- [x] Hook it into meal logging completion (auto-trigger after meal logged)
- [x] Verify weight data is being captured
- [x] Add console logs to verify snapshots are being recorded

**Estimated scope**: ~150 lines
**UI changes**: None (background service)

---

## Phase 3: Hunger Score UI
**Goal**: Add daily hunger prompt after meal logging.
**Testability**: User sees prompt, data saved to DB.

- [x] Create a new hunger prompt component
- [x] Add to meal logging completion flow
- [x] Store hunger score in `DailySnapshot`
- [x] Basic styling (simple modal or card)

**Verification**: Console logs show `Daily snapshot recorded` followed by `Updated hungerScore`, confirming the prompt writes back to the same daily row.

**Estimated scope**: ~100 lines
**UI changes**: Modal/card after meal entry

---

## Phase 4: Weight Entry Improvements
**Goal**: Make daily weight logging easier and more frequent.
**Testability**: User can log weight, appears in snapshots.

 - [x] Add daily weight quick-entry button on home screen
 - [x] Ensure weight is captured in `DailySnapshot`

**Estimated scope**: ~80 lines
**UI changes**: New button on dashboard

---

## Phase 5: Nutrient Calculations
**Goal**: Extend food calculations to include vitamins and minerals.
**Testability**: Verify nutrient totals are computed correctly.

- [ ] Extend [utils/foodCalculations.ts](utils/foodCalculations.ts) with `calculateNutrientTotals()`
- [ ] Add micronutrient aggregation to `DailySnapshot`
- [ ] Update types to include micronutrients
- [ ] Test with sample meals

**Estimated scope**: ~200 lines
**UI changes**: None (yet)

---

## Phase 6: Weekly Aggregation Display
**Goal**: Show user their weekly summary before recalculation happens.
**Testability**: User sees trend data on dashboard.

- [ ] Create weekly summary view component
- [ ] Display last 7 days of intake vs. target
- [ ] Display weight trend
- [ ] Display hunger average
- [ ] No calculation changes yet—just visualization

**Estimated scope**: ~150 lines
**UI changes**: New weekly summary card

---

## Phase 7: Weekly Recalculation Logic (Core)
**Goal**: Implement the adaptive algorithm WITHOUT applying it yet.
**Testability**: Run the calculation, log the result, verify math.

- [ ] Create [services/weeklyRecalculationService.ts](services/weeklyRecalculationService.ts)
- [ ] Implement `recalculateWeeklyTarget()` with adherence distinction logic
- [ ] Implement `calculateAdjustmentTerms()` (weight, hunger, adherence, confidence)
- [ ] Store results in `WeeklyRecalculation` table
- [ ] Add console logs for all intermediate calculations
- [ ] Make it on-demand (manual trigger button, not auto-scheduled yet)

**Estimated scope**: ~400 lines
**UI changes**: Debug/manual trigger button

---

## Phase 8: Apply Recalculation & Confidence
**Goal**: Actually use the new target, but show old target for comparison.
**Testability**: User can see both old and new targets side-by-side.

- [ ] Update [app/(tabs)/profile.tsx](app/(tabs)/profile.tsx) to display:
  - Old target (grayed out)
  - New target (highlighted)
  - Adjustment reason (weight, hunger, adherence, confidence)
  - Last recalculation date
- [ ] Expose new target in daily context/state
- [ ] Food logging uses new target (but show both)

**Estimated scope**: ~120 lines
**UI changes**: Profile screen shows both targets + explanation

---

## Phase 9: Nutrient Coverage Display
**Goal**: Show vitamin/mineral coverage and gaps.
**Testability**: User sees coverage bars or indicators.

- [ ] Create nutrient coverage component
- [ ] Display coverage ratio $\rho_n$ for key nutrients
- [ ] Show gap if $\rho_n < 0.8$
- [ ] Color coding (green/yellow/red)
- [ ] Click to see details

**Estimated scope**: ~180 lines
**UI changes**: New nutrient dashboard

---

## Phase 10: Automate Weekly Recalculation
**Goal**: Schedule weekly recalculation instead of manual trigger.
**Testability**: Verify it runs weekly without user intervention.

- [ ] Set up Expo background task or server cron
- [ ] Run `recalculateWeeklyTarget()` automatically every Sunday at 21:00
- [ ] Handle edge cases (user hasn't logged weight, etc.)
- [ ] Add user notification that target was updated

**Estimated scope**: ~80 lines
**UI changes**: Optional notification toast

---

## Phase 11: Polish & Safety Bounds
**Goal**: Add guardrails and refinements.
**Testability**: Verify edge cases are handled.

- [ ] Implement calorie target clamping (min/max bounds)
- [ ] Require 2-3 weeks of data before large corrections
- [ ] Validate adherence/maintenance calculations
- [ ] Test with synthetic data (extreme cases)

**Estimated scope**: ~100 lines
**UI changes**: None (logic only)

---

## Phase 12: Adaptive Micronutrient Targets
**Goal**: Adjust micronutrient targets based on goal and recent coverage.
**Testability**: Verify targets adjust for aggressive cuts.

- [ ] Create [services/nutrientTargetService.ts](services/nutrientTargetService.ts)
- [ ] Implement goal and quality modifiers
- [ ] Update targets for loss-weight goal (+15% emphasis on key nutrients)
- [ ] Update targets based on recent coverage gaps

**Estimated scope**: ~120 lines
**UI changes**: Nutrient targets update in display

---

## Total Estimated Implementation
- **Lines of code**: ~1600-1800
- **Phases**: 12
- **Parallel work**: Some phases can overlap (e.g., schema + types can be done together)
- **Testing approach**: Phone testing via Expo Go after each phase

## Testing Strategy per Phase
1. **Phases 1-2**: Check DB logs, console output
2. **Phases 3-4**: Manual UI interaction, verify DB entries
3. **Phases 5-6**: Check calculations in console, visual verification
4. **Phases 7-8**: Manual trigger, compare calculations
5. **Phases 9-12**: Full end-to-end flow testing

## Risk Mitigation
- Each phase is behind a feature flag or component prop where possible
- Never break existing meal logging or profile functionality
- Preserve old target display alongside new target
- Use shadow calculations (calculate but don't apply) in Phase 7
