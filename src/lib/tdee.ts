export type Sex = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'
export type Goal = 'lose' | 'maintain' | 'gain'

export interface TdeeInput {
  age: number
  sex: Sex
  weightKg: number
  heightCm: number
  activityLevel: ActivityLevel
  goal: Goal
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
}

const GOAL_ADJUSTMENT_KCAL: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 500,
}

export function calculateBmr({
  age,
  sex,
  weightKg,
  heightCm,
}: Pick<TdeeInput, 'age' | 'sex' | 'weightKg' | 'heightCm'>): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return sex === 'male' ? base + 5 : base - 161
}

export function calculateDailyGoalKcal(input: TdeeInput): number {
  const bmr = calculateBmr(input)
  const tdee = bmr * ACTIVITY_MULTIPLIERS[input.activityLevel]
  return Math.round(tdee + GOAL_ADJUSTMENT_KCAL[input.goal])
}
