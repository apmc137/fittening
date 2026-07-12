import { useState } from 'react'
import { Dashboard } from './components/Dashboard/Dashboard'
import { FoodLog } from './components/Food/FoodLog'
import { WorkoutLog } from './components/Workout/WorkoutLog'
import { ProfileScreen } from './components/Profile/ProfileScreen'
import './App.css'

type Tab = 'dashboard' | 'food' | 'workout' | 'profile'

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Übersicht' },
  { id: 'food', label: 'Essen' },
  { id: 'workout', label: 'Sport' },
  { id: 'profile', label: 'Profil' },
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
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
