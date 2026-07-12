import { describe, expect, it } from 'vitest'
import { scaleToQuantity } from './foodScaling'

describe('scaleToQuantity', () => {
  it('scales per-100g nutrition to a 150g portion', () => {
    const result = scaleToQuantity(
      { kcalPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 6.6, fatPer100g: 0.4 },
      150,
    )
    expect(result).toEqual({ kcal: 51, protein: 4.2, carbs: 9.9, fat: 0.6 })
  })

  it('returns zero nutrition for zero quantity', () => {
    const result = scaleToQuantity(
      { kcalPer100g: 200, proteinPer100g: 10, carbsPer100g: 20, fatPer100g: 5 },
      0,
    )
    expect(result).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0 })
  })
})
