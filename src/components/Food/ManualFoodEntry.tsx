import { useState } from 'react'
import type { FormEvent } from 'react'
import { db } from '../../db/db'
import { todayDateString } from '../../lib/date'

interface ManualFoodEntryProps {
  onSaved: () => void
  onCancel: () => void
}

export function ManualFoodEntry({ onSaved, onCancel }: ManualFoodEntryProps) {
  const [productName, setProductName] = useState('')
  const [kcal, setKcal] = useState(0)
  const [protein, setProtein] = useState(0)
  const [carbs, setCarbs] = useState(0)
  const [fat, setFat] = useState(0)
  const [quantity, setQuantity] = useState(100)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await db.foodEntries.add({
      date: todayDateString(),
      time: new Date().toTimeString().slice(0, 5),
      productName,
      source: 'manual',
      kcal,
      protein,
      carbs,
      fat,
      quantity,
    })
    onSaved()
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Produktname
        <input value={productName} onChange={(e) => setProductName(e.target.value)} required />
      </label>
      <label>
        Menge (g)
        <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      </label>
      <label>
        Kalorien (kcal)
        <input type="number" value={kcal} onChange={(e) => setKcal(Number(e.target.value))} />
      </label>
      <label>
        Protein (g)
        <input type="number" value={protein} onChange={(e) => setProtein(Number(e.target.value))} />
      </label>
      <label>
        Kohlenhydrate (g)
        <input type="number" value={carbs} onChange={(e) => setCarbs(Number(e.target.value))} />
      </label>
      <label>
        Fett (g)
        <input type="number" value={fat} onChange={(e) => setFat(Number(e.target.value))} />
      </label>
      <button type="submit">Hinzufügen</button>
      <button type="button" onClick={onCancel}>
        Abbrechen
      </button>
    </form>
  )
}
