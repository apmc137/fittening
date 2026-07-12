import { describe, expect, it } from 'vitest'
import { calculateDailyGoalKcal } from './tdee'

describe('calculateDailyGoalKcal', () => {
  it('computes goal for a male maintaining weight', () => {
    const result = calculateDailyGoalKcal({
      age: 30,
      sex: 'male',
      weightKg: 80,
      heightCm: 180,
      activityLevel: 'moderate',
      goal: 'maintain',
    })
    expect(result).toBe(2759)
  })

  it('computes goal for a female losing weight', () => {
    const result = calculateDailyGoalKcal({
      age: 30,
      sex: 'female',
      weightKg: 65,
      heightCm: 165,
      activityLevel: 'sedentary',
      goal: 'lose',
    })
    expect(result).toBe(1144)
  })

  it('adds 500 kcal for a gain goal', () => {
    const maintain = calculateDailyGoalKcal({
      age: 25,
      sex: 'male',
      weightKg: 70,
      heightCm: 175,
      activityLevel: 'sedentary',
      goal: 'maintain',
    })
    const gain = calculateDailyGoalKcal({
      age: 25,
      sex: 'male',
      weightKg: 70,
      heightCm: 175,
      activityLevel: 'sedentary',
      goal: 'gain',
    })
    expect(gain - maintain).toBe(500)
  })
})
