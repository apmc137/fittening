export interface NutritionPer100g {
  kcalPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
}

export interface ScaledNutrition {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export function scaleToQuantity(nutrition: NutritionPer100g, quantityGrams: number): ScaledNutrition {
  const factor = quantityGrams / 100
  return {
    kcal: Math.round(nutrition.kcalPer100g * factor),
    protein: roundToOneDecimal(nutrition.proteinPer100g * factor),
    carbs: roundToOneDecimal(nutrition.carbsPer100g * factor),
    fat: roundToOneDecimal(nutrition.fatPer100g * factor),
  }
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10
}
