import { useState } from 'react'
import { BarcodeScanner } from './BarcodeScanner'
import { lookupBarcode } from '../../lib/openFoodFacts'
import { scaleToQuantity } from '../../lib/foodScaling'
import type { NutritionPer100g } from '../../lib/foodScaling'
import { db } from '../../db/db'
import { todayDateString } from '../../lib/date'
import type { FoodSource } from '../../db/types'

type Mode = 'idle' | 'scan'

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
  }

  return (
    <section>
      <h1>Essen</h1>
      {error && <p role="alert">{error}</p>}

      {mode === 'idle' && !pending && (
        <div>
          <button onClick={() => setMode('scan')}>Barcode scannen</button>
        </div>
      )}

      {mode === 'scan' && (
        <BarcodeScanner onDetected={handleBarcodeDetected} onCancel={() => setMode('idle')} />
      )}

      {pending && (
        <div>
          <p>{pending.productName}</p>
          <p>{pending.kcalPer100g} kcal / 100g</p>
          <label>
            Menge (g)
            <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </label>
          <button onClick={confirmPending}>Hinzufügen</button>
          <button onClick={() => setPending(null)}>Abbrechen</button>
        </div>
      )}
    </section>
  )
}
