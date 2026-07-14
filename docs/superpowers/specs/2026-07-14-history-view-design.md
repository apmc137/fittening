# Verlauf (History) View — Design Spec

## Problem

Dashboard, FoodLog, and WorkoutLog all filter strictly to `todayDateString()`.
Entries are persisted with a `date` field and never deleted automatically, but
there is no way to see any day other than today — once a day rolls over, its
data is effectively invisible even though it's still in IndexedDB.

## Goal

A new "Verlauf" tab showing a list of past days (newest first), each with a
one-line summary (gegessen / verbrannt / Ziel-Status), expandable to show the
individual food and workout entries for that day.

## Non-Goals

- No editing/deleting entries from history (read-only; editing stays in
  today's Food/Workout tabs).
- No charts/graphs — plain list, consistent with the rest of the app's
  minimal card style.
- No per-day historical goal — `userProfile` stores a single current goal;
  every day's status is computed against today's goal. If the user changes
  their goal, past days are re-evaluated against the new one. Acceptable
  simplification (profile has no history of its own).
- Today is included in the list like any other day (harmless, keeps the tab
  self-consistent instead of special-casing it away).

## Architecture

- **`src/lib/history.ts`** — pure function `groupEntriesByDay(foodEntries, workoutEntries)`
  → `DaySummary[]`, sorted descending by date. Testable without touching Dexie
  or React, same pattern as `date.ts`/`tdee.ts`.
- **`src/components/History/HistoryList.tsx`** — loads *all* `foodEntries` /
  `workoutEntries` (no `.where('date').equals(...)` filter) plus the profile's
  goal, groups them via `groupEntriesByDay`, renders one row per day. Clicking
  a row toggles an inline expanded detail list (no routing needed, matches
  the app's single-view-per-tab style).
- New tab wired into `App.tsx` + `IconHistory` in `icons.tsx`.

## Data shape

```ts
interface DaySummary {
  date: string // YYYY-MM-DD
  eaten: number
  burned: number
  foodEntries: FoodEntry[]
  workoutEntries: WorkoutEntry[]
}
```

Goal/remaining/status are derived in the component (same formula as
Dashboard: `remaining = goal - eaten + burned`), not stored on `DaySummary`,
since the goal is a profile-level value, not a per-entry one.
