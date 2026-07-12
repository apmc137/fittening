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
    return (
      <section>
        <h1>Heute</h1>
        <div className="empty-state">
          <p>Bitte zuerst dein Profil im Tab "Profil" ausfüllen.</p>
        </div>
      </section>
    )
  }

  const goal = profile.manualDailyGoalKcal ?? calculateDailyGoalKcal(profile)
  const remaining = goal - totals.eaten + totals.burned
  const progressPercent = goal > 0 ? Math.min(100, (totals.eaten / goal) * 100) : 0

  return (
    <section>
      <h1>Heute</h1>
      <div
        className="progress-ring"
        style={{ background: `conic-gradient(var(--accent) ${progressPercent}%, var(--track) 0)` }}
      >
        <div className="progress-ring-inner">
          <span className="progress-ring-value">{remaining}</span>
          <span className="progress-ring-label">kcal übrig</span>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Ziel</span>
          <span className="stat-value">{goal}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Gegessen</span>
          <span className="stat-value stat-eaten">{totals.eaten}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Verbrannt</span>
          <span className="stat-value stat-burned">{totals.burned}</span>
        </div>
      </div>
    </section>
  )
}
