import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { App } from './App'
import './index.css'

// Homescreen PWAs are rarely fully closed, so the browser's own SW update
// check (tied to navigation) can go days without firing. Poll explicitly and
// reload as soon as a new version takes control.
const UPDATE_CHECK_INTERVAL_MS = 60_000

const updateServiceWorker = registerSW({
  onRegisteredSW(_url, registration) {
    if (!registration) return
    setInterval(() => {
      void registration.update()
    }, UPDATE_CHECK_INTERVAL_MS)
  },
  onNeedRefresh() {
    void updateServiceWorker(true)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
