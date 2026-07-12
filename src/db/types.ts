import type { Sex, ActivityLevel, Goal } from '../lib/tdee'
import type { ActivityType, Intensity } from '../lib/met'

export type FoodSource = 'barcode' | 'search' | 'manual'

export interface UserProfile {
  id?: number
  age: number
  sex: Sex
  weightKg: number
  heightCm: number
  activityLevel: ActivityLevel
  goal: Goal
  manualDailyGoalKcal?: number
}

export interface FoodEntry {
  id?: number
  date: string
  time: string
  productName: string
  barcode?: string
  source: FoodSource
  kcal: number
  protein: number
  carbs: number
  fat: number
  quantity: number
}

export interface WorkoutEntry {
  id?: number
  date: string
  time: string
  activityType: ActivityType
  durationMinutes: number
  intensity: Intensity
  estimatedKcalBurned: number
}
