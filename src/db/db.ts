import Dexie, { type Table } from 'dexie'
import type { UserProfile, FoodEntry, WorkoutEntry } from './types'

export class FitteningDB extends Dexie {
  userProfile!: Table<UserProfile, number>
  foodEntries!: Table<FoodEntry, number>
  workoutEntries!: Table<WorkoutEntry, number>

  constructor() {
    super('fittening')
    this.version(1).stores({
      userProfile: '++id',
      foodEntries: '++id, date',
      workoutEntries: '++id, date',
    })
  }
}

export const db = new FitteningDB()
