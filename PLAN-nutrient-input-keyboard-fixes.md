# Plan: Nutrient Input and Keyboard UX Fixes

## Goal

Fix food/nutrient input behavior so users can enter decimal values reliably, complete one-character numeric inputs without keyboard friction, and keep focused input fields visible when the on-screen keyboard opens.

## Current issues to address

1. Some nutrient value inputs do not consistently handle float entry.
2. Entering a single character in numeric fields can leave keyboard interaction awkward (no clear completion flow).
3. Focused inputs can be obscured when the software keyboard appears.

## Scope

- Focus first on food/nutrient entry UI (`app/(tabs)/(food)/add-food.tsx`).
- Reuse and align validation logic in `utils/foodValidation.ts` where applicable.
- Optimize explicitly for Android keyboard behavior and layout handling.

## Implementation plan

### 1) Stabilize numeric input state for floats

- Keep nutrient/numeric field values as strings while the user is typing.
- Only parse to numbers at save/submit time.
- Support intermediate float states (`"."`, `"0."`, `"1."`) without resetting to `0` during editing.
- Normalize values during submit with a safe parse utility (default to `0`, clamp negatives if required by current rules).

### 2) Improve single-character input completion behavior

- Ensure numeric text inputs use return key behavior suitable for short entries.
- Add `onSubmitEditing` + `blurOnSubmit` behavior where it improves completion flow.
- Dismiss keyboard after explicit submit action (e.g., Add Food button) to prevent stuck focus.
- Confirm that one-digit values are accepted and retained without unintended reformatting.

### 3) Keep focused input visible when keyboard opens

- Tune `KeyboardAvoidingView` and Android `windowSoftInputMode` handling so focused inputs stay visible.
- Make the scroll container keyboard-aware (`keyboardShouldPersistTaps`, content padding for keyboard space).
- Scroll the focused field into view when needed (manual ref + scrollTo or keyboard-aware pattern).

### 4) Validation and parsing consistency

- Reuse/update `validateNumericInput` and `parseNumericValue` to align with float-friendly input handling.
- Ensure no regressions for required fields (`name`, `calories`) and non-negative nutrient constraints.

### 5) Verification checklist

- Prepare verification steps for Android Expo Go on a physical phone.
- Enter decimal nutrients like `12.5`, `0.3`, and `1.` then save.
- Enter single-character values like `1` in each nutrient field and complete editing via keyboard return.
- Open keyboard in lower fields; confirm the active field remains visible.
- Run project lint/test/build checks used by this repository.

## Out of scope (for this task)

- Redesigning nutrition forms or changing database schema.
- Broad refactors outside nutrient/food input and related numeric validation.

## Deliverables

1. Code changes implementing the fixes.
2. Validation/parsing updates if needed.
3. Handoff notes: current implementation status, exact manual test steps for Expo Go on Android phone, and expected outcomes.

## Execution boundary

- I implement until the point where physical-device verification is required.
- At that point I pause and provide a concise status + test checklist for you to verify on your phone via Expo Go.
