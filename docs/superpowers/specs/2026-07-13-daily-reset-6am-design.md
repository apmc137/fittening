# Täglicher Reset um 6 Uhr — Design

## Zweck

Kalorien-Tracker und Sport-Log sollen sich nicht um Mitternacht, sondern erst um **6:00 Uhr morgens** auf einen neuen Tag umstellen. Bis dahin zählt alles Geloggte noch zum Vortag (z. B. ein spätes Essen um 1 Uhr nachts erscheint noch im "heutigen" — eigentlich gestrigen — Log).

## Ansatz

Änderung ausschließlich in `src/lib/date.ts`, Funktion `todayDateString()`:

- Gerätezeit (`new Date()`) bleibt Grundlage — keine explizite Europe/Berlin-Zeitzonenauflösung nötig, solange das Gerät auf deutscher Zeit steht. DST wird dabei automatisch korrekt behandelt, da JS-`Date`-Lokalmethoden die Zeitzoneneinstellung des Geräts (inkl. Sommer-/Winterzeit) selbst auflösen.
- Ist die aktuelle Stunde `< 6`, gilt der **Vortag** als "heute"; ab Stunde `≥ 6` der aktuelle Kalendertag.
- Tagwechsel via `setDate(effective.getDate() - 1)` — Monats-/Jahresgrenzen werden dabei von `Date` selbst korrekt aufgelöst.

```ts
export function todayDateString(): string {
  const now = new Date()
  const effective = new Date(now)
  if (now.getHours() < 6) {
    effective.setDate(effective.getDate() - 1)
  }
  const year = effective.getFullYear()
  const month = String(effective.getMonth() + 1).padStart(2, '0')
  const day = String(effective.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
```

`todayDateString()` ist bereits die einzige Stelle im Code, die "heute" bestimmt — sowohl beim Schreiben neuer Einträge (`FoodLog`, `WorkoutLog`, `ManualFoodEntry`) als auch beim Filtern (`Dashboard`, `FoodLog`, `WorkoutLog`). Keine dieser Stellen muss geändert werden.

## Nicht-Ziele

- Keine explizite Europe/Berlin-Zeitzonenauflösung über `Intl` — es wird angenommen, dass das Gerät korrekt auf deutscher Zeit läuft.
- Keine Änderung an Datenmodell oder Storage-Schema — `date`-Feld bleibt ein einfacher `YYYY-MM-DD`-String.
- Keine UI-Änderung (z. B. kein Hinweis "Tag endet erst um 6 Uhr").

## Tests

`date.test.ts` wird um Fälle für die neue Grenze erweitert:

- Kurz vor 6 Uhr (z. B. 5:59) → Vortag
- Genau/kurz nach 6 Uhr (z. B. 6:00, 6:01) → aktueller Tag
- Tageswechsel über Monats-/Jahresgrenze hinweg (z. B. 1. Januar 2:00 Uhr → 31. Dezember des Vorjahres)

Bestehender Test "uses local date components, not UTC" (Fall 2026-01-01 01:30) wird angepasst, da dieser Zeitpunkt nach neuer Logik auf den 31.12.2025 rollt statt auf den 1.1.2026.
