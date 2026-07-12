import type { NutritionPer100g } from './foodScaling'
import { translateFoodNameToEnglish } from './foodNameTranslation'

export interface FoodSearchResult extends NutritionPer100g {
  fdcId: number
  productName: string
}

interface UsdaNutrient {
  nutrientId: number
  value: number
}

interface UsdaFood {
  fdcId: number
  description: string
  foodNutrients?: UsdaNutrient[]
}

interface UsdaSearchResponse {
  foods?: UsdaFood[]
}

const NUTRIENT_IDS = {
  kcal: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
}

function findNutrientValue(nutrients: UsdaNutrient[] | undefined, nutrientId: number): number {
  return nutrients?.find((n) => n.nutrientId === nutrientId)?.value ?? 0
}

export function parseUsdaSearchResponse(data: unknown): FoodSearchResult[] {
  const response = data as UsdaSearchResponse
  const foods = response.foods ?? []
  return foods.map((food) => ({
    fdcId: food.fdcId,
    productName: food.description,
    kcalPer100g: findNutrientValue(food.foodNutrients, NUTRIENT_IDS.kcal),
    proteinPer100g: findNutrientValue(food.foodNutrients, NUTRIENT_IDS.protein),
    carbsPer100g: findNutrientValue(food.foodNutrients, NUTRIENT_IDS.carbs),
    fatPer100g: findNutrientValue(food.foodNutrients, NUTRIENT_IDS.fat),
  }))
}

export async function searchFoodByName(query: string): Promise<FoodSearchResult[]> {
  const results = await performUsdaSearch(query)
  if (results.length > 0) {
    return results
  }
  const translated = translateFoodNameToEnglish(query)
  if (!translated) {
    return results
  }
  return performUsdaSearch(translated)
}

async function performUsdaSearch(query: string): Promise<FoodSearchResult[]> {
  const apiKey = import.meta.env.VITE_USDA_API_KEY
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${apiKey}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`USDA FoodData Central request failed: ${response.status}`)
  }
  const data = await response.json()
  return parseUsdaSearchResponse(data)
}
