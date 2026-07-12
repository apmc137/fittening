import { describe, expect, it } from 'vitest'
import { parseOpenFoodFactsResponse } from './openFoodFacts'

describe('parseOpenFoodFactsResponse', () => {
  it('maps a found product to a BarcodeLookupResult', () => {
    const data = {
      status: 1,
      product: {
        product_name: 'Testprodukt',
        nutriments: {
          'energy-kcal_100g': 250,
          proteins_100g: 8,
          carbohydrates_100g: 30,
          fat_100g: 9,
        },
      },
    }
    const result = parseOpenFoodFactsResponse(data, '1234567890123')
    expect(result).toEqual({
      productName: 'Testprodukt',
      barcode: '1234567890123',
      kcalPer100g: 250,
      proteinPer100g: 8,
      carbsPer100g: 30,
      fatPer100g: 9,
    })
  })

  it('returns null when the product is not found', () => {
    const data = { status: 0 }
    const result = parseOpenFoodFactsResponse(data, '0000000000000')
    expect(result).toBeNull()
  })
})
