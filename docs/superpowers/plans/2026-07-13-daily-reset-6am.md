# Daily Reset at 6am Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the tracker's "today" roll over at 6:00am device-local time instead of midnight, so late-night entries still count toward the previous day.

**Architecture:** Single-function change in `src/lib/date.ts`. `todayDateString()` is already the sole source of truth for "today" across the app (used both when writing new entries and when filtering for today's entries in `Dashboard`, `FoodLog`, `WorkoutLog`, `ManualFoodEntry`), so no other file needs to change.

**Tech Stack:** TypeScript, Vitest (`vi.useFakeTimers()` / `vi.setSystemTime()`).

## Global Constraints

- Boundary is device-local time only — no explicit `Intl`/`Europe/Berlin` timezone resolution (per spec `docs/superpowers/specs/2026-07-13-daily-reset-6am-design.md`, "Nicht-Ziele").
- No changes to the `date` field format (`YYYY-MM-DD` string) or to any consumer of `todayDateString()`.
- No UI changes.

---

### Task 1: Shift the day boundary to 6am in `todayDateString()`

**Files:**
- Modify: `src/lib/date.ts`
- Test: `src/lib/date.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `todayDateString(): string` — same signature as before, callers (`src/components/Dashboard/Dashboard.tsx`, `src/components/Food/FoodLog.tsx`, `src/components/Food/ManualFoodEntry.tsx`, `src/components/Workout/WorkoutLog.tsx`) are unaffected and require no changes.

- [ ] **Step 1: Replace the test file with the updated boundary tests**

Overwrite `src/lib/date.test.ts` with:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { todayDateString } from './date'

describe('todayDateString', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('rolls back to the previous calendar day before 6am, across a year boundary', () => {
    // 2026-01-01 01:30 local time is still "yesterday" under the 6am cutoff.
    vi.setSystemTime(new Date(2026, 0, 1, 1, 30, 0))
    expect(todayDateString()).toBe('2025-12-31')
  })

  it('pads single-digit months and days', () => {
    vi.setSystemTime(new Date(2026, 2, 5, 12, 0, 0))
    expect(todayDateString()).toBe('2026-03-05')
  })

  it('stays on the previous day right up to 5:59am', () => {
    vi.setSystemTime(new Date(2026, 2, 5, 5, 59, 0))
    expect(todayDateString()).toBe('2026-03-04')
  })

  it('rolls over to the new day at exactly 6am', () => {
    vi.setSystemTime(new Date(2026, 2, 5, 6, 0, 0))
    expect(todayDateString()).toBe('2026-03-05')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- date.test.ts`
Expected: FAIL — the first, third, and fourth tests fail because the current implementation has no 6am cutoff (e.g. the first test currently returns `'2026-01-01'` instead of `'2025-12-31'`).

- [ ] **Step 3: Implement the 6am cutoff**

Replace the contents of `src/lib/date.ts` with:

```ts
export function todayDateString(): string {
  const now = new Date()
  const effective = new Date(now)
  if (now.getHours() < 6) {
    effective.setDate(effective.getDate() - 1)
  }
  const year = effective.getFullYear()
  const month = String(effective.getMonth() + 1).padStart(2, '0')
  const day = String(effective.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- date.test.ts`
Expected: PASS — all 4 tests green.

- [ ] **Step 5: Run the full test suite to confirm no regressions**

Run: `npm test`
Expected: PASS — all existing suites (`foodNameTranslation`, `foodScaling`, `met`, `openFoodFacts`, `tdee`, `usdaFoodData`, `date`) remain green.

- [ ] **Step 6: Commit**

```bash
git add src/lib/date.ts src/lib/date.test.ts
git commit -m "$(cat <<'EOF'
Roll tracker day boundary from midnight to 6am

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
