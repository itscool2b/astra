# Astra — 3D Interactive Solar System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a hyper-realistic, cinematic 3D interactive solar system web app with live NASA data, clickable celestial bodies, time scrubbing, and search — deployed on Vercel.

**Architecture:** React + TypeScript SPA with react-three-fiber for 3D rendering. Zustand for state, TanStack Query for API caching. Vercel serverless functions proxy 12 NASA/JPL API endpoints with KV caching. Logarithmic depth buffer and adaptive quality for performance across desktop and mobile.

**Tech Stack:** React 19, TypeScript, Vite, react-three-fiber, @react-three/drei, @react-three/postprocessing, three.js, zustand, @tanstack/react-query, framer-motion, fuse.js, @vercel/kv

**Spec:** `docs/superpowers/specs/2026-04-04-astra-solar-system-design.md`

---

## Phase 1: Project Scaffold & Foundation

### Task 1: Scaffold Vite + React + TypeScript Project

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
- Create: `.env.local`
- Create: `.gitignore`
- Create: `vercel.json`

- [ ] **Step 1: Create project with Vite**

```bash
cd /home/itscool2b/astra
npm create vite@latest . -- --template react-ts
```

If the directory is not empty (due to docs/), answer "yes" to proceed.

- [ ] **Step 2: Install core dependencies**

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing zustand @tanstack/react-query framer-motion fuse.js
npm install -D @types/three vite-plugin-glsl
```

- [ ] **Step 3: Install Vercel tooling**

```bash
npm install -D vercel @vercel/node
npm install @vercel/kv
```

- [ ] **Step 4: Configure Vite for GLSL imports**

Replace `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  plugins: [react(), glsl()],
  assetsInclude: ['**/*.glb', '**/*.hdr'],
})
```

- [ ] **Step 5: Add GLSL type declaration**

Add to `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

declare module '*.glsl' {
  const value: string
  export default value
}

declare module '*.vert' {
  const value: string
  export default value
}

declare module '*.frag' {
  const value: string
  export default value
}
```

- [ ] **Step 6: Create `.env.local`**

```
NASA_API_KEY=zdGGC5FF1qzUNyuR2WL4aBJSPaKKv1UqY8ivTB6S
VITE_API_BASE_URL=/api
```

- [ ] **Step 7: Create `.gitignore`**

Ensure `.gitignore` includes:

```
node_modules
dist
.env.local
.env*.local
.superpowers/
.vercel
```

- [ ] **Step 8: Create `vercel.json`**

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 9: Set up global CSS**

Replace `src/index.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
  color: #e0e0e0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}
```

- [ ] **Step 10: Create directory structure**

```bash
mkdir -p src/components/canvas
mkdir -p src/components/ui/panels
mkdir -p src/components/shared
mkdir -p src/data
mkdir -p src/lib/shaders
mkdir -p src/api
mkdir -p src/store
mkdir -p api/_lib
mkdir -p public/textures
```

- [ ] **Step 11: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server starts on localhost:5173, default React page loads.

- [ ] **Step 12: Init git and commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Vite + React + TS project with R3F dependencies"
```

---

### Task 2: Zustand Store & App Shell

**Files:**
- Create: `src/store/useStore.ts`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create Zustand store**

Create `src/store/useStore.ts`:

```typescript
import { create } from 'zustand'

export type ScaleMode = 'compressed' | 'realistic'
export type QualityTier = 'high' | 'medium' | 'low'

export interface CelestialTarget {
  id: string
  name: string
  type: 'star' | 'planet' | 'dwarf-planet' | 'moon' | 'asteroid' | 'comet'
  parentId?: string
}

interface TimeState {
  currentTime: Date
  playbackSpeed: number // 1 = realtime, 86400 = 1day/sec, etc.
  isPlaying: boolean
  speedPresets: number[]
}

interface AppState {
  // Selection
  selectedObject: CelestialTarget | null
  hoveredObject: string | null
  selectObject: (obj: CelestialTarget | null) => void
  setHoveredObject: (id: string | null) => void

  // Camera
  cameraTarget: CelestialTarget | null
  flyTo: (target: CelestialTarget) => void
  isFlyingTo: boolean
  setIsFlyingTo: (v: boolean) => void

  // Scale
  scaleMode: ScaleMode
  toggleScaleMode: () => void

  // Time
  time: TimeState
  setTime: (time: Date) => void
  setPlaybackSpeed: (speed: number) => void
  togglePlay: () => void

  // Quality
  quality: QualityTier
  setQuality: (q: QualityTier) => void

  // Search
  searchQuery: string
  setSearchQuery: (q: string) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void

  // UI
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
  loadingProgress: number
  setLoadingProgress: (p: number) => void
  loadingComplete: boolean
  setLoadingComplete: (v: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  // Selection
  selectedObject: null,
  hoveredObject: null,
  selectObject: (obj) => set({ selectedObject: obj, panelOpen: obj !== null }),
  setHoveredObject: (id) => set({ hoveredObject: id }),

  // Camera
  cameraTarget: null,
  flyTo: (target) => set({ cameraTarget: target, isFlyingTo: true }),
  isFlyingTo: false,
  setIsFlyingTo: (v) => set({ isFlyingTo: v }),

  // Scale
  scaleMode: 'compressed',
  toggleScaleMode: () =>
    set((s) => ({ scaleMode: s.scaleMode === 'compressed' ? 'realistic' : 'compressed' })),

  // Time
  time: {
    currentTime: new Date(),
    playbackSpeed: 1,
    isPlaying: false,
    speedPresets: [1, 86400, 2592000, 31557600], // realtime, day/s, month/s, year/s
  },
  setTime: (time) => set((s) => ({ time: { ...s.time, currentTime: time } })),
  setPlaybackSpeed: (speed) => set((s) => ({ time: { ...s.time, playbackSpeed: speed } })),
  togglePlay: () => set((s) => ({ time: { ...s.time, isPlaying: !s.time.isPlaying } })),

  // Quality
  quality: 'high',
  setQuality: (q) => set({ quality: q }),

  // Search
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),

  // UI
  panelOpen: false,
  setPanelOpen: (open) => set({ panelOpen: open }),
  loadingProgress: 0,
  setLoadingProgress: (p) => set({ loadingProgress: p }),
  loadingComplete: false,
  setLoadingComplete: (v) => set({ loadingComplete: v }),
}))
```

- [ ] **Step 2: Set up App shell with R3F Canvas and QueryClient**

Replace `src/App.tsx`:

```tsx
import { Canvas } from '@react-three/fiber'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Canvas
          gl={{
            antialias: false, // we use FXAA post-processing instead
            logarithmicDepthBuffer: true,
            powerPreference: 'high-performance',
            alpha: false,
          }}
          camera={{ fov: 45, near: 0.001, far: 1e12, position: [0, 50, 150] }}
          dpr={[1, 2]}
          style={{ background: '#000' }}
        >
          <Suspense fallback={null}>
            {/* Scene components will go here */}
            <ambientLight intensity={0.02} />
          </Suspense>
        </Canvas>
        {/* UI overlays will go here */}
      </div>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 3: Update main.tsx**

Replace `src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 4: Verify black canvas renders**

```bash
npm run dev
```

Expected: Black canvas fills viewport. No errors in console.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Zustand store and R3F canvas shell"
```

---

## Phase 2: Solar System Data & Orbital Mechanics

### Task 3: Static Solar System Data

**Files:**
- Create: `src/data/planets.ts`
- Create: `src/data/moons.ts`
- Create: `src/data/dwarfPlanets.ts`
- Create: `src/data/types.ts`

- [ ] **Step 1: Define data types**

Create `src/data/types.ts`:

```typescript
export interface OrbitalElements {
  semiMajorAxis: number      // AU
  eccentricity: number
  inclination: number        // degrees
  longitudeOfAscendingNode: number  // degrees (Ω)
  argumentOfPerihelion: number      // degrees (ω)
  meanAnomalyAtEpoch: number       // degrees (M0)
  epoch: number              // Julian date of M0
  period: number             // Earth years
}

export interface PhysicalData {
  radius: number             // km
  mass: number               // kg
  density: number            // g/cm³
  gravity: number            // m/s²
  escapeVelocity: number     // km/s
  rotationPeriod: number     // hours (negative = retrograde)
  axialTilt: number          // degrees
  meanTemperature: number    // °C
  minTemperature?: number    // °C
  maxTemperature?: number    // °C
}

export interface AtmosphereData {
  composition: { molecule: string; percentage: number }[]
  surfacePressure?: number   // atm
}

export interface PlanetData {
  id: string
  name: string
  type: 'terrestrial' | 'gas-giant' | 'ice-giant'
  orbit: OrbitalElements
  physical: PhysicalData
  atmosphere?: AtmosphereData
  hasRings: boolean
  ringInnerRadius?: number   // planet radii
  ringOuterRadius?: number   // planet radii
  description: string
  discoverer?: string
  discoveryYear?: number
  color: string              // hex color for orbit line and labels
  textureSet: {
    albedo: string
    normal?: string
    specular?: string
    clouds?: string
    night?: string
    ring?: string
    ringAlpha?: string
  }
}

export interface MoonData {
  id: string
  name: string
  parentId: string
  orbit: OrbitalElements     // relative to parent, AU scaled to parent system
  physical: {
    radius: number           // km
    mass?: number            // kg
    albedo?: number
  }
  discoverer?: string
  discoveryYear?: number
  description: string
  textureId?: string
}

export interface DwarfPlanetData {
  id: string
  name: string
  orbit: OrbitalElements
  physical: {
    radius: number
    mass?: number
    density?: number
    rotationPeriod?: number
    axialTilt?: number
    meanTemperature?: number
  }
  description: string
  discoverer: string
  discoveryYear: number
  color: string
}

export interface SearchableObject {
  id: string
  name: string
  type: 'star' | 'planet' | 'dwarf-planet' | 'moon' | 'asteroid'
  parentId?: string
  parentName?: string
}
```

- [ ] **Step 2: Create planet data**

Create `src/data/planets.ts` with full data for all 8 planets. The data below uses J2000 epoch (JD 2451545.0 = Jan 1.5, 2000 TT) orbital elements. Texture filenames reference files we'll download later.

```typescript
import { PlanetData } from './types'

export const PLANETS: PlanetData[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'terrestrial',
    orbit: {
      semiMajorAxis: 0.387098,
      eccentricity: 0.205630,
      inclination: 7.005,
      longitudeOfAscendingNode: 48.331,
      argumentOfPerihelion: 29.124,
      meanAnomalyAtEpoch: 174.796,
      epoch: 2451545.0,
      period: 0.240846,
    },
    physical: {
      radius: 2439.7,
      mass: 3.3011e23,
      density: 5.427,
      gravity: 3.7,
      escapeVelocity: 4.25,
      rotationPeriod: 1407.6,
      axialTilt: 0.034,
      meanTemperature: 167,
      minTemperature: -173,
      maxTemperature: 427,
    },
    hasRings: false,
    description: 'The smallest planet and closest to the Sun. Its surface is heavily cratered and resembles Earth\'s Moon.',
    color: '#b5a07a',
    textureSet: { albedo: 'mercury_albedo.jpg', normal: 'mercury_normal.jpg' },
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'terrestrial',
    orbit: {
      semiMajorAxis: 0.723332,
      eccentricity: 0.006772,
      inclination: 3.39458,
      longitudeOfAscendingNode: 76.680,
      argumentOfPerihelion: 54.884,
      meanAnomalyAtEpoch: 50.115,
      epoch: 2451545.0,
      period: 0.615198,
    },
    physical: {
      radius: 6051.8,
      mass: 4.8675e24,
      density: 5.243,
      gravity: 8.87,
      escapeVelocity: 10.36,
      rotationPeriod: -5832.5,
      axialTilt: 177.36,
      meanTemperature: 464,
    },
    atmosphere: {
      composition: [
        { molecule: 'CO₂', percentage: 96.5 },
        { molecule: 'N₂', percentage: 3.5 },
      ],
      surfacePressure: 92,
    },
    hasRings: false,
    description: 'Earth\'s "sister planet" with a thick toxic atmosphere and extreme greenhouse effect. The hottest planet in our solar system.',
    color: '#e8cfa0',
    textureSet: { albedo: 'venus_surface.jpg', clouds: 'venus_atmosphere.jpg' },
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'terrestrial',
    orbit: {
      semiMajorAxis: 1.000001018,
      eccentricity: 0.0167086,
      inclination: 0.00005,
      longitudeOfAscendingNode: -11.26064,
      argumentOfPerihelion: 114.20783,
      meanAnomalyAtEpoch: 358.617,
      epoch: 2451545.0,
      period: 1.0000174,
    },
    physical: {
      radius: 6371.0,
      mass: 5.9722e24,
      density: 5.514,
      gravity: 9.807,
      escapeVelocity: 11.186,
      rotationPeriod: 23.9345,
      axialTilt: 23.4393,
      meanTemperature: 15,
      minTemperature: -89,
      maxTemperature: 57,
    },
    atmosphere: {
      composition: [
        { molecule: 'N₂', percentage: 78.08 },
        { molecule: 'O₂', percentage: 20.95 },
        { molecule: 'Ar', percentage: 0.93 },
        { molecule: 'CO₂', percentage: 0.04 },
      ],
      surfacePressure: 1,
    },
    hasRings: false,
    description: 'Our home planet — the only known world with liquid surface water and life. The densest planet in the solar system.',
    color: '#4a90d9',
    textureSet: {
      albedo: 'earth_daymap.jpg',
      normal: 'earth_normal.jpg',
      specular: 'earth_specular.jpg',
      clouds: 'earth_clouds.png',
      night: 'earth_nightmap.jpg',
    },
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'terrestrial',
    orbit: {
      semiMajorAxis: 1.523679,
      eccentricity: 0.0934,
      inclination: 1.850,
      longitudeOfAscendingNode: 49.558,
      argumentOfPerihelion: 286.502,
      meanAnomalyAtEpoch: 19.373,
      epoch: 2451545.0,
      period: 1.8808,
    },
    physical: {
      radius: 3389.5,
      mass: 6.4171e23,
      density: 3.934,
      gravity: 3.721,
      escapeVelocity: 5.027,
      rotationPeriod: 24.6229,
      axialTilt: 25.19,
      meanTemperature: -65,
      minTemperature: -153,
      maxTemperature: 20,
    },
    atmosphere: {
      composition: [
        { molecule: 'CO₂', percentage: 95.32 },
        { molecule: 'N₂', percentage: 2.6 },
        { molecule: 'Ar', percentage: 1.9 },
      ],
      surfacePressure: 0.006,
    },
    hasRings: false,
    description: 'The Red Planet, home to the tallest volcano (Olympus Mons) and the longest canyon (Valles Marineris) in the solar system.',
    color: '#c1440e',
    textureSet: { albedo: 'mars_albedo.jpg', normal: 'mars_normal.jpg' },
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'gas-giant',
    orbit: {
      semiMajorAxis: 5.2026,
      eccentricity: 0.0489,
      inclination: 1.303,
      longitudeOfAscendingNode: 100.464,
      argumentOfPerihelion: 273.867,
      meanAnomalyAtEpoch: 20.020,
      epoch: 2451545.0,
      period: 11.862,
    },
    physical: {
      radius: 69911,
      mass: 1.8982e27,
      density: 1.326,
      gravity: 24.79,
      escapeVelocity: 59.5,
      rotationPeriod: 9.925,
      axialTilt: 3.13,
      meanTemperature: -110,
    },
    atmosphere: {
      composition: [
        { molecule: 'H₂', percentage: 89.8 },
        { molecule: 'He', percentage: 10.2 },
      ],
    },
    hasRings: true,
    ringInnerRadius: 1.29,
    ringOuterRadius: 3.08,
    description: 'The largest planet — a gas giant with a mass more than twice that of all other planets combined. Famous for its Great Red Spot storm.',
    color: '#c4a882',
    textureSet: { albedo: 'jupiter_albedo.jpg' },
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'gas-giant',
    orbit: {
      semiMajorAxis: 9.5549,
      eccentricity: 0.0565,
      inclination: 2.485,
      longitudeOfAscendingNode: 113.665,
      argumentOfPerihelion: 339.392,
      meanAnomalyAtEpoch: 317.020,
      epoch: 2451545.0,
      period: 29.4571,
    },
    physical: {
      radius: 58232,
      mass: 5.6834e26,
      density: 0.687,
      gravity: 10.44,
      escapeVelocity: 35.5,
      rotationPeriod: 10.656,
      axialTilt: 26.73,
      meanTemperature: -140,
    },
    atmosphere: {
      composition: [
        { molecule: 'H₂', percentage: 96.3 },
        { molecule: 'He', percentage: 3.25 },
      ],
    },
    hasRings: true,
    ringInnerRadius: 1.11,
    ringOuterRadius: 4.02,
    description: 'The jewel of the solar system — its iconic ring system is the most extensive of any planet, made mostly of ice particles with rocky debris.',
    color: '#e8d5a3',
    textureSet: { albedo: 'saturn_albedo.jpg', ring: 'saturn_ring_color.png', ringAlpha: 'saturn_ring_alpha.png' },
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'ice-giant',
    orbit: {
      semiMajorAxis: 19.2184,
      eccentricity: 0.046381,
      inclination: 0.773,
      longitudeOfAscendingNode: 74.006,
      argumentOfPerihelion: 96.998857,
      meanAnomalyAtEpoch: 142.2386,
      epoch: 2451545.0,
      period: 84.0205,
    },
    physical: {
      radius: 25362,
      mass: 8.6810e25,
      density: 1.27,
      gravity: 8.87,
      escapeVelocity: 21.3,
      rotationPeriod: -17.24,
      axialTilt: 97.77,
      meanTemperature: -195,
    },
    atmosphere: {
      composition: [
        { molecule: 'H₂', percentage: 82.5 },
        { molecule: 'He', percentage: 15.2 },
        { molecule: 'CH₄', percentage: 2.3 },
      ],
    },
    hasRings: true,
    ringInnerRadius: 1.59,
    ringOuterRadius: 2.0,
    description: 'An ice giant tilted almost completely on its side (98°). The coldest planetary atmosphere in the solar system.',
    discoverer: 'William Herschel',
    discoveryYear: 1781,
    color: '#7ec8e3',
    textureSet: { albedo: 'uranus_albedo.jpg' },
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'ice-giant',
    orbit: {
      semiMajorAxis: 30.07,
      eccentricity: 0.008678,
      inclination: 1.77,
      longitudeOfAscendingNode: 131.784,
      argumentOfPerihelion: 276.336,
      meanAnomalyAtEpoch: 256.228,
      epoch: 2451545.0,
      period: 164.8,
    },
    physical: {
      radius: 24622,
      mass: 1.02413e26,
      density: 1.638,
      gravity: 11.15,
      escapeVelocity: 23.5,
      rotationPeriod: 16.11,
      axialTilt: 28.32,
      meanTemperature: -200,
    },
    atmosphere: {
      composition: [
        { molecule: 'H₂', percentage: 80 },
        { molecule: 'He', percentage: 19 },
        { molecule: 'CH₄', percentage: 1.5 },
      ],
    },
    hasRings: true,
    ringInnerRadius: 1.69,
    ringOuterRadius: 2.54,
    description: 'The windiest planet with supersonic jet streams over 2,000 km/h. The most distant planet from the Sun.',
    discoverer: 'Johann Galle',
    discoveryYear: 1846,
    color: '#3f54ba',
    textureSet: { albedo: 'neptune_albedo.jpg' },
  },
]

export const PLANET_MAP = new Map(PLANETS.map((p) => [p.id, p]))
```

- [ ] **Step 3: Create dwarf planet data**

Create `src/data/dwarfPlanets.ts`:

```typescript
import { DwarfPlanetData } from './types'

export const DWARF_PLANETS: DwarfPlanetData[] = [
  {
    id: 'ceres',
    name: 'Ceres',
    orbit: {
      semiMajorAxis: 2.7691,
      eccentricity: 0.0760,
      inclination: 10.593,
      longitudeOfAscendingNode: 80.327,
      argumentOfPerihelion: 73.597,
      meanAnomalyAtEpoch: 77.37209589,
      epoch: 2451545.0,
      period: 4.599,
    },
    physical: {
      radius: 473,
      mass: 9.3835e20,
      density: 2.162,
      rotationPeriod: 9.074,
      meanTemperature: -105,
    },
    description: 'The largest object in the asteroid belt and the only dwarf planet in the inner solar system.',
    discoverer: 'Giuseppe Piazzi',
    discoveryYear: 1801,
    color: '#a0a0a0',
  },
  {
    id: 'pluto',
    name: 'Pluto',
    orbit: {
      semiMajorAxis: 39.482,
      eccentricity: 0.2488,
      inclination: 17.16,
      longitudeOfAscendingNode: 110.299,
      argumentOfPerihelion: 113.834,
      meanAnomalyAtEpoch: 14.53,
      epoch: 2451545.0,
      period: 247.94,
    },
    physical: {
      radius: 1188.3,
      mass: 1.303e22,
      density: 1.854,
      rotationPeriod: -153.293,
      axialTilt: 122.53,
      meanTemperature: -229,
    },
    description: 'Once the ninth planet, now the most famous dwarf planet. Explored by New Horizons in 2015, revealing a complex and active world.',
    discoverer: 'Clyde Tombaugh',
    discoveryYear: 1930,
    color: '#d4a574',
  },
  {
    id: 'haumea',
    name: 'Haumea',
    orbit: {
      semiMajorAxis: 43.335,
      eccentricity: 0.1912,
      inclination: 28.19,
      longitudeOfAscendingNode: 121.900,
      argumentOfPerihelion: 239.041,
      meanAnomalyAtEpoch: 218.205,
      epoch: 2451545.0,
      period: 285.4,
    },
    physical: {
      radius: 816,
      mass: 4.006e21,
      density: 1.885,
      rotationPeriod: 3.915,
    },
    description: 'An egg-shaped dwarf planet in the Kuiper belt with one of the fastest rotations of any known large body in the solar system.',
    discoverer: 'Mike Brown',
    discoveryYear: 2004,
    color: '#c8c8c8',
  },
  {
    id: 'makemake',
    name: 'Makemake',
    orbit: {
      semiMajorAxis: 45.792,
      eccentricity: 0.1559,
      inclination: 28.96,
      longitudeOfAscendingNode: 79.382,
      argumentOfPerihelion: 297.240,
      meanAnomalyAtEpoch: 165.514,
      epoch: 2451545.0,
      period: 309.88,
    },
    physical: {
      radius: 715,
      mass: 3.1e21,
      density: 1.7,
      rotationPeriod: 22.827,
      meanTemperature: -239,
    },
    description: 'One of the largest Kuiper belt objects, with a reddish-brown surface likely covered in tholins.',
    discoverer: 'Mike Brown',
    discoveryYear: 2005,
    color: '#c4956a',
  },
  {
    id: 'eris',
    name: 'Eris',
    orbit: {
      semiMajorAxis: 67.668,
      eccentricity: 0.4407,
      inclination: 44.187,
      longitudeOfAscendingNode: 35.877,
      argumentOfPerihelion: 151.639,
      meanAnomalyAtEpoch: 205.989,
      epoch: 2451545.0,
      period: 559.07,
    },
    physical: {
      radius: 1163,
      mass: 1.6466e22,
      density: 2.52,
      rotationPeriod: 25.9,
      meanTemperature: -243,
    },
    description: 'The most massive known dwarf planet. Its discovery was a key factor in Pluto\'s reclassification.',
    discoverer: 'Mike Brown',
    discoveryYear: 2005,
    color: '#e0e0e0',
  },
]

export const DWARF_PLANET_MAP = new Map(DWARF_PLANETS.map((d) => [d.id, d]))
```

- [ ] **Step 4: Create moon data (major moons only — 20 most notable)**

Create `src/data/moons.ts`:

```typescript
import { MoonData } from './types'

// Orbital elements for moons are relative to parent, with semiMajorAxis in AU
// For moons, we use simplified circular-ish orbits since the visual difference is negligible
const kmToAU = (km: number) => km / 1.496e8

export const MOONS: MoonData[] = [
  // Earth
  {
    id: 'moon', name: 'Moon', parentId: 'earth',
    orbit: { semiMajorAxis: kmToAU(384400), eccentricity: 0.0549, inclination: 5.145, longitudeOfAscendingNode: 125.08, argumentOfPerihelion: 318.15, meanAnomalyAtEpoch: 135.27, epoch: 2451545.0, period: 0.0748 },
    physical: { radius: 1737.4, mass: 7.342e22, albedo: 0.12 },
    description: 'Earth\'s only natural satellite. The fifth-largest moon in the solar system and the largest relative to its parent planet.',
    textureId: 'moon',
  },
  // Mars
  {
    id: 'phobos', name: 'Phobos', parentId: 'mars',
    orbit: { semiMajorAxis: kmToAU(9376), eccentricity: 0.0151, inclination: 1.093, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.000877 },
    physical: { radius: 11.267, albedo: 0.071 },
    discoverer: 'Asaph Hall', discoveryYear: 1877,
    description: 'Mars\'s larger moon, slowly spiraling inward. Will either crash into Mars or break apart into a ring in ~50 million years.',
  },
  {
    id: 'deimos', name: 'Deimos', parentId: 'mars',
    orbit: { semiMajorAxis: kmToAU(23460), eccentricity: 0.00033, inclination: 0.93, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.003455 },
    physical: { radius: 6.2, albedo: 0.068 },
    discoverer: 'Asaph Hall', discoveryYear: 1877,
    description: 'Mars\'s smaller, more distant moon. Likely a captured asteroid.',
  },
  // Jupiter — Galilean moons
  {
    id: 'io', name: 'Io', parentId: 'jupiter',
    orbit: { semiMajorAxis: kmToAU(421700), eccentricity: 0.0041, inclination: 0.05, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.00485 },
    physical: { radius: 1821.6, mass: 8.9319e22, albedo: 0.63 },
    discoverer: 'Galileo Galilei', discoveryYear: 1610,
    description: 'The most volcanically active body in the solar system, with over 400 active volcanoes driven by tidal heating from Jupiter.',
    textureId: 'io',
  },
  {
    id: 'europa', name: 'Europa', parentId: 'jupiter',
    orbit: { semiMajorAxis: kmToAU(671100), eccentricity: 0.009, inclination: 0.47, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.00972 },
    physical: { radius: 1560.8, mass: 4.7998e22, albedo: 0.67 },
    discoverer: 'Galileo Galilei', discoveryYear: 1610,
    description: 'A prime candidate for extraterrestrial life. Beneath its icy crust lies a global ocean with more water than all of Earth\'s oceans.',
    textureId: 'europa',
  },
  {
    id: 'ganymede', name: 'Ganymede', parentId: 'jupiter',
    orbit: { semiMajorAxis: kmToAU(1070400), eccentricity: 0.0013, inclination: 0.20, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.01959 },
    physical: { radius: 2634.1, mass: 1.4819e23, albedo: 0.43 },
    discoverer: 'Galileo Galilei', discoveryYear: 1610,
    description: 'The largest moon in the solar system — bigger than Mercury. The only moon known to have its own magnetic field.',
    textureId: 'ganymede',
  },
  {
    id: 'callisto', name: 'Callisto', parentId: 'jupiter',
    orbit: { semiMajorAxis: kmToAU(1882700), eccentricity: 0.0074, inclination: 0.192, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.04570 },
    physical: { radius: 2410.3, mass: 1.0759e23, albedo: 0.17 },
    discoverer: 'Galileo Galilei', discoveryYear: 1610,
    description: 'The most heavily cratered object in the solar system. May also harbor a subsurface ocean.',
    textureId: 'callisto',
  },
  // Saturn
  {
    id: 'mimas', name: 'Mimas', parentId: 'saturn',
    orbit: { semiMajorAxis: kmToAU(185540), eccentricity: 0.0196, inclination: 1.574, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.00259 },
    physical: { radius: 198.2, albedo: 0.962 },
    discoverer: 'William Herschel', discoveryYear: 1789,
    description: 'Known as the "Death Star moon" for its enormous Herschel crater that gives it a striking resemblance to the Star Wars space station.',
  },
  {
    id: 'enceladus', name: 'Enceladus', parentId: 'saturn',
    orbit: { semiMajorAxis: kmToAU(238040), eccentricity: 0.0047, inclination: 0.009, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.00375 },
    physical: { radius: 252.1, mass: 1.08e20, albedo: 1.375 },
    discoverer: 'William Herschel', discoveryYear: 1789,
    description: 'Shoots geysers of water ice into space from its south pole. A prime target in the search for extraterrestrial life.',
  },
  {
    id: 'titan', name: 'Titan', parentId: 'saturn',
    orbit: { semiMajorAxis: kmToAU(1221870), eccentricity: 0.0288, inclination: 0.3485, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.04369 },
    physical: { radius: 2574.7, mass: 1.3452e23, albedo: 0.22 },
    discoverer: 'Christiaan Huygens', discoveryYear: 1655,
    description: 'The only moon with a dense atmosphere and the only body besides Earth with stable surface liquids (methane/ethane lakes).',
    textureId: 'titan',
  },
  {
    id: 'iapetus', name: 'Iapetus', parentId: 'saturn',
    orbit: { semiMajorAxis: kmToAU(3560820), eccentricity: 0.0286, inclination: 15.47, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.21723 },
    physical: { radius: 734.5, albedo: 0.6 },
    discoverer: 'Giovanni Cassini', discoveryYear: 1671,
    description: 'The "yin-yang moon" with one hemisphere bright white ice and the other dark as coal. Has a mysterious equatorial ridge.',
  },
  // Uranus
  {
    id: 'miranda', name: 'Miranda', parentId: 'uranus',
    orbit: { semiMajorAxis: kmToAU(129900), eccentricity: 0.0013, inclination: 4.338, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.00387 },
    physical: { radius: 235.8, albedo: 0.32 },
    discoverer: 'Gerard Kuiper', discoveryYear: 1948,
    description: 'Has one of the most extreme and varied surface topographies in the solar system, with canyons 12x deeper than the Grand Canyon.',
  },
  {
    id: 'ariel', name: 'Ariel', parentId: 'uranus',
    orbit: { semiMajorAxis: kmToAU(190900), eccentricity: 0.0012, inclination: 0.26, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.00693 },
    physical: { radius: 578.9, albedo: 0.53 },
    discoverer: 'William Lassell', discoveryYear: 1851,
    description: 'The brightest and possibly youngest surface of all Uranian moons, with extensive valleys and ridges.',
  },
  {
    id: 'titania', name: 'Titania', parentId: 'uranus',
    orbit: { semiMajorAxis: kmToAU(436300), eccentricity: 0.0011, inclination: 0.34, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.02383 },
    physical: { radius: 788.4, mass: 3.4e21, albedo: 0.35 },
    discoverer: 'William Herschel', discoveryYear: 1787,
    description: 'The largest moon of Uranus and the eighth-largest moon in the solar system.',
  },
  {
    id: 'oberon', name: 'Oberon', parentId: 'uranus',
    orbit: { semiMajorAxis: kmToAU(583500), eccentricity: 0.0014, inclination: 0.058, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.03691 },
    physical: { radius: 761.4, mass: 3.076e21, albedo: 0.31 },
    discoverer: 'William Herschel', discoveryYear: 1787,
    description: 'The outermost major moon of Uranus. Its surface is the most heavily cratered of all Uranian moons.',
  },
  // Neptune
  {
    id: 'triton', name: 'Triton', parentId: 'neptune',
    orbit: { semiMajorAxis: kmToAU(354759), eccentricity: 0.000016, inclination: 156.865, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: -0.01609 },
    physical: { radius: 1353.4, mass: 2.14e22, albedo: 0.76 },
    discoverer: 'William Lassell', discoveryYear: 1846,
    description: 'The only large moon with a retrograde orbit — likely a captured Kuiper Belt object. Has nitrogen geysers and a thin atmosphere.',
    textureId: 'triton',
  },
  // Pluto
  {
    id: 'charon', name: 'Charon', parentId: 'pluto',
    orbit: { semiMajorAxis: kmToAU(19591), eccentricity: 0.0002, inclination: 0.08, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.01754 },
    physical: { radius: 606, mass: 1.586e21, albedo: 0.2 },
    discoverer: 'James Christy', discoveryYear: 1978,
    description: 'Pluto\'s largest moon — so large relative to Pluto that they orbit each other (a binary system). Has canyons, mountains, and a reddish north pole.',
  },
]

export const MOON_MAP = new Map(MOONS.map((m) => [m.id, m]))
export const MOONS_BY_PARENT = MOONS.reduce((acc, m) => {
  const arr = acc.get(m.parentId) || []
  arr.push(m)
  acc.set(m.parentId, arr)
  return acc
}, new Map<string, MoonData[]>())
```

- [ ] **Step 5: Commit data layer**

```bash
git add src/data/
git commit -m "feat: add complete solar system data (planets, moons, dwarf planets, orbital elements)"
```

---

### Task 4: Orbital Mechanics Library

**Files:**
- Create: `src/lib/orbital.ts`
- Create: `src/lib/scales.ts`
- Create: `src/lib/coordinates.ts`

- [ ] **Step 1: Create orbital mechanics module**

This is the mathematical core — computes 3D positions from Keplerian elements at any given time.

Create `src/lib/orbital.ts`:

```typescript
import { OrbitalElements } from '../data/types'

const DEG_TO_RAD = Math.PI / 180
const TWO_PI = 2 * Math.PI
const J2000 = 2451545.0 // Julian date for J2000 epoch

/**
 * Convert a Date to Julian Date
 */
export function dateToJulian(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5
}

/**
 * Convert Julian Date to Date
 */
export function julianToDate(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000)
}

/**
 * Solve Kepler's equation M = E - e*sin(E) for E using Newton-Raphson.
 * M: mean anomaly (radians)
 * e: eccentricity
 * Returns: eccentric anomaly E (radians)
 */
export function solveKepler(M: number, e: number, tolerance = 1e-10): number {
  // Normalize M to [0, 2π)
  let Mn = M % TWO_PI
  if (Mn < 0) Mn += TWO_PI

  // Initial guess
  let E = Mn + e * Math.sin(Mn) * (1 + e * Math.cos(Mn))

  // Newton-Raphson iteration
  for (let i = 0; i < 30; i++) {
    const dE = (E - e * Math.sin(E) - Mn) / (1 - e * Math.cos(E))
    E -= dE
    if (Math.abs(dE) < tolerance) break
  }

  return E
}

/**
 * Compute true anomaly from eccentric anomaly
 */
export function trueAnomalyFromEccentric(E: number, e: number): number {
  return 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  )
}

/**
 * Compute 3D position in heliocentric ecliptic coordinates (AU) at a given Julian Date.
 * Returns [x, y, z] in AU.
 */
export function computePosition(
  orbit: OrbitalElements,
  jd: number
): [number, number, number] {
  // Mean motion (radians per day)
  const n = TWO_PI / (orbit.period * 365.25)

  // Time since epoch in days
  const dt = jd - orbit.epoch

  // Mean anomaly at time jd
  const M = (orbit.meanAnomalyAtEpoch * DEG_TO_RAD + n * dt) % TWO_PI

  // Solve Kepler's equation for eccentric anomaly
  const E = solveKepler(M, orbit.eccentricity)

  // True anomaly
  const v = trueAnomalyFromEccentric(E, orbit.eccentricity)

  // Distance from focus
  const r = orbit.semiMajorAxis * (1 - orbit.eccentricity * Math.cos(E))

  // Position in orbital plane
  const xOrb = r * Math.cos(v)
  const yOrb = r * Math.sin(v)

  // Convert orbital elements to radians
  const Omega = orbit.longitudeOfAscendingNode * DEG_TO_RAD
  const omega = orbit.argumentOfPerihelion * DEG_TO_RAD
  const I = orbit.inclination * DEG_TO_RAD

  // Rotation to heliocentric ecliptic coordinates
  const cosOmega = Math.cos(Omega)
  const sinOmega = Math.sin(Omega)
  const cosomega = Math.cos(omega)
  const sinomega = Math.sin(omega)
  const cosI = Math.cos(I)
  const sinI = Math.sin(I)

  const x = xOrb * (cosOmega * cosomega - sinOmega * sinomega * cosI) -
            yOrb * (cosOmega * sinomega + sinOmega * cosomega * cosI)

  const y = xOrb * (sinOmega * cosomega + cosOmega * sinomega * cosI) -
            yOrb * (sinOmega * sinomega - cosOmega * cosomega * cosI)

  const z = xOrb * (sinomega * sinI) + yOrb * (cosomega * sinI)

  return [x, y, z]
}

/**
 * Compute an array of [x, y, z] points tracing the full orbit ellipse.
 * Used for drawing orbit lines. `segments` controls smoothness.
 */
export function computeOrbitPath(
  orbit: OrbitalElements,
  segments = 256
): [number, number, number][] {
  const points: [number, number, number][] = []

  const Omega = orbit.longitudeOfAscendingNode * DEG_TO_RAD
  const omega = orbit.argumentOfPerihelion * DEG_TO_RAD
  const I = orbit.inclination * DEG_TO_RAD

  const cosOmega = Math.cos(Omega)
  const sinOmega = Math.sin(Omega)
  const cosomega = Math.cos(omega)
  const sinomega = Math.sin(omega)
  const cosI = Math.cos(I)
  const sinI = Math.sin(I)

  for (let i = 0; i <= segments; i++) {
    const v = (i / segments) * TWO_PI
    const r = orbit.semiMajorAxis * (1 - orbit.eccentricity ** 2) / (1 + orbit.eccentricity * Math.cos(v))

    const xOrb = r * Math.cos(v)
    const yOrb = r * Math.sin(v)

    const x = xOrb * (cosOmega * cosomega - sinOmega * sinomega * cosI) -
              yOrb * (cosOmega * sinomega + sinOmega * cosomega * cosI)

    const y = xOrb * (sinOmega * cosomega + cosOmega * sinomega * cosI) -
              yOrb * (sinOmega * sinomega - cosOmega * cosomega * cosI)

    const z = xOrb * (sinomega * sinI) + yOrb * (cosomega * sinI)

    points.push([x, y, z])
  }

  return points
}
```

- [ ] **Step 2: Create scale system**

Create `src/lib/scales.ts`:

```typescript
import { ScaleMode } from '../store/useStore'

// 1 AU in scene units (Three.js units)
// In compressed mode, we use a log scale so everything fits on screen
// In realistic mode, 1 AU = 100 scene units

const AU_REALISTIC = 100 // 1 AU = 100 Three.js units
const SUN_RADIUS_KM = 695700
const AU_KM = 1.496e8

/**
 * Convert AU distance to scene units based on scale mode.
 * Compressed mode uses a logarithmic scaling to keep all planets visible.
 */
export function auToScene(au: number, mode: ScaleMode): number {
  if (mode === 'realistic') {
    return au * AU_REALISTIC
  }
  // Compressed: logarithmic scale
  // Maps 0.39 AU (Mercury) → ~15 units, 30 AU (Neptune) → ~120 units
  if (au <= 0) return 0
  return Math.log2(1 + au * 8) * 12
}

/**
 * Convert planet radius (km) to scene units.
 * Always exaggerated so planets are visible/clickable.
 * In compressed mode, exaggeration is stronger.
 */
export function radiusToScene(radiusKm: number, mode: ScaleMode): number {
  // Realistic: planet radii are still slightly exaggerated for visibility
  // True scale: Earth at 1 AU = 100 units would be 0.0043 units (invisible)
  // We use a minimum visible size + log scale
  const trueRadius = (radiusKm / AU_KM) * (mode === 'realistic' ? AU_REALISTIC : 50)

  if (mode === 'realistic') {
    // Exaggerate by 200x so planets are at least visible dots
    return Math.max(trueRadius * 200, 0.1)
  }

  // Compressed: stronger exaggeration, log-scaled so gas giants don't dominate
  const logRadius = Math.log2(1 + radiusKm / 1000) * 0.4
  return Math.max(logRadius, 0.15)
}

/**
 * Convert Sun radius to scene units (always larger than planets).
 */
export function sunRadiusToScene(mode: ScaleMode): number {
  if (mode === 'realistic') {
    return (SUN_RADIUS_KM / AU_KM) * AU_REALISTIC * 200
  }
  return 3.5 // Fixed size in compressed mode
}

/**
 * Get the camera distance for a nice orbit view of an object.
 */
export function getOrbitDistance(objectRadius: number): number {
  return objectRadius * 4
}
```

- [ ] **Step 3: Create coordinate utilities**

Create `src/lib/coordinates.ts`:

```typescript
import * as THREE from 'three'
import { OrbitalElements } from '../data/types'
import { computePosition } from './orbital'
import { auToScene, radiusToScene } from './scales'
import { ScaleMode } from '../store/useStore'

/**
 * Get a Three.js Vector3 position for a body at a given time.
 */
export function getBodyPosition(
  orbit: OrbitalElements,
  time: Date,
  scaleMode: ScaleMode,
  parentPosition?: THREE.Vector3
): THREE.Vector3 {
  const jd = time.getTime() / 86400000 + 2440587.5
  const [x, y, z] = computePosition(orbit, jd)

  // Convert from ecliptic AU to scene coordinates
  const sx = auToScene(x, scaleMode)
  const sy = auToScene(z, scaleMode) // ecliptic Z → scene Y (up)
  const sz = auToScene(y, scaleMode) // ecliptic Y → scene Z

  const pos = new THREE.Vector3(sx, sy, sz)

  if (parentPosition) {
    pos.add(parentPosition)
  }

  return pos
}

/**
 * Compute the rotation angle of a body around its axis at a given time.
 * Returns radians.
 */
export function getBodyRotation(
  rotationPeriodHours: number,
  time: Date
): number {
  const hours = time.getTime() / 3600000
  const rotationsCompleted = hours / Math.abs(rotationPeriodHours)
  const sign = rotationPeriodHours < 0 ? -1 : 1
  return (rotationsCompleted * 2 * Math.PI * sign) % (2 * Math.PI)
}
```

- [ ] **Step 4: Verify orbital mechanics with known values**

Create a quick test — run in browser console or as a script:

```bash
npx tsx -e "
const { computePosition, dateToJulian } = require('./src/lib/orbital.ts');
// Earth at J2000 should be near (0.983, 0.178, 0) AU (perihelion area)
const earthOrbit = { semiMajorAxis: 1.000001018, eccentricity: 0.0167086, inclination: 0.00005, longitudeOfAscendingNode: -11.26064, argumentOfPerihelion: 114.20783, meanAnomalyAtEpoch: 358.617, epoch: 2451545.0, period: 1.0000174 };
const pos = computePosition(earthOrbit, 2451545.0);
console.log('Earth at J2000:', pos.map(v => v.toFixed(4)));
const dist = Math.sqrt(pos[0]**2 + pos[1]**2 + pos[2]**2);
console.log('Distance from Sun:', dist.toFixed(6), 'AU (expect ~0.983)');
"
```

Expected: Distance should be approximately 0.983 AU (Earth's perihelion distance).

- [ ] **Step 5: Commit**

```bash
git add src/lib/
git commit -m "feat: add orbital mechanics library, scale system, and coordinate transforms"
```

---

## Phase 3: Core 3D Scene

### Task 5: Skybox & Basic Scene Setup

**Files:**
- Create: `src/components/canvas/Scene.tsx`
- Create: `src/components/canvas/Skybox.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create Skybox component**

Create `src/components/canvas/Skybox.tsx`:

```tsx
import { useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

/**
 * Procedural starfield skybox — no external texture dependency.
 * Creates a sphere of point stars with varying brightness and subtle color.
 */
export function Skybox() {
  const { scene } = useThree()

  const starGeometry = useMemo(() => {
    const count = 12000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Random point on sphere
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 5000 + Math.random() * 500

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      // Subtle color variation: white, blue-white, yellow-white
      const colorRoll = Math.random()
      if (colorRoll < 0.6) {
        // White
        colors[i * 3] = 0.9 + Math.random() * 0.1
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1
        colors[i * 3 + 2] = 0.95 + Math.random() * 0.05
      } else if (colorRoll < 0.8) {
        // Blue-white (hot stars)
        colors[i * 3] = 0.7 + Math.random() * 0.1
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.1
        colors[i * 3 + 2] = 1.0
      } else {
        // Yellow-white (cooler stars)
        colors[i * 3] = 1.0
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1
        colors[i * 3 + 2] = 0.6 + Math.random() * 0.2
      }

      // Varying sizes — most small, a few bright
      sizes[i] = Math.random() < 0.97 ? 0.5 + Math.random() * 1.5 : 2 + Math.random() * 3
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [])

  useEffect(() => {
    scene.background = new THREE.Color(0x000005)
  }, [scene])

  return (
    <points geometry={starGeometry}>
      <pointsMaterial
        vertexColors
        sizeAttenuation={false}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  )
}
```

- [ ] **Step 2: Create Scene component**

Create `src/components/canvas/Scene.tsx`:

```tsx
import { Skybox } from './Skybox'

export function Scene() {
  return (
    <>
      <Skybox />
    </>
  )
}
```

- [ ] **Step 3: Wire Scene into App**

Update `src/App.tsx` — replace the `<Suspense>` contents:

```tsx
import { Canvas } from '@react-three/fiber'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import { Scene } from './components/canvas/Scene'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Canvas
          gl={{
            antialias: false,
            logarithmicDepthBuffer: true,
            powerPreference: 'high-performance',
            alpha: false,
          }}
          camera={{ fov: 45, near: 0.001, far: 1e12, position: [0, 50, 150] }}
          dpr={[1, 2]}
          style={{ background: '#000' }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 4: Verify starfield renders**

```bash
npm run dev
```

Expected: A black canvas filled with colored star points. No controls yet — static camera.

- [ ] **Step 5: Commit**

```bash
git add src/components/canvas/
git commit -m "feat: add procedural starfield skybox"
```

---

### Task 6: Sun Rendering

**Files:**
- Create: `src/lib/shaders/sun.vert`
- Create: `src/lib/shaders/sun.frag`
- Create: `src/lib/shaders/corona.vert`
- Create: `src/lib/shaders/corona.frag`
- Create: `src/components/canvas/Sun.tsx`
- Modify: `src/components/canvas/Scene.tsx`

- [ ] **Step 1: Create Sun vertex shader**

Create `src/lib/shaders/sun.vert`:

```glsl
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

- [ ] **Step 2: Create Sun fragment shader**

Create `src/lib/shaders/sun.frag`:

```glsl
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

// Simplex-style noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

void main() {
  vec3 pos = vPosition * 2.0;
  float t = uTime * 0.05;

  // Multi-octave noise for surface turbulence
  float n1 = fbm(pos + vec3(t * 0.3, t * 0.1, t * 0.2));
  float n2 = fbm(pos * 1.5 + vec3(-t * 0.2, t * 0.15, -t * 0.1));
  float noise = n1 * 0.6 + n2 * 0.4;

  // Color gradient based on noise
  vec3 color = mix(uColor1, uColor2, smoothstep(-0.3, 0.5, noise));
  color = mix(color, uColor3, smoothstep(0.3, 0.8, noise));

  // Bright hotspots (sunspots-like granulation)
  float hotspot = smoothstep(0.5, 0.9, fbm(pos * 3.0 + t * 0.4));
  color += vec3(0.5, 0.3, 0.1) * hotspot;

  // Limb darkening
  float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
  float limb = pow(rim, 1.5) * 0.4;
  color *= (1.0 - limb);

  // Emissive HDR output — we rely on bloom to make it glow
  gl_FragColor = vec4(color * 2.5, 1.0);
}
```

- [ ] **Step 3: Create corona shaders**

Create `src/lib/shaders/corona.vert`:

```glsl
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
```

Create `src/lib/shaders/corona.frag`:

```glsl
uniform float uTime;
uniform float uOpacity;

varying vec2 vUv;

void main() {
  vec2 center = vUv - 0.5;
  float dist = length(center);

  // Radial falloff
  float corona = 1.0 - smoothstep(0.0, 0.5, dist);
  corona = pow(corona, 2.0);

  // Flickering rays
  float angle = atan(center.y, center.x);
  float rays = sin(angle * 8.0 + uTime * 0.5) * 0.5 + 0.5;
  rays *= sin(angle * 13.0 - uTime * 0.3) * 0.5 + 0.5;
  corona *= mix(0.5, 1.0, rays);

  vec3 color = mix(vec3(1.0, 0.6, 0.1), vec3(1.0, 0.9, 0.5), corona);
  float alpha = corona * uOpacity * smoothstep(0.5, 0.2, dist);

  gl_FragColor = vec4(color * 3.0, alpha);
}
```

- [ ] **Step 4: Create Sun component**

Create `src/components/canvas/Sun.tsx`:

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { sunRadiusToScene } from '../../lib/scales'
import sunVertexShader from '../../lib/shaders/sun.vert'
import sunFragmentShader from '../../lib/shaders/sun.frag'
import coronaVertexShader from '../../lib/shaders/corona.vert'
import coronaFragmentShader from '../../lib/shaders/corona.frag'

export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null)
  const coronaRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const scaleMode = useStore((s) => s.scaleMode)

  const radius = sunRadiusToScene(scaleMode)

  const sunMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: sunVertexShader,
        fragmentShader: sunFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uColor1: { value: new THREE.Color('#ff4500') },
          uColor2: { value: new THREE.Color('#ff8c00') },
          uColor3: { value: new THREE.Color('#fffacd') },
        },
      }),
    []
  )

  const coronaMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coronaVertexShader,
        fragmentShader: coronaFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0.6 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    sunMaterial.uniforms.uTime.value = t
    coronaMaterial.uniforms.uTime.value = t

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.02
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Sun sphere */}
      <mesh ref={meshRef} material={sunMaterial}>
        <sphereGeometry args={[radius, 64, 64]} />
      </mesh>

      {/* Corona glow — billboard that always faces camera */}
      <Billboard>
        <mesh ref={coronaRef} material={coronaMaterial}>
          <planeGeometry args={[radius * 6, radius * 6]} />
        </mesh>
      </Billboard>

      {/* Point light from the Sun — the sole light source */}
      <pointLight
        ref={lightRef}
        color="#fff5e6"
        intensity={3}
        distance={0}
        decay={0}
        castShadow={false}
      />
    </group>
  )
}
```

- [ ] **Step 5: Add Sun to Scene**

Update `src/components/canvas/Scene.tsx`:

```tsx
import { Skybox } from './Skybox'
import { Sun } from './Sun'

export function Scene() {
  return (
    <>
      <Skybox />
      <Sun />
    </>
  )
}
```

- [ ] **Step 6: Verify Sun renders**

```bash
npm run dev
```

Expected: A glowing, animated sun sphere at the origin with a corona glow effect. Stars visible behind it.

- [ ] **Step 7: Commit**

```bash
git add src/lib/shaders/ src/components/canvas/Sun.tsx src/components/canvas/Scene.tsx
git commit -m "feat: add Sun with volumetric glow and corona shaders"
```

---

### Task 7: Camera Controller

**Files:**
- Create: `src/components/canvas/CameraController.tsx`
- Modify: `src/components/canvas/Scene.tsx`

- [ ] **Step 1: Create camera controller with orbit + fly-to**

Create `src/components/canvas/CameraController.tsx`:

```tsx
import { useRef, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'

// Cubic bezier easing for cinematic fly-to
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function CameraController() {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()

  const cameraTarget = useStore((s) => s.cameraTarget)
  const isFlyingTo = useStore((s) => s.isFlyingTo)
  const setIsFlyingTo = useStore((s) => s.setIsFlyingTo)

  // Fly-to animation state
  const flyState = useRef({
    active: false,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    controlPoint: new THREE.Vector3(),
    progress: 0,
    duration: 2.5, // seconds
  })

  // Idle drift state
  const idleTimer = useRef(0)
  const isIdle = useRef(false)

  // Trigger fly-to when cameraTarget changes
  useEffect(() => {
    if (!cameraTarget || !isFlyingTo) return

    // We need to resolve the target position — for now, use a placeholder
    // This will be connected to the actual body positions later
    const targetPos = new THREE.Vector3(0, 0, 0) // will be replaced

    const fs = flyState.current
    fs.active = true
    fs.progress = 0
    fs.startPos.copy(camera.position)
    fs.startTarget.copy(controlsRef.current?.target || new THREE.Vector3())
    fs.endTarget.copy(targetPos)

    // End position: orbit the target at a nice distance
    const dir = new THREE.Vector3().subVectors(camera.position, targetPos).normalize()
    fs.endPos.copy(targetPos).add(dir.multiplyScalar(10))

    // Control point: arc above for a swooping path
    fs.controlPoint.lerpVectors(fs.startPos, fs.endPos, 0.5)
    fs.controlPoint.y += Math.max(
      fs.startPos.distanceTo(fs.endPos) * 0.3,
      20
    )
  }, [cameraTarget, isFlyingTo, camera])

  useFrame((_, delta) => {
    const fs = flyState.current

    if (fs.active) {
      fs.progress += delta / fs.duration
      const t = easeInOutCubic(Math.min(fs.progress, 1))

      // Quadratic bezier curve for swooping arc
      const p0 = fs.startPos
      const p1 = fs.controlPoint
      const p2 = fs.endPos

      camera.position.set(
        (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
        (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y,
        (1 - t) * (1 - t) * p0.z + 2 * (1 - t) * t * p1.z + t * t * p2.z
      )

      // Interpolate look-at target
      if (controlsRef.current) {
        const target = controlsRef.current.target
        target.lerpVectors(fs.startTarget, fs.endTarget, t)
      }

      if (fs.progress >= 1) {
        fs.active = false
        setIsFlyingTo(false)
      }

      idleTimer.current = 0
      isIdle.current = false
    } else {
      // Idle drift — subtle auto-orbit when user isn't interacting
      idleTimer.current += delta
      if (idleTimer.current > 10 && controlsRef.current) {
        isIdle.current = true
        controlsRef.current.autoRotate = true
        controlsRef.current.autoRotateSpeed = 0.15
      }
    }

    controlsRef.current?.update()
  })

  const handleInteraction = useCallback(() => {
    idleTimer.current = 0
    if (isIdle.current && controlsRef.current) {
      controlsRef.current.autoRotate = false
      isIdle.current = false
    }
  }, [])

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={0.5}
      maxDistance={5000}
      enablePan
      zoomSpeed={1.2}
      rotateSpeed={0.5}
      onStart={handleInteraction}
      makeDefault
    />
  )
}
```

- [ ] **Step 2: Add CameraController to Scene**

Update `src/components/canvas/Scene.tsx`:

```tsx
import { Skybox } from './Skybox'
import { Sun } from './Sun'
import { CameraController } from './CameraController'

export function Scene() {
  return (
    <>
      <CameraController />
      <Skybox />
      <Sun />
    </>
  )
}
```

- [ ] **Step 3: Verify orbit controls work**

```bash
npm run dev
```

Expected: Can click-drag to orbit around the Sun, scroll to zoom in/out. After 10 seconds of inactivity, camera slowly auto-rotates.

- [ ] **Step 4: Commit**

```bash
git add src/components/canvas/CameraController.tsx src/components/canvas/Scene.tsx
git commit -m "feat: add camera controller with orbit controls, fly-to, and idle drift"
```

---

### Task 8: Planet Component & Orbit Lines

**Files:**
- Create: `src/components/canvas/Planet.tsx`
- Create: `src/components/canvas/OrbitLine.tsx`
- Create: `src/components/canvas/SolarSystem.tsx`
- Modify: `src/components/canvas/Scene.tsx`

- [ ] **Step 1: Create OrbitLine component**

Create `src/components/canvas/OrbitLine.tsx`:

```tsx
import { useMemo } from 'react'
import * as THREE from 'three'
import { OrbitalElements } from '../../data/types'
import { computeOrbitPath } from '../../lib/orbital'
import { auToScene } from '../../lib/scales'
import { useStore } from '../../store/useStore'

interface OrbitLineProps {
  orbit: OrbitalElements
  color: string
  opacity?: number
}

export function OrbitLine({ orbit, color, opacity = 0.2 }: OrbitLineProps) {
  const scaleMode = useStore((s) => s.scaleMode)

  const lineGeometry = useMemo(() => {
    const orbitPoints = computeOrbitPath(orbit, 256)
    const points = orbitPoints.map(
      ([x, y, z]) =>
        new THREE.Vector3(
          auToScene(x, scaleMode),
          auToScene(z, scaleMode), // ecliptic Z → scene Y
          auToScene(y, scaleMode)  // ecliptic Y → scene Z
        )
    )
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [orbit, scaleMode])

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </line>
  )
}
```

- [ ] **Step 2: Create Planet component**

Create `src/components/canvas/Planet.tsx`:

```tsx
import { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { PlanetData } from '../../data/types'
import { useStore, CelestialTarget } from '../../store/useStore'
import { computePosition, dateToJulian } from '../../lib/orbital'
import { auToScene, radiusToScene } from '../../lib/scales'
import { OrbitLine } from './OrbitLine'

interface PlanetProps {
  data: PlanetData
}

export function Planet({ data }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  const scaleMode = useStore((s) => s.scaleMode)
  const time = useStore((s) => s.time)
  const selectObject = useStore((s) => s.selectObject)
  const flyTo = useStore((s) => s.flyTo)
  const selectedObject = useStore((s) => s.selectedObject)
  const setHoveredObject = useStore((s) => s.setHoveredObject)

  const radius = radiusToScene(data.physical.radius, scaleMode)
  const isSelected = selectedObject?.id === data.id

  const target: CelestialTarget = useMemo(
    () => ({ id: data.id, name: data.name, type: 'planet' }),
    [data.id, data.name]
  )

  // Update position each frame based on current time
  useFrame(() => {
    if (!groupRef.current) return

    const jd = dateToJulian(time.currentTime)
    const [x, y, z] = computePosition(data.orbit, jd)

    groupRef.current.position.set(
      auToScene(x, scaleMode),
      auToScene(z, scaleMode), // ecliptic Z → scene Y
      auToScene(y, scaleMode)  // ecliptic Y → scene Z
    )

    // Self-rotation
    if (meshRef.current) {
      const hours = time.currentTime.getTime() / 3600000
      const rotAngle = (hours / Math.abs(data.physical.rotationPeriod)) * Math.PI * 2
      const sign = data.physical.rotationPeriod < 0 ? -1 : 1
      meshRef.current.rotation.y = rotAngle * sign
    }
  })

  const handleClick = useCallback(
    (e: THREE.Event) => {
      e.stopPropagation()
      selectObject(target)
      flyTo(target)
    },
    [selectObject, flyTo, target]
  )

  const handlePointerOver = useCallback(
    (e: THREE.Event) => {
      e.stopPropagation()
      setHovered(true)
      setHoveredObject(data.id)
      document.body.style.cursor = 'pointer'
    },
    [setHoveredObject, data.id]
  )

  const handlePointerOut = useCallback(() => {
    setHovered(false)
    setHoveredObject(null)
    document.body.style.cursor = 'auto'
  }, [setHoveredObject])

  return (
    <>
      <OrbitLine orbit={data.orbit} color={data.color} />
      <group ref={groupRef}>
        {/* Planet sphere */}
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          rotation={[data.physical.axialTilt * (Math.PI / 180), 0, 0]}
        >
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial
            color={data.color}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Hover/selection glow */}
        {(hovered || isSelected) && (
          <mesh scale={1.05}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshBasicMaterial
              color={data.color}
              transparent
              opacity={isSelected ? 0.15 : 0.08}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Name label */}
        <Html
          position={[0, radius * 1.5, 0]}
          center
          style={{
            color: 'white',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textShadow: '0 0 8px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            opacity: hovered || isSelected ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}
        >
          {data.name}
        </Html>
      </group>
    </>
  )
}
```

- [ ] **Step 3: Create SolarSystem container**

Create `src/components/canvas/SolarSystem.tsx`:

```tsx
import { PLANETS } from '../../data/planets'
import { Planet } from './Planet'

export function SolarSystem() {
  return (
    <group>
      {PLANETS.map((planet) => (
        <Planet key={planet.id} data={planet} />
      ))}
    </group>
  )
}
```

- [ ] **Step 4: Add SolarSystem to Scene**

Update `src/components/canvas/Scene.tsx`:

```tsx
import { Skybox } from './Skybox'
import { Sun } from './Sun'
import { CameraController } from './CameraController'
import { SolarSystem } from './SolarSystem'

export function Scene() {
  return (
    <>
      <CameraController />
      <Skybox />
      <Sun />
      <SolarSystem />
    </>
  )
}
```

- [ ] **Step 5: Verify planets render with orbits**

```bash
npm run dev
```

Expected: 8 colored spheres positioned around the Sun with faint orbit lines. Planet names appear as HTML labels. Hovering shows a glow effect. Clicking a planet logs selection to Zustand.

- [ ] **Step 6: Commit**

```bash
git add src/components/canvas/
git commit -m "feat: add planets with orbital positions, orbit lines, and click/hover interaction"
```

---

### Task 9: Atmosphere Shader

**Files:**
- Create: `src/lib/shaders/atmosphere.vert`
- Create: `src/lib/shaders/atmosphere.frag`
- Create: `src/components/canvas/Atmosphere.tsx`
- Modify: `src/components/canvas/Planet.tsx`

- [ ] **Step 1: Create atmosphere vertex shader**

Create `src/lib/shaders/atmosphere.vert`:

```glsl
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
```

- [ ] **Step 2: Create atmosphere fragment shader (Rayleigh scattering)**

Create `src/lib/shaders/atmosphere.frag`:

```glsl
uniform vec3 uSunPosition;
uniform vec3 uAtmosphereColor;
uniform float uAtmosphereIntensity;
uniform float uAtmospherePower;

varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  // View direction
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  vec3 sunDir = normalize(uSunPosition - vWorldPosition);

  // Fresnel effect — atmosphere is brightest at the limb
  float fresnel = 1.0 - dot(viewDir, vNormal);
  fresnel = pow(fresnel, uAtmospherePower);

  // Sun-facing side is brighter
  float sunFacing = dot(sunDir, vNormal) * 0.5 + 0.5;
  sunFacing = pow(sunFacing, 0.8);

  // Combine
  float intensity = fresnel * uAtmosphereIntensity * sunFacing;

  // Slight color shift — bluer at edges (Rayleigh approximation)
  vec3 color = mix(uAtmosphereColor, uAtmosphereColor * vec3(0.6, 0.8, 1.2), fresnel);

  gl_FragColor = vec4(color * 1.5, intensity);
}
```

- [ ] **Step 3: Create Atmosphere component**

Create `src/components/canvas/Atmosphere.tsx`:

```tsx
import { useMemo } from 'react'
import * as THREE from 'three'
import atmosphereVertexShader from '../../lib/shaders/atmosphere.vert'
import atmosphereFragmentShader from '../../lib/shaders/atmosphere.frag'

interface AtmosphereProps {
  radius: number
  color?: string
  intensity?: number
  power?: number
}

export function Atmosphere({
  radius,
  color = '#4a90d9',
  intensity = 1.0,
  power = 3.0,
}: AtmosphereProps) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        uniforms: {
          uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
          uAtmosphereColor: { value: new THREE.Color(color) },
          uAtmosphereIntensity: { value: intensity },
          uAtmospherePower: { value: power },
        },
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [color, intensity, power]
  )

  return (
    <mesh material={material} scale={1.08}>
      <sphereGeometry args={[radius, 64, 64]} />
    </mesh>
  )
}
```

- [ ] **Step 4: Add atmosphere to planets that have one**

Update `src/components/canvas/Planet.tsx` — add the Atmosphere import and render it inside the `<group ref={groupRef}>` after the planet mesh:

```tsx
// Add import at top:
import { Atmosphere } from './Atmosphere'

// Add this inside the group, after the planet mesh and before the hover glow:
{data.atmosphere && (
  <Atmosphere
    radius={radius}
    color={
      data.id === 'earth' ? '#4a90d9' :
      data.id === 'venus' ? '#e8b86a' :
      data.id === 'mars' ? '#c47040' :
      data.id === 'jupiter' || data.id === 'saturn' ? '#c4a882' :
      data.id === 'uranus' ? '#7ec8e3' :
      data.id === 'neptune' ? '#3f54ba' :
      '#aaaaaa'
    }
    intensity={data.id === 'earth' ? 1.2 : data.id === 'venus' ? 1.5 : 0.6}
    power={data.id === 'venus' ? 2.0 : 3.0}
  />
)}
```

- [ ] **Step 5: Verify atmosphere renders**

```bash
npm run dev
```

Expected: Earth, Venus, Mars, and gas giants show a faint glowing atmosphere shell — brightest at the limb (edge), stronger on the Sun-facing side.

- [ ] **Step 6: Commit**

```bash
git add src/lib/shaders/atmosphere.* src/components/canvas/Atmosphere.tsx src/components/canvas/Planet.tsx
git commit -m "feat: add Rayleigh scattering atmosphere shader for planets"
```

---

### Task 10: Ring System

**Files:**
- Create: `src/components/canvas/Rings.tsx`
- Modify: `src/components/canvas/Planet.tsx`

- [ ] **Step 1: Create Ring component**

Create `src/components/canvas/Rings.tsx`:

```tsx
import { useMemo } from 'react'
import * as THREE from 'three'

interface RingsProps {
  innerRadius: number  // scene units (planet radius * multiplier)
  outerRadius: number
  color?: string
  opacity?: number
}

export function Rings({
  innerRadius,
  outerRadius,
  color = '#c4a882',
  opacity = 0.5,
}: RingsProps) {
  const geometry = useMemo(() => {
    const segments = 128
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, segments)

    // Fix UV mapping for rings — map to radial distance
    const pos = geo.attributes.position
    const uv = geo.attributes.uv
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const dist = Math.sqrt(x * x + y * y)
      const t = (dist - innerRadius) / (outerRadius - innerRadius)
      uv.setXY(i, t, 0.5)
    }
    uv.needsUpdate = true

    return geo
  }, [innerRadius, outerRadius])

  // Procedural ring color variation
  const ringTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 1
    const ctx = canvas.getContext('2d')!

    // Create bands of varying opacity/color like Saturn's rings
    for (let x = 0; x < 512; x++) {
      const t = x / 512
      // Cassini Division at ~0.55
      const cassini = 1 - Math.exp(-Math.pow((t - 0.55) / 0.03, 2))
      // Encke Gap at ~0.82
      const encke = 1 - Math.exp(-Math.pow((t - 0.82) / 0.01, 2))
      // General ring density
      const density = (Math.sin(t * Math.PI * 8) * 0.2 + 0.8) * cassini * encke
      // Taper at edges
      const edgeFade = Math.min(t * 5, (1 - t) * 5, 1)

      const alpha = density * edgeFade * 0.7

      // Slight color variation
      const r = Math.floor(196 + Math.sin(t * 20) * 20)
      const g = Math.floor(168 + Math.sin(t * 15 + 1) * 15)
      const b = Math.floor(130 + Math.sin(t * 12 + 2) * 10)

      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
      ctx.fillRect(x, 0, 1, 1)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.ClampToEdgeWrapping
    return tex
  }, [])

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshBasicMaterial
        map={ringTexture}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}
```

- [ ] **Step 2: Add rings to planets**

Update `src/components/canvas/Planet.tsx` — add the Rings import and render for ringed planets:

```tsx
// Add import at top:
import { Rings } from './Rings'

// Add inside the group, after atmosphere:
{data.hasRings && data.ringInnerRadius && data.ringOuterRadius && (
  <Rings
    innerRadius={radius * data.ringInnerRadius}
    outerRadius={radius * data.ringOuterRadius}
    color={data.color}
    opacity={data.id === 'saturn' ? 0.6 : 0.2}
  />
)}
```

- [ ] **Step 3: Verify rings render**

```bash
npm run dev
```

Expected: Saturn has prominent rings with the Cassini Division gap visible. Uranus, Neptune, and Jupiter have faint rings.

- [ ] **Step 4: Commit**

```bash
git add src/components/canvas/Rings.tsx src/components/canvas/Planet.tsx
git commit -m "feat: add procedural ring system with Cassini Division for Saturn"
```

---

### Task 11: Post-Processing Effects

**Files:**
- Create: `src/components/canvas/Effects.tsx`
- Modify: `src/components/canvas/Scene.tsx`

- [ ] **Step 1: Create post-processing stack**

Create `src/components/canvas/Effects.tsx`:

```tsx
import { useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  ToneMapping,
  Vignette,
  Noise,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'

export function Effects() {
  const quality = useStore((s) => s.quality)

  // Skip heavy effects on low quality
  if (quality === 'low') {
    return (
      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.5}
          mipmapBlur
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={0}>
      {/* Bloom — aggressive on sun, subtle elsewhere */}
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.6}
        mipmapBlur
        radius={0.8}
      />

      {/* ACES Filmic tone mapping — cinematic color science */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

      {/* Chromatic aberration — subtle edge-of-lens effect */}
      {quality === 'high' && (
        <ChromaticAberration
          offset={new THREE.Vector2(0.0008, 0.0008)}
          radialModulation
          modulationOffset={0.5}
          blendFunction={BlendFunction.NORMAL}
        />
      )}

      {/* Film grain — barely perceptible */}
      {quality === 'high' && (
        <Noise
          premultiply
          blendFunction={BlendFunction.SOFT_LIGHT}
          opacity={0.15}
        />
      )}

      {/* Vignette — focus the eye */}
      <Vignette
        offset={0.3}
        darkness={0.6}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
```

- [ ] **Step 2: Add Effects to Scene**

Update `src/components/canvas/Scene.tsx`:

```tsx
import { Skybox } from './Skybox'
import { Sun } from './Sun'
import { CameraController } from './CameraController'
import { SolarSystem } from './SolarSystem'
import { Effects } from './Effects'

export function Scene() {
  return (
    <>
      <CameraController />
      <Skybox />
      <Sun />
      <SolarSystem />
      <Effects />
    </>
  )
}
```

- [ ] **Step 3: Verify cinematic post-processing**

```bash
npm run dev
```

Expected: The Sun blooms dramatically. Overall image has ACES filmic color grading — deeper blacks, richer highlights. Subtle vignette around edges. Very slight film grain on close inspection.

- [ ] **Step 4: Commit**

```bash
git add src/components/canvas/Effects.tsx src/components/canvas/Scene.tsx
git commit -m "feat: add cinematic post-processing (bloom, ACES tone mapping, vignette, grain)"
```

---

### Task 12: Time System Integration

**Files:**
- Modify: `src/store/useStore.ts`
- Create: `src/lib/useTimeLoop.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create time loop hook**

Create `src/lib/useTimeLoop.ts`:

```typescript
import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'

/**
 * Advances the simulation time based on playback speed.
 * Runs outside of R3F's frame loop since it's pure state.
 */
export function useTimeLoop() {
  const time = useStore((s) => s.time)
  const setTime = useStore((s) => s.setTime)
  const lastFrameTime = useRef(performance.now())

  useEffect(() => {
    if (!time.isPlaying) return

    let raf: number
    const tick = () => {
      const now = performance.now()
      const deltaSec = (now - lastFrameTime.current) / 1000
      lastFrameTime.current = now

      const msAdvance = deltaSec * time.playbackSpeed * 1000
      const newTime = new Date(time.currentTime.getTime() + msAdvance)

      // Clamp to 1900-2100 range
      const minTime = new Date(1900, 0, 1)
      const maxTime = new Date(2100, 11, 31)
      if (newTime >= minTime && newTime <= maxTime) {
        setTime(newTime)
      }

      raf = requestAnimationFrame(tick)
    }

    lastFrameTime.current = performance.now()
    raf = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(raf)
  }, [time.isPlaying, time.playbackSpeed, time.currentTime, setTime])
}
```

- [ ] **Step 2: Wire time loop into App**

Update `src/App.tsx` — add the hook call inside the component:

```tsx
import { useTimeLoop } from './lib/useTimeLoop'

// Inside the App component, before the return:
useTimeLoop()
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/useTimeLoop.ts src/App.tsx
git commit -m "feat: add time simulation loop with playback speed support"
```

---

## Phase 4: UI Layer

### Task 13: Top Bar (Logo, Search, Scale Toggle)

**Files:**
- Create: `src/components/ui/TopBar.tsx`
- Create: `src/components/ui/SearchBar.tsx`
- Create: `src/components/ui/ScaleToggle.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create SearchBar**

Create `src/components/ui/SearchBar.tsx`:

```tsx
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import Fuse from 'fuse.js'
import { PLANETS } from '../../data/planets'
import { DWARF_PLANETS } from '../../data/dwarfPlanets'
import { MOONS } from '../../data/moons'
import { useStore, CelestialTarget } from '../../store/useStore'
import { SearchableObject } from '../../data/types'

const allObjects: SearchableObject[] = [
  { id: 'sun', name: 'Sun', type: 'star' },
  ...PLANETS.map((p) => ({ id: p.id, name: p.name, type: 'planet' as const })),
  ...DWARF_PLANETS.map((d) => ({ id: d.id, name: d.name, type: 'dwarf-planet' as const })),
  ...MOONS.map((m) => ({
    id: m.id,
    name: m.name,
    type: 'moon' as const,
    parentId: m.parentId,
    parentName: PLANETS.find((p) => p.id === m.parentId)?.name || m.parentId,
  })),
]

const fuse = new Fuse(allObjects, {
  keys: ['name'],
  threshold: 0.3,
  minMatchCharLength: 1,
})

export function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const selectObject = useStore((s) => s.selectObject)
  const flyTo = useStore((s) => s.flyTo)

  const results = useMemo(() => {
    if (!query.trim()) return []
    return fuse.search(query).slice(0, 8)
  }, [query])

  const handleSelect = useCallback(
    (obj: SearchableObject) => {
      const target: CelestialTarget = {
        id: obj.id,
        name: obj.name,
        type: obj.type,
        parentId: obj.parentId,
      }
      selectObject(target)
      flyTo(target)
      setQuery('')
      setOpen(false)
    },
    [selectObject, flyTo]
  )

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === '/' && !open) {
        e.preventDefault()
        setOpen(true)
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: '8px 16px',
          cursor: 'text',
          transition: 'border-color 0.2s',
          borderColor: open ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
        }}
        onClick={() => {
          setOpen(true)
          inputRef.current?.focus()
        }}
      >
        <span style={{ opacity: 0.4, fontSize: 14 }}>&#128269;</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search planets, moons, asteroids..."
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#e0e0e0',
            fontSize: 13,
          }}
        />
        {!open && (
          <span
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 4,
              padding: '1px 5px',
            }}
          >
            /
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'rgba(10,10,30,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            overflow: 'hidden',
            zIndex: 100,
          }}
        >
          {results.map(({ item }) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, minWidth: 55 }}>
                {item.type}
              </span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</span>
              {item.parentName && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
                  {item.parentName}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create ScaleToggle**

Create `src/components/ui/ScaleToggle.tsx`:

```tsx
import { useStore } from '../../store/useStore'

export function ScaleToggle() {
  const scaleMode = useStore((s) => s.scaleMode)
  const toggleScaleMode = useStore((s) => s.toggleScaleMode)

  return (
    <button
      onClick={toggleScaleMode}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: '6px 12px',
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
        e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
      }}
    >
      {scaleMode === 'compressed' ? 'Compressed' : 'Realistic'}
    </button>
  )
}
```

- [ ] **Step 3: Create TopBar**

Create `src/components/ui/TopBar.tsx`:

```tsx
import { SearchBar } from './SearchBar'
import { ScaleToggle } from './ScaleToggle'

export function TopBar() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '16px 24px',
        zIndex: 10,
        pointerEvents: 'none',
        background: 'linear-gradient(rgba(0,0,0,0.4) 0%, transparent 100%)',
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 4,
          color: '#fff',
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        ASTRA
      </div>
      <div style={{ marginLeft: 24, pointerEvents: 'auto', flex: 1, maxWidth: 400 }}>
        <SearchBar />
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center', pointerEvents: 'auto' }}>
        <ScaleToggle />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Add TopBar to App**

Update `src/App.tsx` — add TopBar after the Canvas:

```tsx
import { TopBar } from './components/ui/TopBar'

// After the closing </Canvas> tag:
<TopBar />
```

- [ ] **Step 5: Verify UI renders**

```bash
npm run dev
```

Expected: "ASTRA" logo in top left, search bar in middle, scale toggle on right. Search autocompletes planet/moon names. Scale toggle switches between modes and planets reposition.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add top bar with fuzzy search and scale mode toggle"
```

---

### Task 14: Time Slider

**Files:**
- Create: `src/components/ui/TimeSlider.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create TimeSlider**

Create `src/components/ui/TimeSlider.tsx`:

```tsx
import { useCallback, useMemo } from 'react'
import { useStore } from '../../store/useStore'

const MIN_YEAR = 1900
const MAX_YEAR = 2100
const MIN_TIME = new Date(MIN_YEAR, 0, 1).getTime()
const MAX_TIME = new Date(MAX_YEAR, 11, 31).getTime()

const SPEED_LABELS: Record<number, string> = {
  1: '1x',
  86400: '1 day/s',
  2592000: '1 mo/s',
  31557600: '1 yr/s',
  [-1]: '-1x',
  [-86400]: '-1 day/s',
  [-2592000]: '-1 mo/s',
  [-31557600]: '-1 yr/s',
}

export function TimeSlider() {
  const time = useStore((s) => s.time)
  const setTime = useStore((s) => s.setTime)
  const togglePlay = useStore((s) => s.togglePlay)
  const setPlaybackSpeed = useStore((s) => s.setPlaybackSpeed)

  const progress = useMemo(() => {
    return (time.currentTime.getTime() - MIN_TIME) / (MAX_TIME - MIN_TIME)
  }, [time.currentTime])

  const dateStr = useMemo(() => {
    return time.currentTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }, [time.currentTime])

  const speedLabel = SPEED_LABELS[time.playbackSpeed] || `${time.playbackSpeed}x`

  const handleScrub = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const t = parseFloat(e.target.value)
      const ms = MIN_TIME + t * (MAX_TIME - MIN_TIME)
      setTime(new Date(ms))
    },
    [setTime]
  )

  const handleRewind = useCallback(() => {
    setPlaybackSpeed(-Math.abs(time.playbackSpeed))
    if (!time.isPlaying) togglePlay()
  }, [time.playbackSpeed, time.isPlaying, setPlaybackSpeed, togglePlay])

  const handleFastForward = useCallback(() => {
    setPlaybackSpeed(Math.abs(time.playbackSpeed))
    if (!time.isPlaying) togglePlay()
  }, [time.playbackSpeed, time.isPlaying, setPlaybackSpeed, togglePlay])

  const cycleSpeed = useCallback(() => {
    const presets = time.speedPresets
    const absSpeed = Math.abs(time.playbackSpeed)
    const idx = presets.indexOf(absSpeed)
    const nextIdx = (idx + 1) % presets.length
    const sign = time.playbackSpeed < 0 ? -1 : 1
    setPlaybackSpeed(presets[nextIdx] * sign)
  }, [time.playbackSpeed, time.speedPresets, setPlaybackSpeed])

  const btnStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    transition: 'background 0.15s',
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 24px 20px',
        zIndex: 10,
        pointerEvents: 'none',
        background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.5) 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          pointerEvents: 'auto',
        }}
      >
        {/* Transport controls */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button style={btnStyle} onClick={handleRewind} title="Rewind">
            &#9194;
          </button>
          <button
            style={{ ...btnStyle, width: 36, height: 36, fontSize: 14 }}
            onClick={togglePlay}
            title={time.isPlaying ? 'Pause' : 'Play'}
          >
            {time.isPlaying ? '\u23F8' : '\u25B6'}
          </button>
          <button style={btnStyle} onClick={handleFastForward} title="Fast Forward">
            &#9193;
          </button>
        </div>

        {/* Scrub bar */}
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.0001}
            value={progress}
            onChange={handleScrub}
            style={{
              width: '100%',
              height: 3,
              appearance: 'none',
              background: `linear-gradient(to right, #4a90d9 ${progress * 100}%, rgba(255,255,255,0.1) ${progress * 100}%)`,
              borderRadius: 2,
              cursor: 'pointer',
              outline: 'none',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 6,
              fontSize: 10,
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            <span>1900</span>
            <span>1950</span>
            <span>2000</span>
            <span>2050</span>
            <span>2100</span>
          </div>
        </div>

        {/* Date + speed */}
        <div style={{ minWidth: 160, textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
            {dateStr}
          </div>
          <button
            onClick={cycleSpeed}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 11,
              cursor: 'pointer',
              padding: 0,
              marginTop: 2,
            }}
            title="Click to cycle speed"
          >
            {speedLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add TimeSlider to App**

Update `src/App.tsx` — add TimeSlider after TopBar:

```tsx
import { TimeSlider } from './components/ui/TimeSlider'

// After <TopBar />:
<TimeSlider />
```

- [ ] **Step 3: Verify time controls**

```bash
npm run dev
```

Expected: Time slider at bottom with play/pause, rewind, fast-forward. Pressing play makes planets orbit. Scrubbing moves planets to that date. Speed cycles through presets.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/TimeSlider.tsx src/App.tsx
git commit -m "feat: add time slider with playback controls and speed cycling"
```

---

### Task 15: Data Panel Shell

**Files:**
- Create: `src/components/ui/DataPanel.tsx`
- Create: `src/components/ui/panels/PlanetPanel.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create DataPanel container**

Create `src/components/ui/DataPanel.tsx`:

```tsx
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { PlanetPanel } from './panels/PlanetPanel'

export function DataPanel() {
  const selectedObject = useStore((s) => s.selectedObject)
  const panelOpen = useStore((s) => s.panelOpen)
  const selectObject = useStore((s) => s.selectObject)

  return (
    <AnimatePresence>
      {panelOpen && selectedObject && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 380,
            background: 'rgba(8,8,24,0.92)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            overflowY: 'auto',
            zIndex: 20,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '24px 20px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  color: '#4a90d9',
                  marginBottom: 4,
                }}
              >
                {selectedObject.type.replace('-', ' ')}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{selectedObject.name}</div>
            </div>
            <button
              onClick={() => selectObject(null)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              &#10005;
            </button>
          </div>

          {/* Panel content by type */}
          {selectedObject.type === 'planet' && (
            <PlanetPanel id={selectedObject.id} />
          )}
          {selectedObject.type === 'star' && (
            <div style={{ padding: 20, color: 'rgba(255,255,255,0.5)' }}>Sun panel (coming soon)</div>
          )}
          {selectedObject.type === 'moon' && (
            <div style={{ padding: 20, color: 'rgba(255,255,255,0.5)' }}>Moon panel (coming soon)</div>
          )}
          {selectedObject.type === 'dwarf-planet' && (
            <div style={{ padding: 20, color: 'rgba(255,255,255,0.5)' }}>Dwarf planet panel (coming soon)</div>
          )}
          {selectedObject.type === 'asteroid' && (
            <div style={{ padding: 20, color: 'rgba(255,255,255,0.5)' }}>Asteroid panel (coming soon)</div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Create PlanetPanel**

Create `src/components/ui/panels/PlanetPanel.tsx`:

```tsx
import { PLANET_MAP } from '../../../data/planets'
import { MOONS_BY_PARENT } from '../../../data/moons'
import { useStore, CelestialTarget } from '../../../store/useStore'

interface StatProps {
  label: string
  value: string
}

function Stat({ label, value }: StatProps) {
  return (
    <div>
      <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  )
}

export function PlanetPanel({ id }: { id: string }) {
  const planet = PLANET_MAP.get(id)
  const moons = MOONS_BY_PARENT.get(id) || []
  const selectObject = useStore((s) => s.selectObject)
  const flyTo = useStore((s) => s.flyTo)

  if (!planet) return null

  const { physical: p, atmosphere: atm } = planet

  const formatNum = (n: number) => {
    if (n >= 1e24) return `${(n / 1e24).toFixed(2)} × 10²⁴ kg`
    if (n >= 1e23) return `${(n / 1e23).toFixed(2)} × 10²³ kg`
    if (n >= 1e27) return `${(n / 1e27).toFixed(2)} × 10²⁷ kg`
    if (n >= 1e26) return `${(n / 1e26).toFixed(2)} × 10²⁶ kg`
    if (n >= 1e25) return `${(n / 1e25).toFixed(2)} × 10²⁵ kg`
    return `${n.toExponential(2)} kg`
  }

  const handleMoonClick = (moonId: string, moonName: string) => {
    const target: CelestialTarget = { id: moonId, name: moonName, type: 'moon', parentId: id }
    selectObject(target)
    flyTo(target)
  }

  return (
    <div>
      {/* Stats grid */}
      <div
        style={{
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Stat label="Diameter" value={`${(p.radius * 2).toLocaleString()} km`} />
        <Stat label="Mass" value={formatNum(p.mass)} />
        <Stat label="Gravity" value={`${p.gravity} m/s²`} />
        <Stat label="Temperature" value={
          p.minTemperature !== undefined && p.maxTemperature !== undefined
            ? `${p.minTemperature}° to ${p.maxTemperature}°C`
            : `${p.meanTemperature}°C`
        } />
        <Stat label="Day Length" value={
          Math.abs(p.rotationPeriod) < 48
            ? `${Math.abs(p.rotationPeriod).toFixed(1)}h`
            : `${(Math.abs(p.rotationPeriod) / 24).toFixed(1)} days`
        } />
        <Stat label="Year Length" value={
          planet.orbit.period < 2
            ? `${(planet.orbit.period * 365.25).toFixed(1)} days`
            : `${planet.orbit.period.toFixed(1)} years`
        } />
      </div>

      {/* Description */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
          {planet.description}
        </p>
      </div>

      {/* Orbital parameters */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Orbital Parameters</div>
        {[
          ['Semi-major axis', `${planet.orbit.semiMajorAxis.toFixed(3)} AU`],
          ['Eccentricity', planet.orbit.eccentricity.toFixed(4)],
          ['Inclination', `${planet.orbit.inclination.toFixed(3)}°`],
          ['Axial tilt', `${p.axialTilt.toFixed(2)}°`],
          ['Escape velocity', `${p.escapeVelocity} km/s`],
          ['Density', `${p.density} g/cm³`],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}
          >
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>

      {/* Atmosphere */}
      {atm && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Atmosphere</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {atm.composition.map(({ molecule, percentage }) => (
              <span
                key={molecule}
                style={{
                  background: 'rgba(74,144,217,0.12)',
                  border: '1px solid rgba(74,144,217,0.25)',
                  borderRadius: 12,
                  padding: '3px 10px',
                  fontSize: 11,
                }}
              >
                {molecule} {percentage}%
              </span>
            ))}
          </div>
          {atm.surfacePressure !== undefined && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
              Surface pressure: {atm.surfacePressure} atm
            </div>
          )}
        </div>
      )}

      {/* Moons */}
      {moons.length > 0 && (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
            Moons ({moons.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {moons.map((moon) => (
              <button
                key={moon.id}
                onClick={() => handleMoonClick(moon.id, moon.name)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#e0e0e0',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                  fontSize: 13,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              >
                <span style={{ fontWeight: 500 }}>{moon.name}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                  {moon.physical.radius > 100 ? `${moon.physical.radius.toLocaleString()} km` : `${moon.physical.radius} km`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Add DataPanel to App**

Update `src/App.tsx` — add DataPanel:

```tsx
import { DataPanel } from './components/ui/DataPanel'

// After <TimeSlider />:
<DataPanel />
```

- [ ] **Step 4: Verify panel opens on planet click**

```bash
npm run dev
```

Expected: Clicking a planet opens a slide-in panel from the right with all the planet's stats, orbital parameters, atmosphere composition, and moons list. Close button dismisses it. Spring animation on open/close.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/DataPanel.tsx src/components/ui/panels/ src/App.tsx
git commit -m "feat: add data panel with planet stats, atmosphere, orbital params, and moons"
```

---

## Phase 5: API Integration

### Task 16: Serverless API Proxy + Cache

**Files:**
- Create: `api/_lib/cache.ts`
- Create: `api/_lib/nasa.ts`
- Create: `api/apod.ts`
- Create: `src/api/types.ts`
- Create: `src/api/hooks.ts`

- [ ] **Step 1: Create cache helper**

Create `api/_lib/cache.ts`:

```typescript
import { kv } from '@vercel/kv'

interface CacheOptions {
  ttlSeconds: number
}

/**
 * Fetch with KV cache. Falls back to direct fetch if KV is unavailable
 * (e.g., local dev without KV configured).
 */
export async function cachedFetch(
  url: string,
  cacheKey: string,
  options: CacheOptions
): Promise<unknown> {
  // Try cache first
  try {
    const cached = await kv.get(cacheKey)
    if (cached) return cached
  } catch {
    // KV not available — proceed to direct fetch
  }

  // Fetch from source
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`NASA API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()

  // Store in cache
  try {
    await kv.set(cacheKey, data, { ex: options.ttlSeconds })
  } catch {
    // KV not available — that's OK
  }

  return data
}
```

- [ ] **Step 2: Create NASA API helper**

Create `api/_lib/nasa.ts`:

```typescript
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY'
const NASA_BASE = 'https://api.nasa.gov'

export function nasaUrl(path: string, params: Record<string, string> = {}): string {
  const url = new URL(`${NASA_BASE}${path}`)
  url.searchParams.set('api_key', NASA_API_KEY)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  return url.toString()
}
```

- [ ] **Step 3: Create APOD endpoint**

Create `api/apod.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cachedFetch } from './_lib/cache'
import { nasaUrl } from './_lib/nasa'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { date, count } = req.query

    const params: Record<string, string> = {}
    if (typeof date === 'string') params.date = date
    if (typeof count === 'string') params.count = count

    const url = nasaUrl('/planetary/apod', params)
    const cacheKey = `apod:${date || 'today'}:${count || ''}`

    const data = await cachedFetch(url, cacheKey, { ttlSeconds: 86400 })

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
```

- [ ] **Step 4: Create frontend API types**

Create `src/api/types.ts`:

```typescript
export interface APODData {
  date: string
  title: string
  explanation: string
  url: string
  hdurl?: string
  media_type: 'image' | 'video'
  copyright?: string
}

export interface NEOData {
  id: string
  name: string
  nasa_jpl_url: string
  absolute_magnitude_h: number
  estimated_diameter: {
    kilometers: { estimated_diameter_min: number; estimated_diameter_max: number }
  }
  is_potentially_hazardous_asteroid: boolean
  close_approach_data: CloseApproach[]
  orbital_data?: {
    orbit_id: string
    semi_major_axis: string
    eccentricity: string
    inclination: string
    ascending_node_longitude: string
    perihelion_argument: string
    mean_anomaly: string
    epoch_osculation: string
    orbital_period: string
  }
}

export interface CloseApproach {
  close_approach_date: string
  relative_velocity: { kilometers_per_hour: string }
  miss_distance: { kilometers: string; lunar: string }
  orbiting_body: string
}

export interface MarsRoverPhoto {
  id: number
  sol: number
  img_src: string
  earth_date: string
  camera: { name: string; full_name: string }
  rover: { name: string; status: string; landing_date: string; launch_date: string }
}

export interface EPICImage {
  identifier: string
  date: string
  caption: string
  image: string
  coords: { centroid_coordinates: { lat: number; lon: number } }
}

export interface DONKIEvent {
  messageType: string
  messageID: string
  messageURL: string
  messageIssueTime: string
  messageBody: string
}

export interface DONKICME {
  activityID: string
  startTime: string
  sourceLocation: string
  note: string
  instruments: { displayName: string }[]
}

export interface DONKIFlare {
  flrID: string
  beginTime: string
  peakTime: string
  endTime: string
  classType: string
  sourceLocation: string
}

export interface EONETEvent {
  id: string
  title: string
  description: string
  categories: { id: string; title: string }[]
  sources: { id: string; url: string }[]
  geometry: { date: string; type: string; coordinates: [number, number] }[]
}
```

- [ ] **Step 5: Create TanStack Query hooks**

Create `src/api/hooks.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import type {
  APODData,
  MarsRoverPhoto,
  EPICImage,
  DONKICME,
  DONKIFlare,
  EONETEvent,
  NEOData,
} from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

async function fetchApi<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${window.location.origin}${API_BASE}${path}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// --- APOD ---
export function useAPOD() {
  return useQuery({
    queryKey: ['apod'],
    queryFn: () => fetchApi<APODData>('/apod'),
    staleTime: 24 * 60 * 60 * 1000,
  })
}

// --- Mars Rover Photos ---
export function useMarsRoverPhotos(rover: string, sol?: number) {
  return useQuery({
    queryKey: ['mars-rover', rover, sol],
    queryFn: () =>
      fetchApi<{ photos: MarsRoverPhoto[] }>('/mars-rover', {
        rover,
        ...(sol !== undefined ? { sol: String(sol) } : {}),
      }),
    staleTime: 6 * 60 * 60 * 1000,
    select: (data) => data.photos,
  })
}

// --- NEO ---
export function useNEOFeed() {
  return useQuery({
    queryKey: ['neo-feed'],
    queryFn: () => fetchApi<{ near_earth_objects: Record<string, NEOData[]> }>('/neo'),
    staleTime: 60 * 60 * 1000,
  })
}

// --- EPIC ---
export function useEPIC() {
  return useQuery({
    queryKey: ['epic'],
    queryFn: () => fetchApi<EPICImage[]>('/epic'),
    staleTime: 6 * 60 * 60 * 1000,
  })
}

// --- DONKI (Space Weather) ---
export function useDONKICMEs() {
  return useQuery({
    queryKey: ['donki-cme'],
    queryFn: () => fetchApi<DONKICME[]>('/donki', { type: 'CME' }),
    staleTime: 30 * 60 * 1000,
  })
}

export function useDONKIFlares() {
  return useQuery({
    queryKey: ['donki-flr'],
    queryFn: () => fetchApi<DONKIFlare[]>('/donki', { type: 'FLR' }),
    staleTime: 30 * 60 * 1000,
  })
}

// --- EONET ---
export function useEONET() {
  return useQuery({
    queryKey: ['eonet'],
    queryFn: () => fetchApi<{ events: EONETEvent[] }>('/eonet'),
    staleTime: 60 * 60 * 1000,
    select: (data) => data.events,
  })
}
```

- [ ] **Step 6: Commit**

```bash
git add api/ src/api/
git commit -m "feat: add serverless API proxy with caching and TanStack Query hooks"
```

---

### Task 17: Remaining Serverless Endpoints

**Files:**
- Create: `api/neo.ts`
- Create: `api/epic.ts`
- Create: `api/donki.ts`
- Create: `api/mars-rover.ts`
- Create: `api/eonet.ts`
- Create: `api/nasa-images.ts`

- [ ] **Step 1: Create NEO endpoint**

Create `api/neo.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cachedFetch } from './_lib/cache'
import { nasaUrl } from './_lib/nasa'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const endDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

    const url = nasaUrl('/neo/rest/v1/feed', {
      start_date: today,
      end_date: endDate,
    })
    const cacheKey = `neo:${today}`
    const data = await cachedFetch(url, cacheKey, { ttlSeconds: 3600 })

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
```

- [ ] **Step 2: Create EPIC endpoint**

Create `api/epic.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cachedFetch } from './_lib/cache'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY'
    const url = `https://api.nasa.gov/EPIC/api/natural?api_key=${NASA_API_KEY}`
    const data = await cachedFetch(url, 'epic:natural', { ttlSeconds: 21600 })

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=21600')
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
```

- [ ] **Step 3: Create DONKI endpoint**

Create `api/donki.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cachedFetch } from './_lib/cache'
import { nasaUrl } from './_lib/nasa'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const type = (req.query.type as string) || 'CME'
    const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

    const typeMap: Record<string, string> = {
      CME: '/DONKI/CME',
      FLR: '/DONKI/FLR',
      GST: '/DONKI/GST',
      SEP: '/DONKI/SEP',
      IPS: '/DONKI/IPS',
    }

    const path = typeMap[type] || '/DONKI/CME'
    const url = nasaUrl(path, { startDate })
    const cacheKey = `donki:${type}:${startDate}`
    const data = await cachedFetch(url, cacheKey, { ttlSeconds: 1800 })

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800')
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
```

- [ ] **Step 4: Create Mars Rover endpoint**

Create `api/mars-rover.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cachedFetch } from './_lib/cache'
import { nasaUrl } from './_lib/nasa'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const rover = (req.query.rover as string) || 'curiosity'
    const sol = req.query.sol as string

    const params: Record<string, string> = { page: '1' }
    if (sol) {
      params.sol = sol
    } else {
      // Get latest photos
      params.sol = '1000' // fallback, will be updated
    }

    const url = nasaUrl(`/mars-photos/api/v1/rovers/${rover}/photos`, params)
    const cacheKey = `mars-rover:${rover}:${sol || 'latest'}`
    const data = await cachedFetch(url, cacheKey, { ttlSeconds: 21600 })

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=21600')
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
```

- [ ] **Step 5: Create EONET endpoint**

Create `api/eonet.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cachedFetch } from './_lib/cache'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50'
    const data = await cachedFetch(url, 'eonet:open', { ttlSeconds: 3600 })

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
```

- [ ] **Step 6: Create NASA Image Library endpoint**

Create `api/nasa-images.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cachedFetch } from './_lib/cache'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const q = (req.query.q as string) || ''
    if (!q) {
      res.status(400).json({ error: 'Query parameter q is required' })
      return
    }

    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page_size=20`
    const cacheKey = `nasa-images:${q}`
    const data = await cachedFetch(url, cacheKey, { ttlSeconds: 86400 })

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add api/
git commit -m "feat: add serverless endpoints for NEO, EPIC, DONKI, Mars Rover, EONET, NASA Images"
```

---

### Task 18: APOD Card

**Files:**
- Create: `src/components/ui/APODCard.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create APOD card**

Create `src/components/ui/APODCard.tsx`:

```tsx
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAPOD } from '../../api/hooks'

export function APODCard() {
  const { data: apod, isLoading } = useAPOD()
  const [expanded, setExpanded] = useState(false)

  if (isLoading || !apod) return null

  return (
    <>
      {/* Mini card */}
      <motion.div
        onClick={() => setExpanded(true)}
        style={{
          position: 'absolute',
          bottom: 80,
          left: 24,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: 10,
          width: 220,
          cursor: 'pointer',
          zIndex: 10,
          pointerEvents: 'auto',
        }}
        whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.15)' }}
      >
        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          Photo of the Day
        </div>
        {apod.media_type === 'image' && (
          <img
            src={apod.url}
            alt={apod.title}
            style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 6, marginBottom: 6 }}
          />
        )}
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {apod.title}
        </div>
      </motion.div>

      {/* Expanded overlay */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 40,
              cursor: 'pointer',
            }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ maxWidth: 800, width: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, color: '#4a90d9', marginBottom: 8 }}>
                Astronomy Picture of the Day — {apod.date}
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{apod.title}</h2>
              {apod.media_type === 'image' && (
                <img
                  src={apod.hdurl || apod.url}
                  alt={apod.title}
                  style={{ width: '100%', borderRadius: 12, marginBottom: 16 }}
                />
              )}
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)' }}>
                {apod.explanation}
              </p>
              {apod.copyright && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 12 }}>
                  &copy; {apod.copyright}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

- [ ] **Step 2: Add APODCard to App**

Update `src/App.tsx` — add after TimeSlider, wrap in a div with pointer-events:

```tsx
import { APODCard } from './components/ui/APODCard'

// After <DataPanel />:
<APODCard />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/APODCard.tsx src/App.tsx
git commit -m "feat: add APOD card with expandable overlay"
```

---

### Task 19: Special Planet Panels (Earth, Mars, Sun)

**Files:**
- Create: `src/components/ui/panels/EarthPanel.tsx`
- Create: `src/components/ui/panels/MarsPanel.tsx`
- Create: `src/components/ui/panels/SunPanel.tsx`
- Modify: `src/components/ui/DataPanel.tsx`

- [ ] **Step 1: Create Earth panel with EPIC + EONET**

Create `src/components/ui/panels/EarthPanel.tsx`:

```tsx
import { PLANET_MAP } from '../../../data/planets'
import { useEPIC, useEONET } from '../../../api/hooks'
import { PlanetPanel } from './PlanetPanel'

const CATEGORY_COLORS: Record<string, string> = {
  wildfires: '#ff4444',
  volcanoes: '#ff6600',
  severeStorms: '#ffaa00',
  floods: '#4a90d9',
  seaLakeIce: '#7ec8e3',
  earthquakes: '#c45050',
  drought: '#cc8833',
  snow: '#ffffff',
  landslides: '#8b6914',
}

export function EarthPanel() {
  const { data: epicImages } = useEPIC()
  const { data: events } = useEONET()

  return (
    <div>
      {/* Base planet panel */}
      <PlanetPanel id="earth" />

      {/* EPIC satellite images */}
      {epicImages && epicImages.length > 0 && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
            Latest Satellite Image
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
            From DSCOVR/EPIC at L1 point
          </div>
          {(() => {
            const img = epicImages[0]
            const date = img.date.split(' ')[0].replace(/-/g, '/')
            const imgUrl = `https://epic.gsfc.nasa.gov/archive/natural/${date}/png/${img.image}.png`
            return (
              <div>
                <img
                  src={imgUrl}
                  alt={img.caption}
                  style={{ width: '100%', borderRadius: 8, marginBottom: 6 }}
                  loading="lazy"
                />
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                  {new Date(img.date).toLocaleString()}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* EONET Natural Events */}
      {events && events.length > 0 && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
            Active Natural Events ({events.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {events.slice(0, 10).map((event) => {
              const category = event.categories[0]?.id || 'unknown'
              const color = CATEGORY_COLORS[category] || '#888'
              return (
                <div
                  key={event.id}
                  style={{
                    background: `${color}10`,
                    border: `1px solid ${color}30`,
                    borderRadius: 8,
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500 }}>{event.title}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                      {event.categories[0]?.title}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create Mars panel with rover photos**

Create `src/components/ui/panels/MarsPanel.tsx`:

```tsx
import { useState } from 'react'
import { useMarsRoverPhotos } from '../../../api/hooks'
import { PlanetPanel } from './PlanetPanel'

const ROVERS = ['curiosity', 'perseverance']

export function MarsPanel() {
  const [activeRover, setActiveRover] = useState('curiosity')
  const { data: photos, isLoading } = useMarsRoverPhotos(activeRover)

  return (
    <div>
      <PlanetPanel id="mars" />

      {/* Rover Photos */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
          Mars Rover Photos
        </div>

        {/* Rover selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {ROVERS.map((rover) => (
            <button
              key={rover}
              onClick={() => setActiveRover(rover)}
              style={{
                padding: '6px 14px',
                borderRadius: 16,
                border: 'none',
                background: activeRover === rover ? 'rgba(193,68,14,0.3)' : 'rgba(255,255,255,0.06)',
                color: activeRover === rover ? '#ff8c5a' : 'rgba(255,255,255,0.5)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {rover}
            </button>
          ))}
        </div>

        {isLoading && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', padding: 20, textAlign: 'center' }}>
            Loading photos...
          </div>
        )}

        {photos && photos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {photos.slice(0, 6).map((photo) => (
              <a
                key={photo.id}
                href={photo.img_src}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block' }}
              >
                <img
                  src={photo.img_src}
                  alt={`${photo.rover.name} - ${photo.camera.full_name}`}
                  style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }}
                  loading="lazy"
                />
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                  {photo.camera.name} · Sol {photo.sol}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create Sun panel with space weather**

Create `src/components/ui/panels/SunPanel.tsx`:

```tsx
import { useDONKICMEs, useDONKIFlares } from '../../../api/hooks'

export function SunPanel() {
  const { data: cmes } = useDONKICMEs()
  const { data: flares } = useDONKIFlares()

  return (
    <div>
      {/* Sun stats */}
      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Diameter</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>1,391,000 km</div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Mass</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>1.989 × 10³⁰ kg</div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Surface Temp</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>5,778 K</div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Core Temp</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>~15.7M K</div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Spectral Type</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>G2V</div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Age</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>4.6 billion yrs</div>
        </div>
      </div>

      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
          A G-type main-sequence star at the center of our solar system. It contains 99.86% of the solar system's total mass and provides the energy that sustains nearly all life on Earth.
        </p>
      </div>

      {/* Recent CMEs */}
      {cmes && cmes.length > 0 && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
            Recent Coronal Mass Ejections
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cmes.slice(-5).reverse().map((cme) => (
              <div
                key={cme.activityID}
                style={{
                  background: 'rgba(255,136,0,0.08)',
                  border: '1px solid rgba(255,136,0,0.15)',
                  borderRadius: 8,
                  padding: '8px 10px',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 500 }}>
                  {new Date(cme.startTime).toLocaleDateString()} — {cme.sourceLocation || 'Unknown location'}
                </div>
                {cme.note && (
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, lineHeight: 1.4 }}>
                    {cme.note.slice(0, 150)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Flares */}
      {flares && flares.length > 0 && (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
            Recent Solar Flares
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {flares.slice(-8).reverse().map((flare) => {
              const classColor =
                flare.classType.startsWith('X') ? '#ff4444' :
                flare.classType.startsWith('M') ? '#ff8800' :
                '#ffcc00'
              return (
                <div
                  key={flare.flrID}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, padding: '4px 0' }}
                >
                  <span
                    style={{
                      background: `${classColor}20`,
                      color: classColor,
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: 11,
                      minWidth: 36,
                      textAlign: 'center',
                    }}
                  >
                    {flare.classType}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {new Date(flare.beginTime).toLocaleDateString()}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                    {flare.sourceLocation}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Wire special panels into DataPanel**

Update `src/components/ui/DataPanel.tsx` — replace the panel content routing:

```tsx
// Add imports:
import { EarthPanel } from './panels/EarthPanel'
import { MarsPanel } from './panels/MarsPanel'
import { SunPanel } from './panels/SunPanel'

// Replace the panel content section:
{selectedObject.type === 'planet' && selectedObject.id === 'earth' && <EarthPanel />}
{selectedObject.type === 'planet' && selectedObject.id === 'mars' && <MarsPanel />}
{selectedObject.type === 'planet' && !['earth', 'mars'].includes(selectedObject.id) && (
  <PlanetPanel id={selectedObject.id} />
)}
{selectedObject.type === 'star' && <SunPanel />}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/panels/ src/components/ui/DataPanel.tsx
git commit -m "feat: add Earth (EPIC + EONET), Mars (rover photos), and Sun (space weather) panels"
```

---

## Phase 6: Moons, Dwarf Planets, Asteroids

### Task 20: Moon Rendering

**Files:**
- Create: `src/components/canvas/Moon.tsx`
- Modify: `src/components/canvas/Planet.tsx`

- [ ] **Step 1: Create Moon component**

Create `src/components/canvas/Moon.tsx`:

```tsx
import { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { MoonData } from '../../data/types'
import { useStore, CelestialTarget } from '../../store/useStore'
import { computePosition, dateToJulian } from '../../lib/orbital'
import { radiusToScene } from '../../lib/scales'

interface MoonProps {
  data: MoonData
  parentPosition: THREE.Vector3
}

export function Moon({ data, parentPosition }: MoonProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  const scaleMode = useStore((s) => s.scaleMode)
  const time = useStore((s) => s.time)
  const selectObject = useStore((s) => s.selectObject)
  const flyTo = useStore((s) => s.flyTo)
  const selectedObject = useStore((s) => s.selectedObject)
  const setHoveredObject = useStore((s) => s.setHoveredObject)

  // Moon radius — smaller scale factor than planets
  const radius = Math.max(radiusToScene(data.physical.radius, scaleMode) * 0.5, 0.05)
  const isSelected = selectedObject?.id === data.id

  const target: CelestialTarget = useMemo(
    () => ({ id: data.id, name: data.name, type: 'moon', parentId: data.parentId }),
    [data.id, data.name, data.parentId]
  )

  // Moon orbit distance from parent (scaled)
  const orbitRadius = useMemo(() => {
    // Convert moon's semi-major axis (AU) to a visible distance from parent
    const auDist = data.orbit.semiMajorAxis
    // Scale up significantly so moons are visible
    return Math.max(auDist * 1e5, radius * 3)
  }, [data.orbit.semiMajorAxis, radius])

  useFrame(() => {
    if (!groupRef.current) return

    const jd = dateToJulian(time.currentTime)
    // Simple circular orbit around parent for visual representation
    const n = (2 * Math.PI) / (data.orbit.period * 365.25)
    const angle = n * (jd - data.orbit.epoch) + data.orbit.meanAnomalyAtEpoch * (Math.PI / 180)

    groupRef.current.position.set(
      parentPosition.x + Math.cos(angle) * orbitRadius,
      parentPosition.y,
      parentPosition.z + Math.sin(angle) * orbitRadius
    )
  })

  const handleClick = useCallback(
    (e: THREE.Event) => {
      e.stopPropagation()
      selectObject(target)
      flyTo(target)
    },
    [selectObject, flyTo, target]
  )

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); setHoveredObject(data.id); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); setHoveredObject(null); document.body.style.cursor = 'auto' }}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color="#aaa" roughness={0.9} metalness={0.05} />
      </mesh>

      {(hovered || isSelected) && (
        <Html
          position={[0, radius * 2, 0]}
          center
          style={{
            color: 'white',
            fontSize: '10px',
            fontWeight: 500,
            textShadow: '0 0 6px rgba(0,0,0,0.9)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {data.name}
        </Html>
      )}
    </group>
  )
}
```

- [ ] **Step 2: Add moons to Planet component**

Update `src/components/canvas/Planet.tsx` — add moon rendering. Add a `positionRef` to track the planet's position and pass it to Moon components:

```tsx
// Add imports:
import { MOONS_BY_PARENT } from '../../data/moons'
import { Moon } from './Moon'

// Add a position ref inside the Planet component:
const positionRef = useRef(new THREE.Vector3())

// In the useFrame callback, after setting groupRef.current.position, add:
positionRef.current.copy(groupRef.current.position)

// After the </group> closing tag but before the fragment close, add moons:
{MOONS_BY_PARENT.get(data.id)?.map((moon) => (
  <Moon key={moon.id} data={moon} parentPosition={positionRef.current} />
))}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/canvas/Moon.tsx src/components/canvas/Planet.tsx
git commit -m "feat: add moon rendering orbiting parent planets"
```

---

### Task 21: Dwarf Planets & Asteroid Belt

**Files:**
- Create: `src/components/canvas/DwarfPlanet.tsx`
- Create: `src/components/canvas/AsteroidBelt.tsx`
- Modify: `src/components/canvas/SolarSystem.tsx`

- [ ] **Step 1: Create DwarfPlanet component**

Create `src/components/canvas/DwarfPlanet.tsx`:

```tsx
import { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { DwarfPlanetData } from '../../data/types'
import { useStore, CelestialTarget } from '../../store/useStore'
import { computePosition, dateToJulian } from '../../lib/orbital'
import { auToScene, radiusToScene } from '../../lib/scales'
import { OrbitLine } from './OrbitLine'

interface DwarfPlanetProps {
  data: DwarfPlanetData
}

export function DwarfPlanet({ data }: DwarfPlanetProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const scaleMode = useStore((s) => s.scaleMode)
  const time = useStore((s) => s.time)
  const selectObject = useStore((s) => s.selectObject)
  const flyTo = useStore((s) => s.flyTo)
  const selectedObject = useStore((s) => s.selectedObject)
  const setHoveredObject = useStore((s) => s.setHoveredObject)

  const radius = Math.max(radiusToScene(data.physical.radius, scaleMode) * 0.7, 0.08)
  const isSelected = selectedObject?.id === data.id

  const target: CelestialTarget = useMemo(
    () => ({ id: data.id, name: data.name, type: 'dwarf-planet' }),
    [data.id, data.name]
  )

  useFrame(() => {
    if (!groupRef.current) return
    const jd = dateToJulian(time.currentTime)
    const [x, y, z] = computePosition(data.orbit, jd)
    groupRef.current.position.set(
      auToScene(x, scaleMode),
      auToScene(z, scaleMode),
      auToScene(y, scaleMode)
    )
  })

  const handleClick = useCallback((e: THREE.Event) => {
    e.stopPropagation()
    selectObject(target)
    flyTo(target)
  }, [selectObject, flyTo, target])

  return (
    <>
      <OrbitLine orbit={data.orbit} color={data.color} opacity={0.1} />
      <group ref={groupRef}>
        <mesh
          onClick={handleClick}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); setHoveredObject(data.id); document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { setHovered(false); setHoveredObject(null); document.body.style.cursor = 'auto' }}
        >
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial color={data.color} roughness={0.85} />
        </mesh>
        {(hovered || isSelected) && (
          <Html position={[0, radius * 2, 0]} center style={{ color: 'white', fontSize: '10px', fontWeight: 500, textShadow: '0 0 6px rgba(0,0,0,0.9)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            {data.name}
          </Html>
        )}
      </group>
    </>
  )
}
```

- [ ] **Step 2: Create AsteroidBelt with GPU instancing**

Create `src/components/canvas/AsteroidBelt.tsx`:

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { auToScene } from '../../lib/scales'

const ASTEROID_COUNT = 3000
const BELT_INNER_AU = 2.1
const BELT_OUTER_AU = 3.3
const BELT_HEIGHT_AU = 0.15

export function AsteroidBelt() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const scaleMode = useStore((s) => s.scaleMode)

  // Pre-compute random orbital parameters for each asteroid
  const asteroidData = useMemo(() => {
    const data = []
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      const distance = BELT_INNER_AU + Math.random() * (BELT_OUTER_AU - BELT_INNER_AU)
      const angle = Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * BELT_HEIGHT_AU
      const speed = 0.0001 + Math.random() * 0.0002
      const size = 0.01 + Math.random() * 0.04
      data.push({ distance, angle, height, speed, size })
    }
    return data
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()

    for (let i = 0; i < ASTEROID_COUNT; i++) {
      const { distance, angle, height, speed, size } = asteroidData[i]
      const a = angle + t * speed

      const x = Math.cos(a) * distance
      const z = Math.sin(a) * distance
      const y = height

      dummy.position.set(
        auToScene(x, scaleMode),
        auToScene(y, scaleMode),
        auToScene(z, scaleMode)
      )
      dummy.scale.setScalar(size)
      dummy.rotation.set(t * speed * 10, t * speed * 7, 0)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, ASTEROID_COUNT]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#888" roughness={0.95} metalness={0.1} />
    </instancedMesh>
  )
}
```

- [ ] **Step 3: Add dwarf planets and asteroid belt to SolarSystem**

Update `src/components/canvas/SolarSystem.tsx`:

```tsx
import { PLANETS } from '../../data/planets'
import { DWARF_PLANETS } from '../../data/dwarfPlanets'
import { Planet } from './Planet'
import { DwarfPlanet } from './DwarfPlanet'
import { AsteroidBelt } from './AsteroidBelt'

export function SolarSystem() {
  return (
    <group>
      {PLANETS.map((planet) => (
        <Planet key={planet.id} data={planet} />
      ))}
      {DWARF_PLANETS.map((dp) => (
        <DwarfPlanet key={dp.id} data={dp} />
      ))}
      <AsteroidBelt />
    </group>
  )
}
```

- [ ] **Step 4: Verify**

```bash
npm run dev
```

Expected: Asteroid belt visible as a ring of tiny rocks between Mars and Jupiter orbits. Dwarf planets (Pluto, Ceres, Eris, etc.) visible with faint orbit lines. All clickable.

- [ ] **Step 5: Commit**

```bash
git add src/components/canvas/DwarfPlanet.tsx src/components/canvas/AsteroidBelt.tsx src/components/canvas/SolarSystem.tsx
git commit -m "feat: add dwarf planets and GPU-instanced asteroid belt"
```

---

## Phase 7: Loading & Polish

### Task 22: Loading Screen

**Files:**
- Create: `src/components/ui/LoadingScreen.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create cinematic loading screen**

Create `src/components/ui/LoadingScreen.tsx`:

```tsx
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'

export function LoadingScreen() {
  const loadingComplete = useStore((s) => s.loadingComplete)
  const setLoadingComplete = useStore((s) => s.setLoadingComplete)

  // Auto-dismiss after 3 seconds (textures load in background)
  if (!loadingComplete) {
    setTimeout(() => setLoadingComplete(true), 3000)
  }

  return (
    <AnimatePresence>
      {!loadingComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: 12, color: '#fff', marginBottom: 16 }}>
              ASTRA
            </div>
            <div style={{ fontSize: 12, letterSpacing: 4, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              EXPLORING THE SOLAR SYSTEM
            </div>
          </motion.div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 200 }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
            style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent, #4a90d9, transparent)',
              marginTop: 40,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Add LoadingScreen to App**

Update `src/App.tsx` — add before the closing div:

```tsx
import { LoadingScreen } from './components/ui/LoadingScreen'

// Just before the closing </div>:
<LoadingScreen />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/LoadingScreen.tsx src/App.tsx
git commit -m "feat: add cinematic loading screen with fade transition"
```

---

### Task 23: Mobile Responsive + Touch Controls

**Files:**
- Modify: `src/components/ui/DataPanel.tsx`
- Modify: `src/components/ui/TimeSlider.tsx`
- Modify: `src/components/ui/TopBar.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Add responsive breakpoints and mobile overrides**

Add to `src/index.css`:

```css
/* Mobile responsive */
@media (max-width: 768px) {
  body {
    touch-action: none;
  }
}
```

- [ ] **Step 2: Make DataPanel mobile-friendly (slide up from bottom)**

Update `src/components/ui/DataPanel.tsx` — detect mobile and use a bottom sheet:

```tsx
// Add at the top of the DataPanel component:
const isMobile = window.innerWidth <= 768

// Update the motion.div styles based on isMobile:
// For mobile: position bottom, full width, max-height 60vh, slide up from bottom
// For desktop: keep existing right-side panel

// Replace the motion.div animation props:
initial={isMobile ? { y: '100%', opacity: 0 } : { x: 400, opacity: 0 }}
animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
exit={isMobile ? { y: '100%', opacity: 0 } : { x: 400, opacity: 0 }}

// Replace the motion.div style:
style={{
  position: 'absolute',
  ...(isMobile ? {
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '60vh',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px 16px 0 0',
  } : {
    top: 0,
    right: 0,
    bottom: 0,
    width: 380,
    borderLeft: '1px solid rgba(255,255,255,0.06)',
  }),
  background: 'rgba(8,8,24,0.92)',
  backdropFilter: 'blur(20px)',
  overflowY: 'auto',
  zIndex: 20,
}}
```

- [ ] **Step 3: Compact TimeSlider on mobile**

Update `src/components/ui/TimeSlider.tsx` — reduce padding and hide some elements on small screens. Add a check for mobile and conditionally simplify the layout.

- [ ] **Step 4: Compact TopBar on mobile**

Update `src/components/ui/TopBar.tsx` — reduce logo size, make search collapse to an icon on mobile.

- [ ] **Step 5: Verify on mobile viewport**

Open dev tools, toggle device toolbar to a phone viewport. Verify:
- Touch to orbit works
- Pinch to zoom works
- Panel slides up from bottom
- UI elements don't overflow

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/ src/index.css
git commit -m "feat: add mobile responsive layout with bottom sheet panel"
```

---

### Task 24: Adaptive Quality System

**Files:**
- Create: `src/lib/useAdaptiveQuality.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create adaptive quality hook**

Create `src/lib/useAdaptiveQuality.ts`:

```typescript
import { useEffect, useRef } from 'react'
import { useStore, QualityTier } from '../store/useStore'

/**
 * Monitors FPS and adjusts quality tier automatically.
 * - Starts at 'high' on desktop, 'low' on mobile
 * - If FPS drops below 30 for 3 seconds, drops a tier
 * - If FPS stays above 50 for 5 seconds, raises a tier
 */
export function useAdaptiveQuality() {
  const setQuality = useStore((s) => s.setQuality)
  const quality = useStore((s) => s.quality)
  const frameTimesRef = useRef<number[]>([])
  const lastCheckRef = useRef(0)

  useEffect(() => {
    // Set initial quality based on device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)
    if (isMobile) {
      setQuality('low')
      return
    }

    // Check WebGL capabilities
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        // Integrated GPUs get medium
        if (/Intel|Mesa|Integrated/i.test(renderer)) {
          setQuality('medium')
          return
        }
      }
    }

    setQuality('high')
  }, [setQuality])

  // FPS monitoring loop
  useEffect(() => {
    let raf: number
    const tiers: QualityTier[] = ['low', 'medium', 'high']

    const tick = () => {
      const now = performance.now()
      frameTimesRef.current.push(now)

      // Keep last 60 frame times
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift()
      }

      // Check every 3 seconds
      if (now - lastCheckRef.current > 3000) {
        lastCheckRef.current = now
        const times = frameTimesRef.current
        if (times.length > 10) {
          const avgFrameTime = (times[times.length - 1] - times[0]) / (times.length - 1)
          const fps = 1000 / avgFrameTime

          const currentIdx = tiers.indexOf(quality)
          if (fps < 25 && currentIdx > 0) {
            setQuality(tiers[currentIdx - 1])
          } else if (fps > 55 && currentIdx < 2) {
            setQuality(tiers[currentIdx + 1])
          }
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [quality, setQuality])
}
```

- [ ] **Step 2: Wire into App**

Update `src/App.tsx`:

```tsx
import { useAdaptiveQuality } from './lib/useAdaptiveQuality'

// Inside the App component, before the return:
useAdaptiveQuality()
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/useAdaptiveQuality.ts src/App.tsx
git commit -m "feat: add adaptive quality system with FPS monitoring"
```

---

### Task 25: Connect Camera Fly-To to Actual Body Positions

**Files:**
- Create: `src/lib/bodyPositions.ts`
- Modify: `src/components/canvas/CameraController.tsx`

- [ ] **Step 1: Create a body position registry**

Create `src/lib/bodyPositions.ts`:

```typescript
import * as THREE from 'three'

/**
 * Global registry of current celestial body positions.
 * Updated each frame by the Planet/Moon/DwarfPlanet components.
 * Read by CameraController for fly-to targeting.
 */
class BodyPositionRegistry {
  private positions = new Map<string, THREE.Vector3>()
  private radii = new Map<string, number>()

  set(id: string, position: THREE.Vector3, radius: number) {
    const existing = this.positions.get(id)
    if (existing) {
      existing.copy(position)
    } else {
      this.positions.set(id, position.clone())
    }
    this.radii.set(id, radius)
  }

  get(id: string): THREE.Vector3 | undefined {
    return this.positions.get(id)
  }

  getRadius(id: string): number {
    return this.radii.get(id) || 1
  }
}

export const bodyPositions = new BodyPositionRegistry()
```

- [ ] **Step 2: Update Planet to register its position**

In `src/components/canvas/Planet.tsx`, add at the top:

```tsx
import { bodyPositions } from '../../lib/bodyPositions'
```

In the `useFrame` callback, after setting the position, add:

```tsx
bodyPositions.set(data.id, groupRef.current.position, radius)
```

Do the same in `DwarfPlanet.tsx` and `Moon.tsx`.

- [ ] **Step 3: Update CameraController to use body positions**

In `src/components/canvas/CameraController.tsx`, update the fly-to trigger effect to use `bodyPositions`:

```tsx
import { bodyPositions } from '../../lib/bodyPositions'

// In the useEffect that triggers fly-to:
const targetPos = bodyPositions.get(cameraTarget.id) || new THREE.Vector3()
const targetRadius = bodyPositions.getRadius(cameraTarget.id)

// Update endPos to orbit at a good distance:
const dir = new THREE.Vector3().subVectors(camera.position, targetPos).normalize()
fs.endPos.copy(targetPos).add(dir.multiplyScalar(targetRadius * 4))
```

- [ ] **Step 4: Also register Sun position (always origin)**

In `src/components/canvas/Sun.tsx`, add:

```tsx
import { bodyPositions } from '../../lib/bodyPositions'

// Inside the component, after radius calculation:
bodyPositions.set('sun', new THREE.Vector3(0, 0, 0), radius)
```

- [ ] **Step 5: Verify fly-to works end-to-end**

```bash
npm run dev
```

Expected: Search for "Jupiter", press Enter or click result — camera swoops in a smooth arc to orbit Jupiter. Click Saturn in the 3D view — camera flies there. Works for all planets, moons, dwarf planets.

- [ ] **Step 6: Commit**

```bash
git add src/lib/bodyPositions.ts src/components/canvas/
git commit -m "feat: connect camera fly-to to actual body positions via global registry"
```

---

### Task 26: Final Integration & Texture Downloads

**Files:**
- Create: `scripts/download-textures.sh`
- Modify: `src/components/canvas/Planet.tsx` (texture loading)

- [ ] **Step 1: Create texture download script**

Create `scripts/download-textures.sh`:

```bash
#!/bin/bash
# Downloads planet textures from Solar System Scope (CC BY 4.0)
# https://www.solarsystemscope.com/textures/

TEXTURE_DIR="public/textures"
BASE_URL="https://www.solarsystemscope.com/textures/download"

mkdir -p "$TEXTURE_DIR"

echo "Downloading planet textures (this may take a few minutes)..."

# 2K textures for initial load (small enough for fast loading)
declare -A TEXTURES=(
  ["earth_daymap.jpg"]="2k_earth_daymap.jpg"
  ["earth_nightmap.jpg"]="2k_earth_nightlight.jpg"
  ["earth_clouds.png"]="2k_earth_clouds.jpg"
  ["earth_normal.jpg"]="2k_earth_normal_map.tif"
  ["earth_specular.jpg"]="2k_earth_specular_map.tif"
  ["mercury_albedo.jpg"]="2k_mercury.jpg"
  ["venus_surface.jpg"]="2k_venus_surface.jpg"
  ["venus_atmosphere.jpg"]="2k_venus_atmosphere.jpg"
  ["mars_albedo.jpg"]="2k_mars.jpg"
  ["jupiter_albedo.jpg"]="2k_jupiter.jpg"
  ["saturn_albedo.jpg"]="2k_saturn.jpg"
  ["saturn_ring_color.png"]="2k_saturn_ring_alpha.png"
  ["uranus_albedo.jpg"]="2k_uranus.jpg"
  ["neptune_albedo.jpg"]="2k_neptune.jpg"
  ["moon_albedo.jpg"]="2k_moon.jpg"
  ["sun_albedo.jpg"]="2k_sun.jpg"
)

for local_name in "${!TEXTURES[@]}"; do
  remote_name="${TEXTURES[$local_name]}"
  if [ ! -f "$TEXTURE_DIR/$local_name" ]; then
    echo "  Downloading $local_name..."
    curl -sL "${BASE_URL}/${remote_name}" -o "$TEXTURE_DIR/$local_name" 2>/dev/null || echo "  Warning: Could not download $local_name"
  else
    echo "  Skipping $local_name (already exists)"
  fi
done

echo "Done! Textures saved to $TEXTURE_DIR/"
```

- [ ] **Step 2: Run texture download**

```bash
chmod +x scripts/download-textures.sh
./scripts/download-textures.sh
```

Note: If Solar System Scope downloads fail (they may require browser session), you can manually download from https://www.solarsystemscope.com/textures/ or use NASA's lower-res public domain textures. The app will work with or without textures (falls back to solid colors).

- [ ] **Step 3: Add texture loading to Planet component**

Update `src/components/canvas/Planet.tsx` — add texture loading with `useTexture` from drei:

```tsx
import { useTexture } from '@react-three/drei'

// Inside the Planet component, before the return:
const texturePaths: Record<string, string> = {}
if (data.textureSet.albedo) texturePaths.map = `/textures/${data.textureSet.albedo}`
if (data.textureSet.normal) texturePaths.normalMap = `/textures/${data.textureSet.normal}`

// Conditionally load textures (won't crash if files don't exist)
let textures: Record<string, THREE.Texture> | null = null
try {
  textures = Object.keys(texturePaths).length > 0 ? useTexture(texturePaths) : null
} catch {
  textures = null
}

// In the mesh material, replace the solid color with textures if available:
<meshStandardMaterial
  {...(textures || {})}
  color={textures ? '#ffffff' : data.color}
  roughness={0.8}
  metalness={0.1}
/>
```

Note: `useTexture` from drei handles async texture loading with Suspense. The `try/catch` handles cases where texture files don't exist.

- [ ] **Step 4: Commit**

```bash
git add scripts/ src/components/canvas/Planet.tsx
# Don't commit the texture files themselves — they're large binary assets
echo "public/textures/*.jpg" >> .gitignore
echo "public/textures/*.png" >> .gitignore
echo "public/textures/*.tif" >> .gitignore
git add .gitignore
git commit -m "feat: add texture loading with fallback to solid colors"
```

---

### Task 27: Dwarf Planet & Moon Panels

**Files:**
- Create: `src/components/ui/panels/DwarfPlanetPanel.tsx`
- Create: `src/components/ui/panels/MoonPanel.tsx`
- Modify: `src/components/ui/DataPanel.tsx`

- [ ] **Step 1: Create DwarfPlanetPanel**

Create `src/components/ui/panels/DwarfPlanetPanel.tsx`:

```tsx
import { DWARF_PLANET_MAP } from '../../../data/dwarfPlanets'

export function DwarfPlanetPanel({ id }: { id: string }) {
  const dp = DWARF_PLANET_MAP.get(id)
  if (!dp) return null

  return (
    <div>
      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {dp.physical.radius && <div><div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Diameter</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{(dp.physical.radius * 2).toLocaleString()} km</div></div>}
        {dp.physical.density && <div><div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Density</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{dp.physical.density} g/cm³</div></div>}
        {dp.physical.rotationPeriod && <div><div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Day Length</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{Math.abs(dp.physical.rotationPeriod).toFixed(1)}h</div></div>}
        {dp.physical.meanTemperature !== undefined && <div><div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Temperature</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{dp.physical.meanTemperature}°C</div></div>}
      </div>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>{dp.description}</p>
      </div>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Discovery</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          Discovered by {dp.discoverer} in {dp.discoveryYear}
        </div>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Orbital Parameters</div>
        {[
          ['Semi-major axis', `${dp.orbit.semiMajorAxis.toFixed(2)} AU`],
          ['Eccentricity', dp.orbit.eccentricity.toFixed(4)],
          ['Inclination', `${dp.orbit.inclination.toFixed(2)}°`],
          ['Orbital period', `${dp.orbit.period.toFixed(1)} years`],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create MoonPanel**

Create `src/components/ui/panels/MoonPanel.tsx`:

```tsx
import { MOON_MAP } from '../../../data/moons'
import { PLANET_MAP } from '../../../data/planets'

export function MoonPanel({ id }: { id: string }) {
  const moon = MOON_MAP.get(id)
  if (!moon) return null

  const parent = PLANET_MAP.get(moon.parentId)

  return (
    <div>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
          Moon of {parent?.name || moon.parentId}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Radius</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{moon.physical.radius.toLocaleString()} km</div></div>
          {moon.physical.mass && <div><div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Mass</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{moon.physical.mass.toExponential(2)} kg</div></div>}
        </div>
      </div>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>{moon.description}</p>
      </div>
      {moon.discoverer && (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Discovery</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            Discovered by {moon.discoverer} in {moon.discoveryYear}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Wire into DataPanel**

Update `src/components/ui/DataPanel.tsx` — add the missing panel types:

```tsx
import { DwarfPlanetPanel } from './panels/DwarfPlanetPanel'
import { MoonPanel } from './panels/MoonPanel'

// Replace the placeholder divs:
{selectedObject.type === 'moon' && <MoonPanel id={selectedObject.id} />}
{selectedObject.type === 'dwarf-planet' && <DwarfPlanetPanel id={selectedObject.id} />}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/panels/ src/components/ui/DataPanel.tsx
git commit -m "feat: add data panels for dwarf planets and moons"
```

---

### Task 28: Final Verification & Cleanup

- [ ] **Step 1: Run dev server and verify all features**

```bash
npm run dev
```

Verify the following:
1. App loads with cinematic loading screen → fades to reveal solar system
2. 8 planets orbit the Sun with visible orbit lines
3. 5 dwarf planets visible with orbits
4. Asteroid belt renders between Mars and Jupiter
5. Click any planet → camera flies to it, data panel opens with correct stats
6. Earth panel shows EPIC satellite image + EONET events
7. Mars panel shows rover photos
8. Sun panel shows CMEs and solar flares
9. Search bar finds planets/moons/dwarf planets with autocomplete
10. Time slider plays/pauses, scrubs forward/backward, planets move
11. Scale toggle switches between compressed and realistic
12. APOD card shows in bottom left, expands on click
13. Planets have atmosphere glow, Saturn has rings with Cassini Division
14. Post-processing: bloom on Sun, filmic tone mapping, vignette
15. Mobile: responsive layout, touch controls work

- [ ] **Step 2: Fix any TypeScript errors**

```bash
npx tsc --noEmit
```

Fix any remaining type errors.

- [ ] **Step 3: Build for production**

```bash
npm run build
```

Expected: Clean build with no errors. Output in `dist/`.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup and production build verification"
```

---

## Verification Checklist

After completing all tasks, verify end-to-end:

- [ ] `npm run dev` — app loads in browser
- [ ] Click each of the 8 planets — data panel opens with correct data
- [ ] Click Sun — shows space weather (CMEs, flares)
- [ ] Click Earth — shows EPIC satellite image + EONET events
- [ ] Click Mars — shows rover photos from Curiosity/Perseverance
- [ ] Click 2+ moons — shows moon data with parent reference
- [ ] Click 2+ dwarf planets — shows data panel
- [ ] Search "Jupiter" — autocomplete works, selecting flies camera there
- [ ] Press "/" to focus search
- [ ] Play time → planets orbit
- [ ] Scrub time slider → planets reposition
- [ ] Scale toggle → positions change between compressed/realistic
- [ ] APOD card visible → click expands to full overlay
- [ ] Asteroid belt visible between Mars and Jupiter
- [ ] Bloom visible on Sun, filmic color grading on entire scene
- [ ] Saturn rings visible with gap
- [ ] Planet atmospheres glow at limb
- [ ] Camera auto-drifts after 10s of inactivity
- [ ] Mobile viewport: touch controls, bottom sheet panel, compact UI
- [ ] `npm run build` — clean production build
- [ ] Network tab: API calls go to `/api/` proxy endpoints
