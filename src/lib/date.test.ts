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
