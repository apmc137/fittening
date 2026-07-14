import { useEffect, useState } from 'react'
import { db } from '../../db/db'
import { calculateDailyGoalKcal } from '../../lib/tdee'
import { groupEntriesByDay } from '../../lib/history'
import type { DaySummary } from '../../lib/history'
import type { UserProfile } from '../../db/types'

function formatDisplayDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })
}

export function HistoryList() {
  const [days, setDays] = useState<DaySummary[]>([])
  const [goal, setGoal] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    void loadData()
  }, [])

  async function loadData() {
    const [profile, foodEntries, workoutEntries] = await Promise.all([
      db.userProfile.get(1),
      db.foodEntries.toArray(),
      db.workoutEntries.toArray(),
    ])
    setGoal(profile ? (profile as UserProfile).manualDailyGoalKcal ?? calculateDailyGoalKcal(profile) : null)
    setDays(groupEntriesByDay(foodEntries, workoutEntries))
  }

  return (
    <section>
      <h1>Verlauf</h1>
      {days.length === 0 && <p className="empty-list">Noch keine Einträge vorhanden.</p>}
      <ul>
        {days.map((day) => {
          const remaining = goal !== null ? goal - day.eaten + day.burned : null
          const isExpanded = expanded === day.date
          return (
            <li key={day.date} className="history-row">
              <button onClick={() => setExpanded(isExpanded ? null : day.date)}>
                <div className="history-row-header">
                  <span className="history-date">{formatDisplayDate(day.date)}</span>
                  <span className="history-stats">
                    <span className="stat-eaten">{day.eaten} kcal</span>
                    {' · '}
                    <span className="stat-burned">{day.burned} kcal</span>
                    {remaining !== null && (
                      <>
                        {' · '}
                        <span>{remaining >= 0 ? `${remaining} übrig` : `${-remaining} über Ziel`}</span>
                      </>
                    )}
                  </span>
                </div>
              </button>
              {isExpanded && (
                <div className="history-details">
                  {day.foodEntries.length === 0 && day.workoutEntries.length === 0 && (
                    <p className="empty-list">Keine Details.</p>
                  )}
                  {day.foodEntries.map((entry) => (
                    <p key={`food-${entry.id}`}>
                      🍽 {entry.productName} — {entry.kcal} kcal ({entry.quantity}g)
                    </p>
                  ))}
                  {day.workoutEntries.map((entry) => (
                    <p key={`workout-${entry.id}`}>
                      🏃 {entry.activityType} — {entry.durationMinutes} min, {entry.estimatedKcalBurned} kcal
                    </p>
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
