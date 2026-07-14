# Verlauf (History) View Implementation Plan

**Goal:** Add a read-only "Verlauf" tab listing past days (newest first) with
a per-day eaten/burned/goal summary, expandable to the day's individual
entries. See `docs/superpowers/specs/2026-07-14-history-view-design.md`.

**Tech Stack:** TypeScript, Vitest for the pure grouping logic (no
component-test harness in this repo — components are verified by running
the dev server).

## Task 1: `groupEntriesByDay` pure function

**Files:**
- Add: `src/lib/history.ts`
- Add: `src/lib/history.test.ts`

- [x] Write tests: empty input → `[]`; entries across multiple days group
  correctly; sorted descending by date; a day with only food entries (no
  workouts) and vice versa; `eaten`/`burned` are summed correctly.
- [x] Implement `groupEntriesByDay(foodEntries, workoutEntries): DaySummary[]`.
- [x] `npm test` green.

## Task 2: `HistoryList` component + tab wiring

**Files:**
- Add: `src/components/History/HistoryList.tsx`
- Modify: `src/components/icons.tsx` (add `IconHistory`)
- Modify: `src/App.tsx` (register the `history` tab)

- [x] Load all `db.foodEntries` / `db.workoutEntries` (unfiltered) + profile
  goal on mount.
- [x] Group via `groupEntriesByDay`, render newest-first list: date, eaten,
  burned, remaining-vs-goal status.
- [x] Click a row → toggle inline expanded entry list for that day.
- [x] Empty state ("Noch keine Einträge") when there's no data at all.
- [x] Wire into `App.tsx` tab bar with `IconHistory`.

## Task 3: Manual verification

- [x] `npm run build` + `npm test` clean.
- [ ] Run dev server, add a couple of entries, confirm the Verlauf tab shows
  them grouped correctly and expand/collapse works. **Not done** — no
  browser available in this sandbox (Playwright MCP needs a system Chrome
  that isn't installed here). Alex should eyeball this once deployed.
