import type { NutritionPer100g } from './foodScaling'

export interface BarcodeLookupResult extends NutritionPer100g {
  productName: string
  barcode: string
}

interface OpenFoodFactsProduct {
  status: number
  product?: {
    product_name?: string
    nutriments?: Record<string, number>
  }
}

export function parseOpenFoodFactsResponse(data: unknown, barcode: string): BarcodeLookupResult | null {
  const response = data as OpenFoodFactsProduct
  if (response.status !== 1 || !response.product) {
    return null
  }
  const nutriments = response.product.nutriments ?? {}
  return {
    productName: response.product.product_name || 'Unbekanntes Produkt',
    barcode,
    kcalPer100g: nutriments['energy-kcal_100g'] ?? 0,
    proteinPer100g: nutriments['proteins_100g'] ?? 0,
    carbsPer100g: nutriments['carbohydrates_100g'] ?? 0,
    fatPer100g: nutriments['fat_100g'] ?? 0,
  }
}

export async function lookupBarcode(barcode: string): Promise<BarcodeLookupResult | null> {
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`)
  if (!response.ok) {
    throw new Error(`Open Food Facts request failed: ${response.status}`)
  }
  const data = await response.json()
  return parseOpenFoodFactsResponse(data, barcode)
}
