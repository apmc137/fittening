import { useState } from 'react'
import { Dashboard } from './components/Dashboard/Dashboard'
import { FoodLog } from './components/Food/FoodLog'
import { WorkoutLog } from './components/Workout/WorkoutLog'
import { ProfileScreen } from './components/Profile/ProfileScreen'
import './App.css'

type Tab = 'dashboard' | 'food' | 'workout' | 'profile'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Übersicht', icon: '📊' },
  { id: 'food', label: 'Essen', icon: '🍽️' },
  { id: 'workout', label: 'Sport', icon: '🏃' },
  { id: 'profile', label: 'Profil', icon: '👤' },
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
            <span className="tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
