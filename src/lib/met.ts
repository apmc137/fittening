export type ActivityType = 'running' | 'cycling' | 'strength' | 'yoga' | 'walking' | 'swimming'
export type Intensity = 'low' | 'moderate' | 'high'

export interface KcalBurnedInput {
  activityType: ActivityType
  intensity: Intensity
  durationMinutes: number
  weightKg: number
}

// Näherungswerte nach Compendium of Physical Activities
const MET_TABLE: Record<ActivityType, Record<Intensity, number>> = {
  running: { low: 7, moderate: 9.8, high: 12.8 },
  cycling: { low: 4, moderate: 8, high: 10 },
  strength: { low: 3, moderate: 5, high: 6 },
  yoga: { low: 2.5, moderate: 3, high: 4 },
  walking: { low: 2.8, moderate: 3.5, high: 5 },
  swimming: { low: 5.8, moderate: 8.3, high: 10 },
}

export function estimateKcalBurned({ activityType, intensity, durationMinutes, weightKg }: KcalBurnedInput): number {
  const met = MET_TABLE[activityType][intensity]
  const hours = durationMinutes / 60
  return Math.round(met * weightKg * hours)
}
