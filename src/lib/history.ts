import type { FoodEntry, WorkoutEntry } from '../db/types'

export interface DaySummary {
  date: string
  eaten: number
  burned: number
  foodEntries: FoodEntry[]
  workoutEntries: WorkoutEntry[]
}

export function groupEntriesByDay(foodEntries: FoodEntry[], workoutEntries: WorkoutEntry[]): DaySummary[] {
  const byDate = new Map<string, DaySummary>()

  function dayFor(date: string): DaySummary {
    let day = byDate.get(date)
    if (!day) {
      day = { date, eaten: 0, burned: 0, foodEntries: [], workoutEntries: [] }
      byDate.set(date, day)
    }
    return day
  }

  for (const entry of foodEntries) {
    const day = dayFor(entry.date)
    day.eaten += entry.kcal
    day.foodEntries.push(entry)
  }

  for (const entry of workoutEntries) {
    const day = dayFor(entry.date)
    day.burned += entry.estimatedKcalBurned
    day.workoutEntries.push(entry)
  }

  return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date))
}

export type GoalStatus = 'met' | 'under' | 'over'

const GOAL_TOLERANCE_KCAL = 100

export function calculateGoalStatus(netKcal: number, goal: number, toleranceKcal = GOAL_TOLERANCE_KCAL): GoalStatus {
  const diff = netKcal - goal
  if (diff > toleranceKcal) return 'over'
  if (diff < -toleranceKcal) return 'under'
  return 'met'
}
