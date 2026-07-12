import { useEffect, useState } from 'react'
import { BarcodeScanner } from './BarcodeScanner'
import { FoodSearch } from './FoodSearch'
import { ManualFoodEntry } from './ManualFoodEntry'
import { lookupBarcode } from '../../lib/openFoodFacts'
import { scaleToQuantity } from '../../lib/foodScaling'
import type { NutritionPer100g } from '../../lib/foodScaling'
import { db } from '../../db/db'
import { todayDateString } from '../../lib/date'
import type { FoodEntry, FoodSource } from '../../db/types'
import type { FoodSearchResult } from '../../lib/usdaFoodData'

type Mode = 'idle' | 'scan' | 'search' | 'manual'

interface PendingLookup extends NutritionPer100g {
  productName: string
  barcode?: string
  source: FoodSource
}

export function FoodLog() {
  const [mode, setMode] = useState<Mode>('idle')
  const [pending, setPending] = useState<PendingLookup | null>(null)
  const [quantity, setQuantity] = useState(100)
  const [error, setError] = useState<string | null>(null)
  const [todayEntries, setTodayEntries] = useState<FoodEntry[]>([])

  useEffect(() => {
    void refreshTodayEntries()
  }, [])

  async function refreshTodayEntries() {
    const entries = await db.foodEntries.where('date').equals(todayDateString()).toArray()
    setTodayEntries(entries)
  }

  async function handleBarcodeDetected(barcode: string) {
    setMode('idle')
    setError(null)
    try {
      const result = await lookupBarcode(barcode)
      if (!result) {
        setError('Produkt nicht gefunden. Bitte manuell eintragen.')
        return
      }
      setPending({ ...result, source: 'barcode' })
      setQuantity(100)
    } catch {
      setError('Abfrage fehlgeschlagen. Prüfe deine Internetverbindung.')
    }
  }

  function handleSearchSelect(result: FoodSearchResult) {
    setMode('idle')
    setPending({ ...result, source: 'search' })
    setQuantity(100)
  }

  async function confirmPending() {
    if (!pending) return
    const scaled = scaleToQuantity(pending, quantity)
    await db.foodEntries.add({
      date: todayDateString(),
      time: new Date().toTimeString().slice(0, 5),
      productName: pending.productName,
      barcode: pending.barcode,
      source: pending.source,
      quantity,
      ...scaled,
    })
    setPending(null)
    await refreshTodayEntries()
  }

  async function handleManualSaved() {
    setMode('idle')
    await refreshTodayEntries()
  }

  async function handleDelete(id: number) {
    await db.foodEntries.delete(id)
    await refreshTodayEntries()
  }

  return (
    <section>
      <h1>Essen</h1>
      {error && <p role="alert">{error}</p>}

      {mode === 'idle' && !pending && (
        <div className="button-row">
          <button onClick={() => setMode('scan')}>Barcode scannen</button>
          <button onClick={() => setMode('search')}>Lebensmittel suchen</button>
          <button onClick={() => setMode('manual')}>Manuell eintragen</button>
        </div>
      )}

      {mode === 'scan' && (
        <BarcodeScanner onDetected={handleBarcodeDetected} onCancel={() => setMode('idle')} />
      )}

      {mode === 'search' && <FoodSearch onSelect={handleSearchSelect} onCancel={() => setMode('idle')} />}

      {mode === 'manual' && <ManualFoodEntry onSaved={handleManualSaved} onCancel={() => setMode('idle')} />}

      {pending && (
        <div className="card">
          <p>{pending.productName}</p>
          <p>{pending.kcalPer100g} kcal / 100g</p>
          <label>
            Menge (g)
            <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </label>
          <button className="primary" onClick={confirmPending}>
            Hinzufügen
          </button>
          <button onClick={() => setPending(null)}>Abbrechen</button>
        </div>
      )}

      <h2>Heute</h2>
      {todayEntries.length === 0 && <p className="empty-list">Noch keine Einträge heute.</p>}
      <ul>
        {todayEntries.map((entry) => (
          <li key={entry.id}>
            <span>
              {entry.productName} — {entry.kcal} kcal ({entry.quantity}g)
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
