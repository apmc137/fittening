import { useState } from 'react'
import { Dashboard } from './components/Dashboard/Dashboard'
import { FoodLog } from './components/Food/FoodLog'
import { WorkoutLog } from './components/Workout/WorkoutLog'
import { ProfileScreen } from './components/Profile/ProfileScreen'
import { IconDashboard, IconFood, IconWorkout, IconProfile } from './components/icons'
import type { ComponentType } from 'react'
import './App.css'

type Tab = 'dashboard' | 'food' | 'workout' | 'profile'

const TABS: { id: Tab; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Übersicht', Icon: IconDashboard },
  { id: 'food', label: 'Essen', Icon: IconFood },
  { id: 'workout', label: 'Sport', Icon: IconWorkout },
  { id: 'profile', label: 'Profil', Icon: IconProfile },
]

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  return (
    <div className="app">
      <main className="app-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'food' && <FoodLog />}
        {activeTab === 'workout' && <WorkoutLog />}
        {activeTab === 'profile' && <ProfileScreen />}
      </main>
      <nav className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.Icon className="tab-icon" />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
