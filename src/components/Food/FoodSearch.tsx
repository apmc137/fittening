import { useState } from 'react'
import type { FormEvent } from 'react'
import { searchFoodByName } from '../../lib/usdaFoodData'
import type { FoodSearchResult } from '../../lib/usdaFoodData'

interface FoodSearchProps {
  onSelect: (result: FoodSearchResult) => void
  onCancel: () => void
}

export function FoodSearch({ onSelect, onCancel }: FoodSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const found = await searchFoodByName(query)
      setResults(found)
    } catch {
      setError('Suche fehlgeschlagen. Prüfe deine Internetverbindung.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="z.B. Brokkoli" />
        <button type="submit" disabled={loading}>
          Suchen
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      <ul>
        {results.map((result) => (
          <li key={result.fdcId}>
            <button onClick={() => onSelect(result)}>
              {result.productName} ({result.kcalPer100g} kcal/100g)
            </button>
          </li>
        ))}
      </ul>
      <button onClick={onCancel}>Abbrechen</button>
    </div>
  )
}
