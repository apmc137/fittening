import { describe, expect, it } from 'vitest'
import { translateFoodNameToEnglish } from './foodNameTranslation'

describe('translateFoodNameToEnglish', () => {
  it('translates a known German food name to English', () => {
    expect(translateFoodNameToEnglish('Brokkoli')).toBe('broccoli')
  })

  it('is case-insensitive and trims whitespace', () => {
    expect(translateFoodNameToEnglish('  BROKKOLI  ')).toBe('broccoli')
  })

  it('returns null for unknown terms', () => {
    expect(translateFoodNameToEnglish('Quinoa-Superfood-Bowl')).toBeNull()
  })
})
