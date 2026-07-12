import { describe, expect, it } from 'vitest'
import { parseUsdaSearchResponse } from './usdaFoodData'

describe('parseUsdaSearchResponse', () => {
  it('maps search results to FoodSearchResult entries', () => {
    const data = {
      foods: [
        {
          fdcId: 170379,
          description: 'Broccoli, raw',
          foodNutrients: [
            { nutrientId: 1008, value: 34 },
            { nutrientId: 1003, value: 2.8 },
            { nutrientId: 1005, value: 6.6 },
            { nutrientId: 1004, value: 0.4 },
          ],
        },
      ],
    }
    const result = parseUsdaSearchResponse(data)
    expect(result).toEqual([
      {
        fdcId: 170379,
        productName: 'Broccoli, raw',
        kcalPer100g: 34,
        proteinPer100g: 2.8,
        carbsPer100g: 6.6,
        fatPer100g: 0.4,
      },
    ])
  })

  it('defaults missing nutrients to zero', () => {
    const data = { foods: [{ fdcId: 1, description: 'Unknown', foodNutrients: [] }] }
    const result = parseUsdaSearchResponse(data)
    expect(result).toEqual([
      { fdcId: 1, productName: 'Unknown', kcalPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 },
    ])
  })

  it('returns an empty array when there are no foods', () => {
    expect(parseUsdaSearchResponse({})).toEqual([])
  })
})
