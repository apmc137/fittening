import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { todayDateString } from './date'

describe('todayDateString', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses local date components, not UTC', () => {
    // 2026-01-01 01:30 local time — UTC-1 (or further behind) would still be 2025-12-31.
    vi.setSystemTime(new Date(2026, 0, 1, 1, 30, 0))
    expect(todayDateString()).toBe('2026-01-01')
  })

  it('pads single-digit months and days', () => {
    vi.setSystemTime(new Date(2026, 2, 5, 12, 0, 0))
    expect(todayDateString()).toBe('2026-03-05')
  })
})
