# Fittening — Sport- & Kalorientracking PWA — Design

## Zweck

Persönliche Progressive-Web-App (PWA) für Alex zum Tracken von Ernährung (Kalorien/Makros) und Sport, nutzbar auf dem iPhone wie eine native App (Home-Screen-Icon, Vollbild, offlinefähig). Kein Team-/Mehrbenutzer-Anspruch — Solo-Projekt, kein Backend.

## Nicht-Ziele

- Kein Mehrbenutzer-Support, kein Login/Account-System
- Kein Android-Support (kann später ergänzt werden, da PWA — aber nicht Teil dieses Scopes)
- Kein Zugriff auf Apple Health/HealthKit (technisch nicht möglich aus einer PWA heraus)
- Kein Server-Backend, keine Cloud-Synchronisierung

## Architektur

- **Frontend:** React + Vite + TypeScript
- **PWA-Tooling:** `vite-plugin-pwa` für Service Worker (Offline-Caching, Installierbarkeit)
- **Lokale Datenhaltung:** IndexedDB via `Dexie.js` — alle Nutzerdaten bleiben ausschließlich auf dem Gerät
- **Hosting:** GitHub Pages im Repo `apmc137/fittening`, automatischer Deploy via GitHub Actions bei Push auf `main`
- **Externe APIs:**
  - [Open Food Facts](https://world.openfoodfacts.org/data) für Barcode-Lookup verpackter Produkte (kostenlos, kein API-Key).
  - [USDA FoodData Central](https://fdc.nal.usda.gov/api-guide) für Namens-Suche generischer/frischer Lebensmittel ohne Barcode (z.B. "Brokkoli") — sehr gute Abdeckung für Grundzutaten, kostenlos mit API-Key.
  - Nur für den Lookup-Moment ist Internet nötig — die App selbst läuft offline.

## Datenmodell (lokal, IndexedDB via Dexie)

```
UserProfile
  - age, weightKg, heightCm, activityLevel, goal (lose|maintain|gain)
  - calculatedDailyGoalKcal   // via Mifflin-St-Jeor TDEE-Formel
  - manualDailyGoalKcal?      // überschreibt calculatedDailyGoalKcal, falls gesetzt

FoodEntry
  - id, date, time
  - productName, barcode?
  - source (barcode | search | manual)
  - kcal, protein, carbs, fat   // Werte für die tatsächlich geloggte Menge
  - quantity

WorkoutEntry
  - id, date, time
  - activityType (aus fester MET-Tabelle)
  - durationMinutes, intensity
  - estimatedKcalBurned        // berechnet aus MET-Wert × Gewicht × Dauer
```

## Kernflows

1. **Onboarding:** Profil einmalig ausfüllen (Alter, Gewicht, Größe, Aktivitätslevel, Ziel) → App berechnet Tagesziel per Mifflin-St-Jeor-Formel. Jederzeit im Profil einsehbar und manuell überschreibbar.
2. **Essen loggen:**
   - **Barcode-Scan** (verpackte Produkte): Kamera scannen (`html5-qrcode` oder vergleichbare Lib) → Lookup via Open Food Facts → kcal/Makros automatisch übernehmen, Menge anpassen.
   - **Namens-Suche** (frische/generische Lebensmittel ohne Barcode, z.B. "Brokkoli"): Freitext eintippen → Treffer aus USDA FoodData Central (kcal/Makros pro 100g) auswählen → nur noch Menge eingeben (z.B. 150g), App berechnet kcal/Makros für die Menge automatisch.
   - **Fallback (rein manuell):** Produktname, kcal, Makros, Menge komplett selbst eintragen — greift wenn kein Treffer gefunden wird oder kein Netz verfügbar ist.
3. **Sport loggen:** Aktivität aus fester Liste wählen (Laufen, Kraft, Rad, Yoga, …), Dauer + Intensität eintragen → App schätzt verbrannte kcal via MET-Wert × Körpergewicht.
4. **Tagesübersicht (Dashboard):** Kalorien gegessen vs. verbrannt vs. Tagesziel (visuell, z.B. Ring/Balken), plus einfacher Verlauf über die letzten Tage/Wochen.
5. **Backup/Export:** Button zum Export aller Daten als JSON-Datei (Download) sowie Import derselben — Sicherheitsnetz gegen Datenverlust bei Neuinstallation/Gerätewechsel, da es keine Cloud-Sync gibt.

## Fehlerbehandlung / Edge Cases

- Kein Netz beim Barcode-Scan/bei der Namens-Suche → Hinweis anzeigen, manuelle Eingabe bleibt jederzeit möglich; App-Grundfunktion (Anzeige, bereits geloggte Daten, Sport-Logging) funktioniert vollständig offline.
- Barcode nicht in Open Food Facts gefunden, oder kein Treffer bei der Namens-Suche in USDA FoodData Central → manuelle Eingabe.
- Kamera-Zugriff vom Nutzer verweigert → manuelle Suche/Eingabe bleibt immer verfügbar, kein Blocker.

## Testing

- Unit-Tests (Vitest) für die Berechnungslogik: TDEE-Formel (Tagesziel-Berechnung) und MET-basierte Kalorienschätzung fürs Sport-Logging.
- Kein E2E-Test-Overhead — manuelles Testen auf dem iPhone vor jedem Release, da Solo-Projekt ohne CI-Gate-Anspruch.

## Deployment

- GitHub Actions Workflow: Push auf `main` → `npm run build` → Deploy auf GitHub Pages.
- Einmalige Installation: App-URL in Safari öffnen → "Zum Home-Bildschirm hinzufügen".
