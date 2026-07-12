import { db } from '../db/db'
import type { UserProfile, FoodEntry, WorkoutEntry } from '../db/types'

export interface BackupData {
  version: 1
  exportedAt: string
  userProfile: UserProfile[]
  foodEntries: FoodEntry[]
  workoutEntries: WorkoutEntry[]
}

export async function exportBackup(): Promise<BackupData> {
  const [userProfile, foodEntries, workoutEntries] = await Promise.all([
    db.userProfile.toArray(),
    db.foodEntries.toArray(),
    db.workoutEntries.toArray(),
  ])
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    userProfile,
    foodEntries,
    workoutEntries,
  }
}

export async function importBackup(data: BackupData): Promise<void> {
  await db.transaction('rw', db.userProfile, db.foodEntries, db.workoutEntries, async () => {
    await db.userProfile.clear()
    await db.foodEntries.clear()
    await db.workoutEntries.clear()
    await db.userProfile.bulkAdd(data.userProfile)
    await db.foodEntries.bulkAdd(data.foodEntries)
    await db.workoutEntries.bulkAdd(data.workoutEntries)
  })
}
