import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { db } from '../../db/db'
import { estimateKcalBurned } from '../../lib/met'
import type { ActivityType, Intensity } from '../../lib/met'
import { todayDateString } from '../../lib/date'
import type { WorkoutEntry } from '../../db/types'

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  running: 'Laufen',
  cycling: 'Radfahren',
  strength: 'Krafttraining',
  yoga: 'Yoga',
  walking: 'Gehen',
  swimming: 'Schwimmen',
}

export function WorkoutLog() {
  const [activityType, setActivityType] = useState<ActivityType>('running')
  const [intensity, setIntensity] = useState<Intensity>('moderate')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [entries, setEntries] = useState<WorkoutEntry[]>([])

  useEffect(() => {
    void refreshEntries()
  }, [])

  async function refreshEntries() {
    const today = await db.workoutEntries.where('date').equals(todayDateString()).toArray()
    setEntries(today)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const profile = await db.userProfile.get(1)
    const weightKg = profile?.weightKg ?? 75
    const estimatedKcalBurned = estimateKcalBurned({ activityType, intensity, durationMinutes, weightKg })
    await db.workoutEntries.add({
      date: todayDateString(),
      time: new Date().toTimeString().slice(0, 5),
      activityType,
      durationMinutes,
      intensity,
      estimatedKcalBurned,
    })
    await refreshEntries()
  }

  async function handleDelete(id: number) {
    await db.workoutEntries.delete(id)
    await refreshEntries()
  }

  return (
    <section>
      <h1>Sport</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Aktivität
          <select value={activityType} onChange={(e) => setActivityType(e.target.value as ActivityType)}>
            {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Intensität
          <select value={intensity} onChange={(e) => setIntensity(e.target.value as Intensity)}>
            <option value="low">Niedrig</option>
            <option value="moderate">Mittel</option>
            <option value="high">Hoch</option>
          </select>
        </label>
        <label>
          Dauer (Minuten)
          <input
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
          />
        </label>
        <button type="submit" className="primary">
          Hinzufügen
        </button>
      </form>

      <h2>Heute</h2>
      {entries.length === 0 && <p className="empty-list">Noch keine Einträge heute.</p>}
      <ul>
        {entries.map((entry) => (
          <li key={entry.id}>
            <span>
              {ACTIVITY_LABELS[entry.activityType]} — {entry.durationMinutes} min — {entry.estimatedKcalBurned} kcal
            </span>
            <button className="danger-ghost" onClick={() => handleDelete(entry.id!)} aria-label="Löschen">
              🗑
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
