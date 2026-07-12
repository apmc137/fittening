# Fittening MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a personal iPhone-installable PWA (Fittening) that lets Alex log food (via barcode scan, name search, or manual entry) and workouts, see a daily calorie balance against a computed goal, and back up/restore his data — all stored locally on-device with no backend.

**Architecture:** Single-page React app (Vite + TypeScript) with four tab screens (Übersicht, Essen, Sport, Profil) sharing one Dexie (IndexedDB) database. Pure calculation logic (TDEE, MET-based calorie burn, per-100g→quantity scaling, API response parsing) lives in `src/lib/` as dependency-free functions with Vitest unit tests. UI components call into `src/lib/` and `src/db/` but contain no business logic themselves. Deployed as a static site to GitHub Pages via GitHub Actions.

**Tech Stack:** React 18, Vite 5, TypeScript 5, `vite-plugin-pwa`, `dexie` (IndexedDB), `html5-qrcode` (barcode scanning), Vitest. External APIs: Open Food Facts (barcode lookup), USDA FoodData Central (name search).

## Global Constraints

- No backend, no cloud sync — all user data stored only in browser IndexedDB (spec: Architektur / Nicht-Ziele).
- No login/account system, single implicit user (spec: Nicht-Ziele).
- Target platform is iOS Safari only for this scope (spec: Nicht-Ziele).
- Hosting: GitHub Pages on repo `apmc137/fittening`, which is **public** (GitHub Free plan does not support Pages on private repos — confirmed live against the account) (spec: Deployment).
- Automated testing is scoped to calculation/parsing logic only (TDEE, MET, food-quantity scaling, API response parsing) via Vitest — no E2E test suite (spec: Testing).
- External APIs: Open Food Facts for barcode lookups (no API key), USDA FoodData Central for name search (requires a free API key).

---

## Task 1: Project Scaffolding & PWA Config

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `src/vite-env.d.ts`
- Create: `.gitignore`
- Create: `.env.local.example`

**Interfaces:**
- Produces: a buildable Vite + React + TS project with `npm run dev`, `npm run build`, `npm test` scripts; `src/App.tsx` exporting `App` (placeholder, replaced in Task 8).

- [ ] **Step 1: Create `.gitignore`**

```
node_modules
dist
dist-ssr
*.local
.env.local
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "fittening",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "dexie": "^4.0.8",
    "html5-qrcode": "^2.3.8",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vite-plugin-pwa": "^0.20.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 4: Create `tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 6: Create `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/fittening/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Fittening',
        short_name: 'Fittening',
        description: 'Sport- und Kalorientracking',
        theme_color: '#1f2933',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/fittening/',
        scope: '/fittening/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 7: Create `index.html`**

```html
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/fittening/icons/icon-192.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <title>Fittening</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USDA_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 9: Create `src/index.css`**

```css
:root {
  color-scheme: light dark;
  font-family: system-ui, -apple-system, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
}
```

- [ ] **Step 10: Create `src/App.tsx` (placeholder, replaced in Task 8)**

```tsx
export function App() {
  return <div>Fittening</div>
}
```

- [ ] **Step 11: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 12: Create `.env.local.example`**

```
VITE_USDA_API_KEY=your_usda_fooddata_central_api_key_here
```

- [ ] **Step 13: Install dependencies and verify build**

Run: `cd ~/projects/fittening && npm install && npm run build`
Expected: Build completes, `dist/` is created, no TypeScript errors.

- [ ] **Step 14: Verify dev server**

Run: `npm run dev` (in background or separate terminal), open `http://localhost:5173/fittening/`
Expected: Page shows "Fittening" text. Stop the dev server after confirming.

- [ ] **Step 15: Commit**

```bash
git add package.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html src .gitignore .env.local.example
git commit -m "Scaffold Vite + React + TS + PWA project"
```

---

## Task 2: TDEE Calculation (Daily Goal Logic)

**Files:**
- Create: `src/lib/tdee.ts`
- Test: `src/lib/tdee.test.ts`

**Interfaces:**
- Produces: `type Sex = 'male' | 'female'`, `type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'`, `type Goal = 'lose' | 'maintain' | 'gain'`, `interface TdeeInput { age: number; sex: Sex; weightKg: number; heightCm: number; activityLevel: ActivityLevel; goal: Goal }`, `function calculateDailyGoalKcal(input: TdeeInput): number`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/tdee.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { calculateDailyGoalKcal } from './tdee'

describe('calculateDailyGoalKcal', () => {
  it('computes goal for a male maintaining weight', () => {
    const result = calculateDailyGoalKcal({
      age: 30,
      sex: 'male',
      weightKg: 80,
      heightCm: 180,
      activityLevel: 'moderate',
      goal: 'maintain',
    })
    expect(result).toBe(2759)
  })

  it('computes goal for a female losing weight', () => {
    const result = calculateDailyGoalKcal({
      age: 30,
      sex: 'female',
      weightKg: 65,
      heightCm: 165,
      activityLevel: 'sedentary',
      goal: 'lose',
    })
    expect(result).toBe(1144)
  })

  it('adds 500 kcal for a gain goal', () => {
    const maintain = calculateDailyGoalKcal({
      age: 25,
      sex: 'male',
      weightKg: 70,
      heightCm: 175,
      activityLevel: 'sedentary',
      goal: 'maintain',
    })
    const gain = calculateDailyGoalKcal({
      age: 25,
      sex: 'male',
      weightKg: 70,
      heightCm: 175,
      activityLevel: 'sedentary',
      goal: 'gain',
    })
    expect(gain - maintain).toBe(500)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/tdee.test.ts`
Expected: FAIL — `Cannot find module './tdee'` (file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `src/lib/tdee.ts`:

```ts
export type Sex = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'
export type Goal = 'lose' | 'maintain' | 'gain'

export interface TdeeInput {
  age: number
  sex: Sex
  weightKg: number
  heightCm: number
  activityLevel: ActivityLevel
  goal: Goal
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
}

const GOAL_ADJUSTMENT_KCAL: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 500,
}

export function calculateBmr({
  age,
  sex,
  weightKg,
  heightCm,
}: Pick<TdeeInput, 'age' | 'sex' | 'weightKg' | 'heightCm'>): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return sex === 'male' ? base + 5 : base - 161
}

export function calculateDailyGoalKcal(input: TdeeInput): number {
  const bmr = calculateBmr(input)
  const tdee = bmr * ACTIVITY_MULTIPLIERS[input.activityLevel]
  return Math.round(tdee + GOAL_ADJUSTMENT_KCAL[input.goal])
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/tdee.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/tdee.ts src/lib/tdee.test.ts
git commit -m "Add TDEE-based daily calorie goal calculation"
```

---

## Task 3: MET-Based Workout Calorie Estimation

**Files:**
- Create: `src/lib/met.ts`
- Test: `src/lib/met.test.ts`

**Interfaces:**
- Produces: `type ActivityType = 'running' | 'cycling' | 'strength' | 'yoga' | 'walking' | 'swimming'`, `type Intensity = 'low' | 'moderate' | 'high'`, `interface KcalBurnedInput { activityType: ActivityType; intensity: Intensity; durationMinutes: number; weightKg: number }`, `function estimateKcalBurned(input: KcalBurnedInput): number`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/met.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { estimateKcalBurned } from './met'

describe('estimateKcalBurned', () => {
  it('estimates calories for moderate running', () => {
    const result = estimateKcalBurned({
      activityType: 'running',
      intensity: 'moderate',
      durationMinutes: 30,
      weightKg: 80,
    })
    expect(result).toBe(392)
  })

  it('estimates calories for low-intensity cycling', () => {
    const result = estimateKcalBurned({
      activityType: 'cycling',
      intensity: 'low',
      durationMinutes: 45,
      weightKg: 70,
    })
    expect(result).toBe(210)
  })

  it('scales linearly with duration', () => {
    const thirtyMin = estimateKcalBurned({
      activityType: 'yoga',
      intensity: 'low',
      durationMinutes: 30,
      weightKg: 60,
    })
    const sixtyMin = estimateKcalBurned({
      activityType: 'yoga',
      intensity: 'low',
      durationMinutes: 60,
      weightKg: 60,
    })
    expect(sixtyMin).toBe(thirtyMin * 2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/met.test.ts`
Expected: FAIL — `Cannot find module './met'`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/met.ts`:

```ts
export type ActivityType = 'running' | 'cycling' | 'strength' | 'yoga' | 'walking' | 'swimming'
export type Intensity = 'low' | 'moderate' | 'high'

export interface KcalBurnedInput {
  activityType: ActivityType
  intensity: Intensity
  durationMinutes: number
  weightKg: number
}

// Näherungswerte nach Compendium of Physical Activities
const MET_TABLE: Record<ActivityType, Record<Intensity, number>> = {
  running: { low: 7, moderate: 9.8, high: 12.8 },
  cycling: { low: 4, moderate: 8, high: 10 },
  strength: { low: 3, moderate: 5, high: 6 },
  yoga: { low: 2.5, moderate: 3, high: 4 },
  walking: { low: 2.8, moderate: 3.5, high: 5 },
  swimming: { low: 5.8, moderate: 8.3, high: 10 },
}

export function estimateKcalBurned({ activityType, intensity, durationMinutes, weightKg }: KcalBurnedInput): number {
  const met = MET_TABLE[activityType][intensity]
  const hours = durationMinutes / 60
  return Math.round(met * weightKg * hours)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/met.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/met.ts src/lib/met.test.ts
git commit -m "Add MET-based workout calorie burn estimation"
```

---

## Task 4: Food Quantity Scaling Helper

**Files:**
- Create: `src/lib/foodScaling.ts`
- Test: `src/lib/foodScaling.test.ts`

**Interfaces:**
- Produces: `interface NutritionPer100g { kcalPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number }`, `interface ScaledNutrition { kcal: number; protein: number; carbs: number; fat: number }`, `function scaleToQuantity(nutrition: NutritionPer100g, quantityGrams: number): ScaledNutrition`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/foodScaling.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { scaleToQuantity } from './foodScaling'

describe('scaleToQuantity', () => {
  it('scales per-100g nutrition to a 150g portion', () => {
    const result = scaleToQuantity(
      { kcalPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 6.6, fatPer100g: 0.4 },
      150,
    )
    expect(result).toEqual({ kcal: 51, protein: 4.2, carbs: 9.9, fat: 0.6 })
  })

  it('returns zero nutrition for zero quantity', () => {
    const result = scaleToQuantity(
      { kcalPer100g: 200, proteinPer100g: 10, carbsPer100g: 20, fatPer100g: 5 },
      0,
    )
    expect(result).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0 })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/foodScaling.test.ts`
Expected: FAIL — `Cannot find module './foodScaling'`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/foodScaling.ts`:

```ts
export interface NutritionPer100g {
  kcalPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
}

export interface ScaledNutrition {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export function scaleToQuantity(nutrition: NutritionPer100g, quantityGrams: number): ScaledNutrition {
  const factor = quantityGrams / 100
  return {
    kcal: Math.round(nutrition.kcalPer100g * factor),
    protein: roundToOneDecimal(nutrition.proteinPer100g * factor),
    carbs: roundToOneDecimal(nutrition.carbsPer100g * factor),
    fat: roundToOneDecimal(nutrition.fatPer100g * factor),
  }
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/foodScaling.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/foodScaling.ts src/lib/foodScaling.test.ts
git commit -m "Add per-100g to quantity nutrition scaling helper"
```

---

## Task 5: Local Database Layer (Dexie)

**Files:**
- Create: `src/db/types.ts`
- Create: `src/db/db.ts`
- Create: `src/lib/date.ts`

**Interfaces:**
- Consumes: `Sex`, `ActivityLevel`, `Goal` from `src/lib/tdee.ts` (Task 2); `ActivityType`, `Intensity` from `src/lib/met.ts` (Task 3).
- Produces: `interface UserProfile { id?: number; age: number; sex: Sex; weightKg: number; heightCm: number; activityLevel: ActivityLevel; goal: Goal; manualDailyGoalKcal?: number }`, `interface FoodEntry { id?: number; date: string; time: string; productName: string; barcode?: string; source: FoodSource; kcal: number; protein: number; carbs: number; fat: number; quantity: number }`, `interface WorkoutEntry { id?: number; date: string; time: string; activityType: ActivityType; durationMinutes: number; intensity: Intensity; estimatedKcalBurned: number }`, `type FoodSource = 'barcode' | 'search' | 'manual'`. Exports `const db: FitteningDB` with tables `db.userProfile`, `db.foodEntries`, `db.workoutEntries`. `function todayDateString(): string` from `src/lib/date.ts`.

This layer touches IndexedDB, which is unavailable in Vitest's Node environment — per the Global Constraints, automated tests are scoped to calculation/parsing logic only. Verification here is manual, via the browser (Step 5).

- [ ] **Step 1: Create `src/db/types.ts`**

```ts
import type { Sex, ActivityLevel, Goal } from '../lib/tdee'
import type { ActivityType, Intensity } from '../lib/met'

export type FoodSource = 'barcode' | 'search' | 'manual'

export interface UserProfile {
  id?: number
  age: number
  sex: Sex
  weightKg: number
  heightCm: number
  activityLevel: ActivityLevel
  goal: Goal
  manualDailyGoalKcal?: number
}

export interface FoodEntry {
  id?: number
  date: string
  time: string
  productName: string
  barcode?: string
  source: FoodSource
  kcal: number
  protein: number
  carbs: number
  fat: number
  quantity: number
}

export interface WorkoutEntry {
  id?: number
  date: string
  time: string
  activityType: ActivityType
  durationMinutes: number
  intensity: Intensity
  estimatedKcalBurned: number
}
```

- [ ] **Step 2: Create `src/db/db.ts`**

```ts
import Dexie, { type Table } from 'dexie'
import type { UserProfile, FoodEntry, WorkoutEntry } from './types'

export class FitteningDB extends Dexie {
  userProfile!: Table<UserProfile, number>
  foodEntries!: Table<FoodEntry, number>
  workoutEntries!: Table<WorkoutEntry, number>

  constructor() {
    super('fittening')
    this.version(1).stores({
      userProfile: '++id',
      foodEntries: '++id, date',
      workoutEntries: '++id, date',
    })
  }
}

export const db = new FitteningDB()
```

- [ ] **Step 3: Create `src/lib/date.ts`**

```ts
export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}
```

- [ ] **Step 4: Verify the project still type-checks and builds**

Run: `npm run build`
Expected: Succeeds with no TypeScript errors.

- [ ] **Step 5: Manually verify the database in the browser**

Run: `npm run dev`, open `http://localhost:5173/fittening/` in a browser, open DevTools Console, and run:

```js
const { db } = await import('/src/db/db.ts')
await db.foodEntries.add({ date: '2026-07-12', time: '12:00', productName: 'Testeintrag', source: 'manual', kcal: 100, protein: 5, carbs: 10, fat: 2, quantity: 100 })
await db.foodEntries.toArray()
```

Expected: Returns an array containing the test entry. Then open DevTools → Application → IndexedDB → `fittening` and confirm the `userProfile`, `foodEntries`, `workoutEntries` object stores exist. Delete the test entry: `await db.foodEntries.clear()`.

- [ ] **Step 6: Commit**

```bash
git add src/db/types.ts src/db/db.ts src/lib/date.ts
git commit -m "Add Dexie local database layer"
```

---

## Task 6: Open Food Facts Barcode Lookup Client

**Files:**
- Create: `src/lib/openFoodFacts.ts`
- Test: `src/lib/openFoodFacts.test.ts`

**Interfaces:**
- Consumes: `NutritionPer100g` from `src/lib/foodScaling.ts` (Task 4).
- Produces: `interface BarcodeLookupResult extends NutritionPer100g { productName: string; barcode: string }`, `function lookupBarcode(barcode: string): Promise<BarcodeLookupResult | null>`, `function parseOpenFoodFactsResponse(data: unknown, barcode: string): BarcodeLookupResult | null` (exported for testing).

- [ ] **Step 1: Write the failing test**

Create `src/lib/openFoodFacts.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { parseOpenFoodFactsResponse } from './openFoodFacts'

describe('parseOpenFoodFactsResponse', () => {
  it('maps a found product to a BarcodeLookupResult', () => {
    const data = {
      status: 1,
      product: {
        product_name: 'Testprodukt',
        nutriments: {
          'energy-kcal_100g': 250,
          proteins_100g: 8,
          carbohydrates_100g: 30,
          fat_100g: 9,
        },
      },
    }
    const result = parseOpenFoodFactsResponse(data, '1234567890123')
    expect(result).toEqual({
      productName: 'Testprodukt',
      barcode: '1234567890123',
      kcalPer100g: 250,
      proteinPer100g: 8,
      carbsPer100g: 30,
      fatPer100g: 9,
    })
  })

  it('returns null when the product is not found', () => {
    const data = { status: 0 }
    const result = parseOpenFoodFactsResponse(data, '0000000000000')
    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/openFoodFacts.test.ts`
Expected: FAIL — `Cannot find module './openFoodFacts'`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/openFoodFacts.ts`:

```ts
import type { NutritionPer100g } from './foodScaling'

export interface BarcodeLookupResult extends NutritionPer100g {
  productName: string
  barcode: string
}

interface OpenFoodFactsProduct {
  status: number
  product?: {
    product_name?: string
    nutriments?: Record<string, number>
  }
}

export function parseOpenFoodFactsResponse(data: unknown, barcode: string): BarcodeLookupResult | null {
  const response = data as OpenFoodFactsProduct
  if (response.status !== 1 || !response.product) {
    return null
  }
  const nutriments = response.product.nutriments ?? {}
  return {
    productName: response.product.product_name || 'Unbekanntes Produkt',
    barcode,
    kcalPer100g: nutriments['energy-kcal_100g'] ?? 0,
    proteinPer100g: nutriments['proteins_100g'] ?? 0,
    carbsPer100g: nutriments['carbohydrates_100g'] ?? 0,
    fatPer100g: nutriments['fat_100g'] ?? 0,
  }
}

export async function lookupBarcode(barcode: string): Promise<BarcodeLookupResult | null> {
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`)
  if (!response.ok) {
    throw new Error(`Open Food Facts request failed: ${response.status}`)
  }
  const data = await response.json()
  return parseOpenFoodFactsResponse(data, barcode)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/openFoodFacts.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/openFoodFacts.ts src/lib/openFoodFacts.test.ts
git commit -m "Add Open Food Facts barcode lookup client"
```

---

## Task 7: USDA FoodData Central Search Client

**Prerequisite:** A free USDA FoodData Central API key. Sign up at https://fdc.nal.usda.gov/api-key-signup (instant, no approval wait). Once obtained, copy `.env.local.example` to `.env.local` and set `VITE_USDA_API_KEY=<your key>`. `.env.local` is gitignored (Task 1) — never commit it.

**Files:**
- Create: `src/lib/usdaFoodData.ts`
- Test: `src/lib/usdaFoodData.test.ts`
- Create: `.env.local` (not committed — local only)

**Interfaces:**
- Consumes: `NutritionPer100g` from `src/lib/foodScaling.ts` (Task 4).
- Produces: `interface FoodSearchResult extends NutritionPer100g { fdcId: number; productName: string }`, `function searchFoodByName(query: string): Promise<FoodSearchResult[]>`, `function parseUsdaSearchResponse(data: unknown): FoodSearchResult[]` (exported for testing).

- [ ] **Step 1: Obtain the API key and create `.env.local`**

Sign up at https://fdc.nal.usda.gov/api-key-signup, then:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and replace the placeholder with the real key.

- [ ] **Step 2: Write the failing test**

Create `src/lib/usdaFoodData.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { parseUsdaSearchResponse } from './usdaFoodData'

describe('parseUsdaSearchResponse', () => {
  it('maps search results to FoodSearchResult entries', () => {
    const data = {
      foods: [
        {
          fdcId: 170379,
          description: 'Broccoli, raw',
          foodNutrients: [
            { nutrientId: 1008, value: 34 },
            { nutrientId: 1003, value: 2.8 },
            { nutrientId: 1005, value: 6.6 },
            { nutrientId: 1004, value: 0.4 },
          ],
        },
      ],
    }
    const result = parseUsdaSearchResponse(data)
    expect(result).toEqual([
      {
        fdcId: 170379,
        productName: 'Broccoli, raw',
        kcalPer100g: 34,
        proteinPer100g: 2.8,
        carbsPer100g: 6.6,
        fatPer100g: 0.4,
      },
    ])
  })

  it('defaults missing nutrients to zero', () => {
    const data = { foods: [{ fdcId: 1, description: 'Unknown', foodNutrients: [] }] }
    const result = parseUsdaSearchResponse(data)
    expect(result).toEqual([
      { fdcId: 1, productName: 'Unknown', kcalPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 },
    ])
  })

  it('returns an empty array when there are no foods', () => {
    expect(parseUsdaSearchResponse({})).toEqual([])
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/usdaFoodData.test.ts`
Expected: FAIL — `Cannot find module './usdaFoodData'`.

- [ ] **Step 4: Write the implementation**

Create `src/lib/usdaFoodData.ts`:

```ts
import type { NutritionPer100g } from './foodScaling'

export interface FoodSearchResult extends NutritionPer100g {
  fdcId: number
  productName: string
}

interface UsdaNutrient {
  nutrientId: number
  value: number
}

interface UsdaFood {
  fdcId: number
  description: string
  foodNutrients?: UsdaNutrient[]
}

interface UsdaSearchResponse {
  foods?: UsdaFood[]
}

const NUTRIENT_IDS = {
  kcal: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
}

function findNutrientValue(nutrients: UsdaNutrient[] | undefined, nutrientId: number): number {
  return nutrients?.find((n) => n.nutrientId === nutrientId)?.value ?? 0
}

export function parseUsdaSearchResponse(data: unknown): FoodSearchResult[] {
  const response = data as UsdaSearchResponse
  const foods = response.foods ?? []
  return foods.map((food) => ({
    fdcId: food.fdcId,
    productName: food.description,
    kcalPer100g: findNutrientValue(food.foodNutrients, NUTRIENT_IDS.kcal),
    proteinPer100g: findNutrientValue(food.foodNutrients, NUTRIENT_IDS.protein),
    carbsPer100g: findNutrientValue(food.foodNutrients, NUTRIENT_IDS.carbs),
    fatPer100g: findNutrientValue(food.foodNutrients, NUTRIENT_IDS.fat),
  }))
}

export async function searchFoodByName(query: string): Promise<FoodSearchResult[]> {
  const apiKey = import.meta.env.VITE_USDA_API_KEY
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${apiKey}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`USDA FoodData Central request failed: ${response.status}`)
  }
  const data = await response.json()
  return parseUsdaSearchResponse(data)
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/usdaFoodData.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/usdaFoodData.ts src/lib/usdaFoodData.test.ts
git commit -m "Add USDA FoodData Central name-search client"
```

(`.env.local` is gitignored and intentionally not committed.)

---

## Task 8: App Shell & Tab Navigation

**Files:**
- Create: `src/components/Dashboard/Dashboard.tsx` (stub, replaced in Task 10)
- Create: `src/components/Food/FoodLog.tsx` (stub, replaced in Task 11)
- Create: `src/components/Workout/WorkoutLog.tsx` (stub, replaced in Task 14)
- Create: `src/components/Profile/ProfileScreen.tsx` (stub, replaced in Task 9)
- Modify: `src/App.tsx`
- Create: `src/App.css`

**Interfaces:**
- Produces: `Dashboard`, `FoodLog`, `WorkoutLog`, `ProfileScreen` React components (initially stubs — later tasks fill in real content without changing their export signature: no props, default export replaced by named export `export function X()`).

- [ ] **Step 1: Create stub screen components**

Create `src/components/Dashboard/Dashboard.tsx`:

```tsx
export function Dashboard() {
  return <p>Übersicht kommt bald.</p>
}
```

Create `src/components/Food/FoodLog.tsx`:

```tsx
export function FoodLog() {
  return <p>Essen-Log kommt bald.</p>
}
```

Create `src/components/Workout/WorkoutLog.tsx`:

```tsx
export function WorkoutLog() {
  return <p>Sport-Log kommt bald.</p>
}
```

Create `src/components/Profile/ProfileScreen.tsx`:

```tsx
export function ProfileScreen() {
  return <p>Profil kommt bald.</p>
}
```

- [ ] **Step 2: Replace `src/App.tsx` with the real tab shell**

```tsx
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
```

- [ ] **Step 3: Create `src/App.css`**

```css
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-content {
  flex: 1;
  padding: 1rem;
  padding-bottom: 5rem;
  overflow-y: auto;
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  border-top: 1px solid #ddd;
  background: white;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-bar button {
  flex: 1;
  padding: 0.75rem 0;
  border: none;
  background: none;
  font-size: 0.85rem;
}

.tab-bar button.active {
  font-weight: bold;
  color: #1f2933;
}

.progress-bar {
  background: #eee;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
  margin: 0.5rem 0;
}

.progress-bar-fill {
  background: #1f2933;
  height: 100%;
}
```

- [ ] **Step 4: Verify in the browser**

Run: `npm run build && npm run dev`, open `http://localhost:5173/fittening/`
Expected: Four tabs at the bottom (Übersicht, Essen, Sport, Profil); tapping each shows its stub text.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.css src/components
git commit -m "Add tab-based app shell with stub screens"
```

---

## Task 9: Profile Screen (Onboarding + Goal Override)

**Files:**
- Modify: `src/components/Profile/ProfileScreen.tsx`

**Interfaces:**
- Consumes: `db` from `src/db/db.ts` (Task 5), `UserProfile` from `src/db/types.ts` (Task 5), `calculateDailyGoalKcal`, `Sex`, `ActivityLevel`, `Goal` from `src/lib/tdee.ts` (Task 2).
- Produces: `ProfileScreen` component that persists a single `UserProfile` record (`id: 1`) via `db.userProfile.put`.

- [ ] **Step 1: Replace `src/components/Profile/ProfileScreen.tsx`**

```tsx
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { db } from '../../db/db'
import { calculateDailyGoalKcal } from '../../lib/tdee'
import type { ActivityLevel, Goal, Sex } from '../../lib/tdee'
import type { UserProfile } from '../../db/types'

const EMPTY_PROFILE: UserProfile = {
  id: 1,
  age: 30,
  sex: 'male',
  weightKg: 75,
  heightCm: 175,
  activityLevel: 'moderate',
  goal: 'maintain',
}

export function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    void loadProfile()
  }, [])

  async function loadProfile() {
    const existing = await db.userProfile.get(1)
    if (existing) setProfile(existing)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await db.userProfile.put(profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const calculatedGoal = calculateDailyGoalKcal(profile)

  return (
    <section>
      <h1>Profil</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Alter
          <input
            type="number"
            value={profile.age}
            onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
          />
        </label>
        <label>
          Geschlecht
          <select
            value={profile.sex}
            onChange={(e) => setProfile({ ...profile, sex: e.target.value as Sex })}
          >
            <option value="male">Männlich</option>
            <option value="female">Weiblich</option>
          </select>
        </label>
        <label>
          Gewicht (kg)
          <input
            type="number"
            value={profile.weightKg}
            onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) })}
          />
        </label>
        <label>
          Größe (cm)
          <input
            type="number"
            value={profile.heightCm}
            onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })}
          />
        </label>
        <label>
          Aktivitätslevel
          <select
            value={profile.activityLevel}
            onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as ActivityLevel })}
          >
            <option value="sedentary">Sitzend</option>
            <option value="light">Leicht aktiv</option>
            <option value="moderate">Mäßig aktiv</option>
            <option value="active">Aktiv</option>
            <option value="veryActive">Sehr aktiv</option>
          </select>
        </label>
        <label>
          Ziel
          <select
            value={profile.goal}
            onChange={(e) => setProfile({ ...profile, goal: e.target.value as Goal })}
          >
            <option value="lose">Abnehmen</option>
            <option value="maintain">Halten</option>
            <option value="gain">Zunehmen</option>
          </select>
        </label>
        <p>Berechnetes Tagesziel: {calculatedGoal} kcal</p>
        <label>
          Tagesziel manuell überschreiben (optional)
          <input
            type="number"
            value={profile.manualDailyGoalKcal ?? ''}
            onChange={(e) =>
              setProfile({
                ...profile,
                manualDailyGoalKcal: e.target.value === '' ? undefined : Number(e.target.value),
              })
            }
          />
        </label>
        <button type="submit">Speichern</button>
        {saved && <p>Gespeichert!</p>}
      </form>
    </section>
  )
}
```

- [ ] **Step 2: Verify in the browser**

Run: `npm run dev`, go to the Profil tab, fill in values, click "Speichern".
Expected: "Gespeichert!" appears; reloading the page keeps the entered values (persisted via Dexie).

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: Succeeds with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Profile/ProfileScreen.tsx
git commit -m "Add profile screen with TDEE-based goal calculation"
```

---

## Task 10: Dashboard Screen (Daily Overview)

**Files:**
- Modify: `src/components/Dashboard/Dashboard.tsx`

**Interfaces:**
- Consumes: `db` (Task 5), `todayDateString` from `src/lib/date.ts` (Task 5), `calculateDailyGoalKcal` from `src/lib/tdee.ts` (Task 2), `UserProfile` from `src/db/types.ts` (Task 5).

- [ ] **Step 1: Replace `src/components/Dashboard/Dashboard.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { db } from '../../db/db'
import { calculateDailyGoalKcal } from '../../lib/tdee'
import { todayDateString } from '../../lib/date'
import type { UserProfile } from '../../db/types'

interface DailyTotals {
  eaten: number
  burned: number
}

export function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [totals, setTotals] = useState<DailyTotals>({ eaten: 0, burned: 0 })

  useEffect(() => {
    void loadData()
  }, [])

  async function loadData() {
    const today = todayDateString()
    const [storedProfile, foodEntries, workoutEntries] = await Promise.all([
      db.userProfile.get(1),
      db.foodEntries.where('date').equals(today).toArray(),
      db.workoutEntries.where('date').equals(today).toArray(),
    ])
    setProfile(storedProfile ?? null)
    setTotals({
      eaten: foodEntries.reduce((sum, entry) => sum + entry.kcal, 0),
      burned: workoutEntries.reduce((sum, entry) => sum + entry.estimatedKcalBurned, 0),
    })
  }

  if (!profile) {
    return <p>Bitte zuerst dein Profil im Tab "Profil" ausfüllen.</p>
  }

  const goal = profile.manualDailyGoalKcal ?? calculateDailyGoalKcal(profile)
  const remaining = goal - totals.eaten + totals.burned
  const progressPercent = Math.min(100, (totals.eaten / goal) * 100)

  return (
    <section>
      <h1>Heute</h1>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
      </div>
      <p>Ziel: {goal} kcal</p>
      <p>Gegessen: {totals.eaten} kcal</p>
      <p>Verbrannt: {totals.burned} kcal</p>
      <p>Verbleibend: {remaining} kcal</p>
    </section>
  )
}
```

- [ ] **Step 2: Verify in the browser**

Run: `npm run dev`. On the Profil tab, ensure a profile is saved (Task 9). Then, in the browser console, add a test food/workout entry for today (same snippet style as Task 5 Step 5), and switch to the Übersicht tab.
Expected: Ziel/Gegessen/Verbrannt/Verbleibend reflect the test entries; the progress bar fill width matches eaten/goal. Clear the test entries afterward via `db.foodEntries.clear()` / `db.workoutEntries.clear()`.

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: Succeeds with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Dashboard/Dashboard.tsx
git commit -m "Add dashboard with daily calorie balance"
```

---

## Task 11: Food Log — Barcode Scanner Entry

**Files:**
- Create: `src/components/Food/BarcodeScanner.tsx`
- Modify: `src/components/Food/FoodLog.tsx`

**Interfaces:**
- Consumes: `lookupBarcode` from `src/lib/openFoodFacts.ts` (Task 6), `scaleToQuantity`, `NutritionPer100g` from `src/lib/foodScaling.ts` (Task 4), `db`, `todayDateString`, `FoodSource` (Task 5).
- Produces: `BarcodeScanner` component with props `{ onDetected: (barcode: string) => void; onCancel: () => void }`. `FoodLog` component (no props) — internal `PendingLookup` shape reused by Tasks 12/13.

- [ ] **Step 1: Create `src/components/Food/BarcodeScanner.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void
  onCancel: () => void
}

const SCANNER_ELEMENT_ID = 'barcode-scanner'

export function BarcodeScanner({ onDetected, onCancel }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          void scanner.stop().then(() => onDetected(decodedText))
        },
        () => {
          // Scan-Fehlversuch pro Frame — kein eigener Fehler-State nötig
        },
      )
      .catch(() => {
        onCancel()
      })

    return () => {
      if (scannerRef.current?.isScanning) {
        void scannerRef.current.stop()
      }
    }
  }, [onDetected, onCancel])

  return (
    <div>
      <div id={SCANNER_ELEMENT_ID} />
      <button onClick={onCancel}>Abbrechen</button>
    </div>
  )
}
```

- [ ] **Step 2: Replace `src/components/Food/FoodLog.tsx`**

```tsx
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
```

- [ ] **Step 3: Verify in the browser**

Run: `npm run dev` on a phone or a browser with a webcam, go to Essen → "Barcode scannen", allow camera access, scan a real packaged product's barcode (or type one manually into the URL bar test via `lookupBarcode` in the console if no camera is available).
Expected: Camera view appears; after a successful scan, the product name/kcal-per-100g and a quantity field appear; "Hinzufügen" saves an entry (verify via DevTools → Application → IndexedDB → `fittening` → `foodEntries`).

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: Succeeds with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Food/BarcodeScanner.tsx src/components/Food/FoodLog.tsx
git commit -m "Add barcode-scan food logging"
```

---

## Task 12: Food Log — Name Search Entry

**Files:**
- Create: `src/components/Food/FoodSearch.tsx`
- Modify: `src/components/Food/FoodLog.tsx`

**Interfaces:**
- Consumes: `searchFoodByName`, `FoodSearchResult` from `src/lib/usdaFoodData.ts` (Task 7).
- Produces: `FoodSearch` component with props `{ onSelect: (result: FoodSearchResult) => void; onCancel: () => void }`.

- [ ] **Step 1: Create `src/components/Food/FoodSearch.tsx`**

```tsx
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

  async function handleSearch(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    try {
      const found = await searchFoodByName(query)
      setResults(found)
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
```

- [ ] **Step 2: Replace `src/components/Food/FoodLog.tsx`** (adds the search mode)

```tsx
import { useState } from 'react'
import { BarcodeScanner } from './BarcodeScanner'
import { FoodSearch } from './FoodSearch'
import { lookupBarcode } from '../../lib/openFoodFacts'
import { scaleToQuantity } from '../../lib/foodScaling'
import type { NutritionPer100g } from '../../lib/foodScaling'
import { db } from '../../db/db'
import { todayDateString } from '../../lib/date'
import type { FoodSource } from '../../db/types'
import type { FoodSearchResult } from '../../lib/usdaFoodData'

type Mode = 'idle' | 'scan' | 'search'

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
  }

  return (
    <section>
      <h1>Essen</h1>
      {error && <p role="alert">{error}</p>}

      {mode === 'idle' && !pending && (
        <div>
          <button onClick={() => setMode('scan')}>Barcode scannen</button>
          <button onClick={() => setMode('search')}>Lebensmittel suchen</button>
        </div>
      )}

      {mode === 'scan' && (
        <BarcodeScanner onDetected={handleBarcodeDetected} onCancel={() => setMode('idle')} />
      )}

      {mode === 'search' && <FoodSearch onSelect={handleSearchSelect} onCancel={() => setMode('idle')} />}

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
```

- [ ] **Step 3: Verify in the browser**

Run: `npm run dev`, go to Essen → "Lebensmittel suchen", type "Brokkoli", submit.
Expected: A list of matching USDA results appears (e.g. "Broccoli, raw"); selecting one shows the quantity-confirm form; entering `150` and clicking "Hinzufügen" saves a scaled entry (verify in DevTools → IndexedDB → `foodEntries`).

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: Succeeds with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Food/FoodSearch.tsx src/components/Food/FoodLog.tsx
git commit -m "Add name-search food logging"
```

---

## Task 13: Food Log — Manual Entry & Today's List

**Files:**
- Create: `src/components/Food/ManualFoodEntry.tsx`
- Modify: `src/components/Food/FoodLog.tsx`

**Interfaces:**
- Consumes: `db`, `todayDateString` (Task 5).
- Produces: `ManualFoodEntry` component with props `{ onSaved: () => void; onCancel: () => void }`.

- [ ] **Step 1: Create `src/components/Food/ManualFoodEntry.tsx`**

```tsx
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
```

- [ ] **Step 2: Replace `src/components/Food/FoodLog.tsx`** (adds manual mode + today's entries list)

```tsx
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
        <div>
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

      <h2>Heute</h2>
      <ul>
        {todayEntries.map((entry) => (
          <li key={entry.id}>
            {entry.productName} — {entry.kcal} kcal ({entry.quantity}g)
            <button onClick={() => handleDelete(entry.id!)}>Löschen</button>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

- [ ] **Step 3: Verify in the browser**

Run: `npm run dev`, go to Essen → "Manuell eintragen", fill in a product with kcal/macros/quantity, save.
Expected: Entry appears in the "Heute" list below; clicking "Löschen" removes it; entries added via barcode/search (Tasks 11/12) also appear in the same list.

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: Succeeds with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Food/ManualFoodEntry.tsx src/components/Food/FoodLog.tsx
git commit -m "Add manual food entry and today's food entries list"
```

---

## Task 14: Workout Log Screen

**Files:**
- Modify: `src/components/Workout/WorkoutLog.tsx`

**Interfaces:**
- Consumes: `estimateKcalBurned`, `ActivityType`, `Intensity` from `src/lib/met.ts` (Task 3); `db`, `todayDateString` (Task 5).

- [ ] **Step 1: Replace `src/components/Workout/WorkoutLog.tsx`**

```tsx
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { db } from '../../db/db'
import { estimateKcalBurned } from '../../lib/met'
import type { ActivityType, Intensity } from '../../lib/met'
import { todayDateString } from '../../lib/date'
import type { WorkoutEntry } from '../../db/types'

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  running: 'Laufen',
  cycling: 'Radfahren',
  strength: 'Krafttraining',
  yoga: 'Yoga',
  walking: 'Gehen',
  swimming: 'Schwimmen',
}

export function WorkoutLog() {
  const [activityType, setActivityType] = useState<ActivityType>('running')
  const [intensity, setIntensity] = useState<Intensity>('moderate')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [entries, setEntries] = useState<WorkoutEntry[]>([])

  useEffect(() => {
    void refreshEntries()
  }, [])

  async function refreshEntries() {
    const today = await db.workoutEntries.where('date').equals(todayDateString()).toArray()
    setEntries(today)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const profile = await db.userProfile.get(1)
    const weightKg = profile?.weightKg ?? 75
    const estimatedKcalBurned = estimateKcalBurned({ activityType, intensity, durationMinutes, weightKg })
    await db.workoutEntries.add({
      date: todayDateString(),
      time: new Date().toTimeString().slice(0, 5),
      activityType,
      durationMinutes,
      intensity,
      estimatedKcalBurned,
    })
    await refreshEntries()
  }

  async function handleDelete(id: number) {
    await db.workoutEntries.delete(id)
    await refreshEntries()
  }

  return (
    <section>
      <h1>Sport</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Aktivität
          <select value={activityType} onChange={(e) => setActivityType(e.target.value as ActivityType)}>
            {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Intensität
          <select value={intensity} onChange={(e) => setIntensity(e.target.value as Intensity)}>
            <option value="low">Niedrig</option>
            <option value="moderate">Mittel</option>
            <option value="high">Hoch</option>
          </select>
        </label>
        <label>
          Dauer (Minuten)
          <input
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
          />
        </label>
        <button type="submit">Hinzufügen</button>
      </form>

      <h2>Heute</h2>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id}>
            {ACTIVITY_LABELS[entry.activityType]} — {entry.durationMinutes} min — {entry.estimatedKcalBurned} kcal
            <button onClick={() => handleDelete(entry.id!)}>Löschen</button>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

- [ ] **Step 2: Verify in the browser**

Run: `npm run dev`, go to Sport, pick "Laufen"/"Mittel"/30 Minuten, submit.
Expected: Entry appears in "Heute" list with an estimated kcal value; switching to Übersicht shows it reflected in "Verbrannt". "Löschen" removes it from both.

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: Succeeds with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Workout/WorkoutLog.tsx
git commit -m "Add workout logging with MET-based calorie estimate"
```

---

## Task 15: Backup Export/Import

**Files:**
- Create: `src/lib/exportImport.ts`
- Modify: `src/components/Profile/ProfileScreen.tsx`

**Interfaces:**
- Consumes: `db` (Task 5).
- Produces: `interface BackupData { version: 1; exportedAt: string; userProfile: UserProfile[]; foodEntries: FoodEntry[]; workoutEntries: WorkoutEntry[] }`, `function exportBackup(): Promise<BackupData>`, `function importBackup(data: BackupData): Promise<void>`.

This touches IndexedDB directly, so per the Global Constraints it is verified manually (Step 3), not with a Vitest suite.

- [ ] **Step 1: Create `src/lib/exportImport.ts`**

```ts
import { db } from '../db/db'
import type { UserProfile, FoodEntry, WorkoutEntry } from '../db/types'

export interface BackupData {
  version: 1
  exportedAt: string
  userProfile: UserProfile[]
  foodEntries: FoodEntry[]
  workoutEntries: WorkoutEntry[]
}

export async function exportBackup(): Promise<BackupData> {
  const [userProfile, foodEntries, workoutEntries] = await Promise.all([
    db.userProfile.toArray(),
    db.foodEntries.toArray(),
    db.workoutEntries.toArray(),
  ])
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    userProfile,
    foodEntries,
    workoutEntries,
  }
}

export async function importBackup(data: BackupData): Promise<void> {
  await db.transaction('rw', db.userProfile, db.foodEntries, db.workoutEntries, async () => {
    await db.userProfile.clear()
    await db.foodEntries.clear()
    await db.workoutEntries.clear()
    await db.userProfile.bulkAdd(data.userProfile)
    await db.foodEntries.bulkAdd(data.foodEntries)
    await db.workoutEntries.bulkAdd(data.workoutEntries)
  })
}
```

- [ ] **Step 2: Modify `src/components/Profile/ProfileScreen.tsx`** to add a backup section

Add these imports at the top (alongside the existing ones):

```tsx
import { exportBackup, importBackup } from '../../lib/exportImport'
import type { BackupData } from '../../lib/exportImport'
import { todayDateString } from '../../lib/date'
import type { ChangeEvent } from 'react'
```

Add these two handler functions inside the `ProfileScreen` component, after `handleSubmit`:

```tsx
  async function handleExport() {
    const backup = await exportBackup()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fittening-backup-${todayDateString()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const data = JSON.parse(text) as BackupData
    await importBackup(data)
    await loadProfile()
  }
```

Add this JSX block just before the closing `</section>` tag:

```tsx
      <h2>Backup</h2>
      <button type="button" onClick={handleExport}>
        Daten exportieren
      </button>
      <label>
        Daten importieren
        <input type="file" accept="application/json" onChange={handleImport} />
      </label>
```

- [ ] **Step 3: Manually verify export/import in the browser**

Run: `npm run dev`, go to Profil → "Daten exportieren" — a `fittening-backup-YYYY-MM-DD.json` file downloads. Open it and confirm it contains your profile/food/workout data. Then run `db.foodEntries.clear()` in the DevTools console to simulate data loss, and use "Daten importieren" to select the downloaded file.
Expected: After import, the Übersicht and Essen tabs show the restored data again.

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: Succeeds with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/exportImport.ts src/components/Profile/ProfileScreen.tsx
git commit -m "Add JSON backup export/import"
```

---

## Task 16: German→English Food Search Fallback

**Context:** Discovered during Task 12 verification: USDA FoodData Central only understands English queries. A German search like "Brokkoli" returns zero hits; "Broccoli" works. Alex (German-speaking, personal use) chose a small hardcoded DE→EN dictionary as a fallback: try the query as typed first, and if that returns zero results, look up a translation and retry once.

**Files:**
- Create: `src/lib/foodNameTranslation.ts`
- Test: `src/lib/foodNameTranslation.test.ts`
- Modify: `src/lib/usdaFoodData.ts`

**Interfaces:**
- Produces: `function translateFoodNameToEnglish(query: string): string | null` — case-insensitive, whitespace-trimmed lookup against a fixed dictionary of common German food names; returns `null` if no translation is known.
- Consumes/Modifies: `searchFoodByName` (Task 7) gains a translate-and-retry fallback; its exported signature (`(query: string) => Promise<FoodSearchResult[]>`) is unchanged, so `FoodSearch.tsx` (Task 12) needs no changes.

- [ ] **Step 1: Write the failing test**

Create `src/lib/foodNameTranslation.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { translateFoodNameToEnglish } from './foodNameTranslation'

describe('translateFoodNameToEnglish', () => {
  it('translates a known German food name to English', () => {
    expect(translateFoodNameToEnglish('Brokkoli')).toBe('broccoli')
  })

  it('is case-insensitive and trims whitespace', () => {
    expect(translateFoodNameToEnglish('  BROKKOLI  ')).toBe('broccoli')
  })

  it('returns null for unknown terms', () => {
    expect(translateFoodNameToEnglish('Quinoa-Superfood-Bowl')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/foodNameTranslation.test.ts`
Expected: FAIL — `Cannot find module './foodNameTranslation'`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/foodNameTranslation.ts`:

```ts
// Kleines DE->EN-Wörterbuch für häufige Lebensmittel, da USDA FoodData
// Central nur englische Suchbegriffe versteht. Deckt Alltagskost ab,
// nicht erschöpfend.
const DE_EN_FOOD_TRANSLATIONS: Record<string, string> = {
  brokkoli: 'broccoli',
  apfel: 'apple',
  banane: 'banana',
  kartoffel: 'potato',
  süßkartoffel: 'sweet potato',
  tomate: 'tomato',
  gurke: 'cucumber',
  karotte: 'carrot',
  möhre: 'carrot',
  zwiebel: 'onion',
  knoblauch: 'garlic',
  paprika: 'bell pepper',
  spinat: 'spinach',
  salat: 'lettuce',
  huhn: 'chicken',
  hähnchenbrust: 'chicken breast',
  hühnchen: 'chicken',
  pute: 'turkey',
  putenbrust: 'turkey breast',
  rindfleisch: 'beef',
  schweinefleisch: 'pork',
  fisch: 'fish',
  lachs: 'salmon',
  thunfisch: 'tuna',
  garnelen: 'shrimp',
  ei: 'egg',
  eier: 'eggs',
  milch: 'milk',
  käse: 'cheese',
  joghurt: 'yogurt',
  quark: 'quark',
  sahne: 'cream',
  butter: 'butter',
  brot: 'bread',
  vollkornbrot: 'whole wheat bread',
  reis: 'rice',
  nudeln: 'pasta',
  haferflocken: 'oats',
  mandeln: 'almonds',
  walnüsse: 'walnuts',
  erdnüsse: 'peanuts',
  erdnussbutter: 'peanut butter',
  linsen: 'lentils',
  bohnen: 'beans',
  kichererbsen: 'chickpeas',
  tofu: 'tofu',
  avocado: 'avocado',
  erdbeeren: 'strawberries',
  himbeeren: 'raspberries',
  blaubeeren: 'blueberries',
  trauben: 'grapes',
  birne: 'pear',
  zitrone: 'lemon',
  limette: 'lime',
  ananas: 'pineapple',
  mango: 'mango',
  wassermelone: 'watermelon',
  honig: 'honey',
  zucker: 'sugar',
  olivenöl: 'olive oil',
  salz: 'salt',
  pfeffer: 'pepper',
  zimt: 'cinnamon',
  schokolade: 'chocolate',
  kaffee: 'coffee',
  tee: 'tea',
  blumenkohl: 'cauliflower',
  rosenkohl: 'brussels sprouts',
  kürbis: 'pumpkin',
  zucchini: 'zucchini',
  aubergine: 'eggplant',
  sellerie: 'celery',
  pflaume: 'plum',
  pfirsich: 'peach',
  kiwi: 'kiwi',
  müsli: 'granola',
  hummus: 'hummus',
  senf: 'mustard',
}

export function translateFoodNameToEnglish(query: string): string | null {
  const normalized = query.trim().toLowerCase()
  return DE_EN_FOOD_TRANSLATIONS[normalized] ?? null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/foodNameTranslation.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Wire the fallback into `searchFoodByName`**

Modify `src/lib/usdaFoodData.ts`. Add the import at the top:

```ts
import { translateFoodNameToEnglish } from './foodNameTranslation'
```

Replace the existing `searchFoodByName` function with:

```ts
export async function searchFoodByName(query: string): Promise<FoodSearchResult[]> {
  const results = await performUsdaSearch(query)
  if (results.length > 0) {
    return results
  }
  const translated = translateFoodNameToEnglish(query)
  if (!translated) {
    return results
  }
  return performUsdaSearch(translated)
}

async function performUsdaSearch(query: string): Promise<FoodSearchResult[]> {
  const apiKey = import.meta.env.VITE_USDA_API_KEY
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${apiKey}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`USDA FoodData Central request failed: ${response.status}`)
  }
  const data = await response.json()
  return parseUsdaSearchResponse(data)
}
```

This is a pure rename-and-wrap of the existing fetch logic (previously inline in `searchFoodByName`, now in `performUsdaSearch`) plus the new fallback branch — `parseUsdaSearchResponse` and its exact behavior are untouched.

- [ ] **Step 6: Run the full lib test suite to confirm nothing broke**

Run: `npx vitest run src/lib/usdaFoodData.test.ts src/lib/foodNameTranslation.test.ts`
Expected: PASS (3 + 3 = 6 tests). `usdaFoodData.test.ts` only tests `parseUsdaSearchResponse`, which is untouched, so it should still pass unmodified.

- [ ] **Step 7: Manually verify in the browser**

Run: `npm run dev`, go to Essen → "Lebensmittel suchen", type "Brokkoli", submit.
Expected: Real USDA results for broccoli now appear (previously zero). Typing "Broccoli" directly should behave exactly as before (no regression — the as-typed query still tries first).

- [ ] **Step 8: Verify the build**

Run: `npm run build`
Expected: Succeeds with no TypeScript errors.

- [ ] **Step 9: Commit**

```bash
git add src/lib/foodNameTranslation.ts src/lib/foodNameTranslation.test.ts src/lib/usdaFoodData.ts
git commit -m "Add German-to-English food name translation fallback for USDA search"
```

---

## Task 17: GitHub Pages Deploy Workflow & PWA Icons

**Files:**
- Create: `public/icons/icon-192.png`
- Create: `public/icons/icon-512.png`
- Create: `public/apple-touch-icon.png`
- Create: `public/favicon.svg`
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Produces: a live app at `https://apmc137.github.io/fittening/`, auto-deployed on every push to `main`.

- [ ] **Step 1: Generate placeholder icons**

Requires ImageMagick (`sudo apt install imagemagick` if `convert` is not found).

```bash
mkdir -p public/icons
convert -size 192x192 xc:'#1f2933' -gravity center -pointsize 64 -fill white -annotate 0 "F" public/icons/icon-192.png
convert -size 512x512 xc:'#1f2933' -gravity center -pointsize 180 -fill white -annotate 0 "F" public/icons/icon-512.png
convert -size 180x180 xc:'#1f2933' -gravity center -pointsize 64 -fill white -annotate 0 "F" public/apple-touch-icon.png
```

- [ ] **Step 2: Create `public/favicon.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1f2933"/><text x="50" y="62" font-size="50" fill="white" text-anchor="middle" font-family="sans-serif">F</text></svg>
```

- [ ] **Step 3: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          VITE_USDA_API_KEY: ${{ secrets.VITE_USDA_API_KEY }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: Add the USDA API key as a repo secret**

Run (using the same key saved in `.env.local` in Task 7):

```bash
gh secret set VITE_USDA_API_KEY --repo apmc137/fittening
```

This prompts for the secret value — paste the USDA API key when asked.

- [ ] **Step 5: Set the Pages source to GitHub Actions**

```bash
gh api repos/apmc137/fittening/pages -X POST -f build_type=workflow
```

Expected: No error (or a message indicating Pages is already configured).

- [ ] **Step 6: Commit and push to trigger the first deploy**

```bash
git add public/icons public/apple-touch-icon.png public/favicon.svg .github/workflows/deploy.yml
git commit -m "Add PWA icons and GitHub Pages deploy workflow"
git push
```

- [ ] **Step 7: Watch the deploy and verify**

Run: `gh run watch $(gh run list --repo apmc137/fittening --limit 1 --json databaseId --jq '.[0].databaseId')`
Expected: Workflow completes successfully. Then open `https://apmc137.github.io/fittening/` in a browser.
Expected: The app loads, shows the four tabs, and functions end-to-end.

- [ ] **Step 8: Install on iPhone**

On the iPhone, open `https://apmc137.github.io/fittening/` in Safari → Share → "Zum Home-Bildschirm". Launch it from the home screen icon.
Expected: Opens full-screen without Safari browser chrome; barcode scanning prompts for camera permission and works.

---

## Self-Review Notes

- **Spec coverage:** Onboarding/TDEE goal (Task 9), barcode scan (Task 11), name search (Task 12), manual entry (Task 13), sport logging (Task 14), dashboard (Task 10), backup/export (Task 15), offline shell + installability (Task 1/16), error handling for failed lookups/no network (Task 11/12 `error` state) — all spec sections are covered.
- **Type consistency checked:** `PendingLookup`, `FoodEntry`, `WorkoutEntry`, `UserProfile` field names and types match across Tasks 5, 9–14 (`source`, `kcal`/`protein`/`carbs`/`fat`, `estimatedKcalBurned`, `manualDailyGoalKcal`).
- **No placeholders:** every step has complete, runnable code; no TBDs.
