import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { db } from '../../db/db'
import { calculateDailyGoalKcal } from '../../lib/tdee'
import type { ActivityLevel, Goal, Sex } from '../../lib/tdee'
import type { UserProfile } from '../../db/types'

const EMPTY_PROFILE: UserProfile = {
  id: 1,
  age: 30,
  sex: 'male',
  weightKg: 75,
  heightCm: 175,
  activityLevel: 'moderate',
  goal: 'maintain',
}

export function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    void loadProfile()
  }, [])

  async function loadProfile() {
    const existing = await db.userProfile.get(1)
    if (existing) setProfile(existing)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await db.userProfile.put(profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const calculatedGoal = calculateDailyGoalKcal(profile)

  return (
    <section>
      <h1>Profil</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Alter
          <input
            type="number"
            value={profile.age}
            onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
          />
        </label>
        <label>
          Geschlecht
          <select
            value={profile.sex}
            onChange={(e) => setProfile({ ...profile, sex: e.target.value as Sex })}
          >
            <option value="male">Männlich</option>
            <option value="female">Weiblich</option>
          </select>
        </label>
        <label>
          Gewicht (kg)
          <input
            type="number"
            value={profile.weightKg}
            onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) })}
          />
        </label>
        <label>
          Größe (cm)
          <input
            type="number"
            value={profile.heightCm}
            onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })}
          />
        </label>
        <label>
          Aktivitätslevel
          <select
            value={profile.activityLevel}
            onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as ActivityLevel })}
          >
            <option value="sedentary">Sitzend</option>
            <option value="light">Leicht aktiv</option>
            <option value="moderate">Mäßig aktiv</option>
            <option value="active">Aktiv</option>
            <option value="veryActive">Sehr aktiv</option>
          </select>
        </label>
        <label>
          Ziel
          <select
            value={profile.goal}
            onChange={(e) => setProfile({ ...profile, goal: e.target.value as Goal })}
          >
            <option value="lose">Abnehmen</option>
            <option value="maintain">Halten</option>
            <option value="gain">Zunehmen</option>
          </select>
        </label>
        <p>Berechnetes Tagesziel: {calculatedGoal} kcal</p>
        <label>
          Tagesziel manuell überschreiben (optional)
          <input
            type="number"
            value={profile.manualDailyGoalKcal ?? ''}
            onChange={(e) =>
              setProfile({
                ...profile,
                manualDailyGoalKcal: e.target.value === '' ? undefined : Number(e.target.value),
              })
            }
          />
        </label>
        <button type="submit">Speichern</button>
        {saved && <p>Gespeichert!</p>}
      </form>
    </section>
  )
}
