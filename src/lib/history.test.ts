import { describe, expect, it } from 'vitest'
import { groupEntriesByDay, calculateGoalStatus } from './history'
import type { FoodEntry, WorkoutEntry } from '../db/types'

function food(date: string, kcal: number): FoodEntry {
  return {
    id: Math.random(),
    date,
    time: '12:00',
    productName: 'Test',
    source: 'manual',
    kcal,
    protein: 0,
    carbs: 0,
    fat: 0,
    quantity: 100,
  }
}

function workout(date: string, kcalBurned: number): WorkoutEntry {
  return {
    id: Math.random(),
    date,
    time: '12:00',
    activityType: 'running',
    durationMinutes: 30,
    intensity: 'moderate',
    estimatedKcalBurned: kcalBurned,
  }
}

describe('groupEntriesByDay', () => {
  it('returns an empty array for no entries', () => {
    expect(groupEntriesByDay([], [])).toEqual([])
  })

  it('groups entries across multiple days, sorted descending by date', () => {
    const result = groupEntriesByDay(
      [food('2026-07-10', 500), food('2026-07-12', 300)],
      [workout('2026-07-10', 200)],
    )
    expect(result.map((d) => d.date)).toEqual(['2026-07-12', '2026-07-10'])
  })

  it('sums eaten and burned per day', () => {
    const result = groupEntriesByDay(
      [food('2026-07-10', 500), food('2026-07-10', 200)],
      [workout('2026-07-10', 150), workout('2026-07-10', 50)],
    )
    expect(result).toHaveLength(1)
    expect(result[0].eaten).toBe(700)
    expect(result[0].burned).toBe(200)
  })

  it('handles a day with only food entries (no workouts)', () => {
    const result = groupEntriesByDay([food('2026-07-11', 400)], [])
    expect(result).toHaveLength(1)
    expect(result[0].date).toBe('2026-07-11')
    expect(result[0].eaten).toBe(400)
    expect(result[0].burned).toBe(0)
    expect(result[0].foodEntries).toHaveLength(1)
    expect(result[0].workoutEntries).toEqual([])
  })

  it('handles a day with only workout entries (no food)', () => {
    const result = groupEntriesByDay([], [workout('2026-07-11', 250)])
    expect(result).toHaveLength(1)
    expect(result[0].eaten).toBe(0)
    expect(result[0].burned).toBe(250)
    expect(result[0].foodEntries).toEqual([])
    expect(result[0].workoutEntries).toHaveLength(1)
  })
})

describe('calculateGoalStatus', () => {
  it('is "met" when net kcal is exactly on goal', () => {
    expect(calculateGoalStatus(2000, 2000)).toBe('met')
  })

  it('is "met" within the ±100 kcal tolerance', () => {
    expect(calculateGoalStatus(2099, 2000)).toBe('met')
    expect(calculateGoalStatus(1901, 2000)).toBe('met')
  })

  it('is "met" right at the tolerance boundary', () => {
    expect(calculateGoalStatus(2100, 2000)).toBe('met')
    expect(calculateGoalStatus(1900, 2000)).toBe('met')
  })

  it('is "over" once net kcal exceeds goal + tolerance', () => {
    expect(calculateGoalStatus(2101, 2000)).toBe('over')
  })

  it('is "under" once net kcal falls below goal - tolerance', () => {
    expect(calculateGoalStatus(1899, 2000)).toBe('under')
  })
})
