import { useEffect, useState } from 'react'
import { db } from '../../db/db'
import { calculateDailyGoalKcal } from '../../lib/tdee'
import { todayDateString } from '../../lib/date'
import type { UserProfile } from '../../db/types'

interface DailyTotals {
  eaten: number
  burned: number
}

export function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [totals, setTotals] = useState<DailyTotals>({ eaten: 0, burned: 0 })

  useEffect(() => {
    void loadData()
  }, [])

  async function loadData() {
    const today = todayDateString()
    const [storedProfile, foodEntries, workoutEntries] = await Promise.all([
      db.userProfile.get(1),
      db.foodEntries.where('date').equals(today).toArray(),
      db.workoutEntries.where('date').equals(today).toArray(),
    ])
    setProfile(storedProfile ?? null)
    setTotals({
      eaten: foodEntries.reduce((sum, entry) => sum + entry.kcal, 0),
      burned: workoutEntries.reduce((sum, entry) => sum + entry.estimatedKcalBurned, 0),
    })
  }

  if (!profile) {
    return <p>Bitte zuerst dein Profil im Tab "Profil" ausfüllen.</p>
  }

  const goal = profile.manualDailyGoalKcal ?? calculateDailyGoalKcal(profile)
  const remaining = goal - totals.eaten + totals.burned
  const progressPercent = Math.min(100, (totals.eaten / goal) * 100)

  return (
    <section>
      <h1>Heute</h1>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
      </div>
      <p>Ziel: {goal} kcal</p>
      <p>Gegessen: {totals.eaten} kcal</p>
      <p>Verbrannt: {totals.burned} kcal</p>
      <p>Verbleibend: {remaining} kcal</p>
    </section>
  )
}
