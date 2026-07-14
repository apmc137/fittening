import { useEffect, useState } from 'react'
import { db } from '../../db/db'
import { groupEntriesByDay, calculateGoalStatus } from '../../lib/history'
import type { DaySummary, GoalStatus } from '../../lib/history'

const STATUS_LABEL: Record<GoalStatus, string> = {
  met: 'Ziel eingehalten',
  under: 'Ziel unterboten',
  over: 'Ziel überboten',
}

interface HistoryListProps {
  goal: number | null
  excludeDate?: string
}

function formatDisplayDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })
}

export function HistoryList({ goal, excludeDate }: HistoryListProps) {
  const [days, setDays] = useState<DaySummary[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    void loadData()
  }, [])

  async function loadData() {
    const [foodEntries, workoutEntries] = await Promise.all([db.foodEntries.toArray(), db.workoutEntries.toArray()])
    setDays(groupEntriesByDay(foodEntries, workoutEntries))
  }

  const visibleDays = excludeDate ? days.filter((day) => day.date !== excludeDate) : days

  return (
    <div>
      <h2>Verlauf</h2>
      {visibleDays.length === 0 && <p className="empty-list">Noch keine vergangenen Einträge.</p>}
      <ul>
        {visibleDays.map((day) => {
          const netKcal = day.eaten - day.burned
          const status = goal !== null ? calculateGoalStatus(netKcal, goal) : null
          const isExpanded = expanded === day.date
          return (
            <li key={day.date} className="history-row">
              <button onClick={() => setExpanded(isExpanded ? null : day.date)}>
                <div className="history-row-header">
                  <span className="history-date">{formatDisplayDate(day.date)}</span>
                  {status && <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>}
                </div>
                <span className="history-stats">
                  <span className="stat-eaten">{day.eaten} kcal</span>
                  {' · '}
                  <span className="stat-burned">{day.burned} kcal</span>
                </span>
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
    </div>
  )
}
