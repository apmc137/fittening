import { describe, expect, it } from 'vitest'
import { estimateKcalBurned } from './met'

describe('estimateKcalBurned', () => {
  it('estimates calories for moderate running', () => {
    const result = estimateKcalBurned({
      activityType: 'running',
      intensity: 'moderate',
      durationMinutes: 30,
      weightKg: 80,
    })
    expect(result).toBe(392)
  })

  it('estimates calories for low-intensity cycling', () => {
    const result = estimateKcalBurned({
      activityType: 'cycling',
      intensity: 'low',
      durationMinutes: 45,
      weightKg: 70,
    })
    expect(result).toBe(210)
  })

  it('scales linearly with duration', () => {
    const thirtyMin = estimateKcalBurned({
      activityType: 'yoga',
      intensity: 'low',
      durationMinutes: 30,
      weightKg: 60,
    })
    const sixtyMin = estimateKcalBurned({
      activityType: 'yoga',
      intensity: 'low',
      durationMinutes: 60,
      weightKg: 60,
    })
    expect(sixtyMin).toBe(thirtyMin * 2)
  })
})
