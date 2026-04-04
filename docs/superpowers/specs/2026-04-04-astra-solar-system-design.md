# Astra — 3D Interactive Solar System

## Overview

A hyper-realistic, cinematic 3D interactive solar system web application. Users can orbit, zoom, fly to, and click any celestial body to reveal rich data panels with live NASA data. Functions like "Google Earth for space" — one URL, one app, desktop and mobile. The visual bar is **film-quality** — this should feel like flying through an Interstellar-grade rendering of space.

Portfolio project, publicly hosted on Vercel.

## Architecture

**Stack:** React + TypeScript + react-three-fiber + @react-three/drei + Vite
**State:** Zustand (global app state) + TanStack Query (API data/caching)
**Backend:** Vercel serverless functions (API proxy + caching)
**Cache:** Vercel KV (Redis-based, per-endpoint TTLs)
**Deploy:** Vercel (free tier)

```
Browser (React SPA)
  ├── Three.js / R3F (3D scene)
  ├── React UI overlays (panels, search, controls)
  └── TanStack Query (client-side cache)
        │
        ▼
Vercel Serverless Functions (API proxy)
  └── Vercel KV Cache
        │
        ▼
NASA APIs + JPL APIs + SDO
```

## 3D Scene

### Scene Graph

```
Scene
├── Skybox (deep space cubemap — Milky Way, stars)
├── Sun
│   ├── Emissive sphere (volumetric glow shader)
│   ├── Corona (billboard particles)
│   ├── PointLight (shadows)
│   └── Lens flare (post-processing)
├── Planets (×8)
│   ├── Orbit line (ellipse from Keplerian elements)
│   ├── Planet mesh (PBR: albedo + normal + roughness)
│   ├── Atmosphere shell (Rayleigh scattering shader)
│   ├── Cloud layer (Earth, Venus, gas giants)
│   ├── Night lights (Earth — emissive on dark side)
│   ├── Ring system (Saturn, Uranus, Neptune, Jupiter)
│   └── Moons group (child meshes)
├── Dwarf Planets (Pluto, Eris, Haumea, Makemake, Ceres)
├── Asteroid Belt (InstancedMesh — GPU instancing)
├── NEO Asteroids (tracked objects with real orbital data)
├── Kuiper Belt (instanced particles)
└── Post-processing
    ├── Bloom (sun glow, atmosphere edges)
    ├── Tone mapping (ACES filmic)
    ├── Chromatic aberration (subtle)
    └── FXAA antialiasing
```

### Camera System

- **Default:** OrbitControls — drag to rotate, scroll to zoom, right-drag to pan
- **Fly-to:** Cubic bezier path interpolation with damping for smooth transitions
- **Logarithmic depth buffer** to handle Sun-to-Kuiper-Belt scale range
- **Dynamic near/far planes** adjusted per focused object

### Rendering

- NASA/JPL public domain texture maps: 8K for major planets, 4K for moons
- Bump/normal maps for surface terrain
- Specular maps for ocean reflectivity (Earth)
- Custom GLSL atmosphere shader with Rayleigh scattering
- Saturn rings: semi-transparent with Cassini Division, shadow casting/receiving
- Earth: day/night texture blend, animated cloud layer, city lights
- Sun: custom volumetric shader with corona and prominences
- Progressive texture loading: 1K → 4K → 8K (focused object only)
- KTX2/Basis compressed textures for 3-4x smaller files

### Cinematic Quality

The visual target is film-grade. Every frame should look like it could be a screenshot from a AAA space game or a NASA visualization documentary.

**Post-processing stack (order matters):**
1. **Bloom** — aggressive on Sun, subtle on atmosphere edges and planet limbs
2. **ACES Filmic tone mapping** — Hollywood color science, deep blacks, rich highlights
3. **Chromatic aberration** — very subtle, edge-of-lens effect
4. **Film grain** — barely perceptible noise to break up digital cleanliness
5. **Vignette** — subtle darkening at edges for focus
6. **God rays** — volumetric light scattering when Sun is partially occluded by a body
7. **FXAA** — anti-aliasing as final pass

**Lighting:**
- Sun is the sole light source — harsh directional lighting with deep shadows
- No ambient light — the dark side of planets is truly dark (except Earth's city lights)
- Rim lighting on atmosphere edges for that iconic "thin blue line" look
- Specular highlights on oceans, ice caps

**Camera cinematics:**
- Idle drift: when not interacting, camera slowly orbits with subtle parallax
- Fly-to transitions: smooth, swooping arcs (not linear) with easing — like a drone shot through space
- Focus pull: slight depth-of-field blur on very distant objects when zoomed into one
- Intro sequence: camera sweeps in from deep space toward the Sun on first load

**Particle effects:**
- Solar wind particles streaming from Sun
- Dust particles in asteroid belt
- Subtle star twinkle (animated skybox stars)
- Comet tails (for any comets in the dataset)

**UI cinematics:**
- Panel open/close: smooth spring animations (not snappy CSS)
- Data values: number ticker animations on first reveal
- Hover states: subtle glow on celestial bodies when mouse approaches
- Selection ring: animated orbital ring appears around selected body

### Scale System

- **Compressed mode (default):** Logarithmic distance scaling — all planets visible
- **Realistic mode:** True proportional distances — planets become dots, fly-to required
- Body sizes always slightly exaggerated for clickability

### Time System

- Range: 1900–2100
- Positions computed from Keplerian orbital elements (6 params per body)
- Playback speeds: 1x, 1 day/sec, 1 month/sec, 1 year/sec (forward + backward)
- All positions mathematically derived — no pre-baked animation

## NASA API Integration

12 data sources, all proxied through Vercel serverless with KV caching:

| API | Endpoint | Cache TTL | Data |
|-----|----------|-----------|------|
| APOD | api.nasa.gov/planetary/apod | 24h | Daily astronomy image + explanation |
| Mars Rover Photos | api.nasa.gov/mars-photos/api/v1/rovers/ | 6h | Photos from Curiosity, Perseverance, Opportunity, Spirit |
| NEO (NeoWs) | api.nasa.gov/neo/rest/v1/ | 1h | Near-Earth asteroids, close approaches, orbital elements |
| EPIC | api.nasa.gov/EPIC/ | 6h | Full-disc Earth images from DSCOVR satellite |
| DONKI | api.nasa.gov/DONKI/ | 30min | CMEs, flares, geomagnetic storms, solar energetic particles, interplanetary shocks |
| EONET | eonet.gsfc.nasa.gov/api/v3/ | 1h | Natural events: wildfires, volcanoes, storms, floods, earthquakes |
| Exoplanet Archive | exoplanetarchive.ipac.caltech.edu/TAP/ | 7d | Full exoplanet catalog with host star data |
| JPL Horizons | ssd.jpl.nasa.gov/api/horizons.api | 24h | Precise ephemeris for any solar system body |
| JPL SBDB | ssd-api.jpl.nasa.gov/sbdb.api | 24h | Asteroid/comet orbital elements, physical params |
| SBDB Close Approach | ssd-api.jpl.nasa.gov/cad.api | 24h | Predicted close approaches to Earth |
| SDO | sdo.gsfc.nasa.gov | 30min | Real-time solar images in multiple wavelengths |
| NASA Image Library | images-api.nasa.gov | 24h | Search NASA's media archive for any object |

## Data Panels

Right-side slide-in panel (380px) on desktop, full-screen slide-up sheet on mobile. Glassmorphism styling with dark space theme.

### Panel Content by Object Type

**All objects:** Name, classification, physical stats grid, orbital parameters, NASA Image Library gallery.

**Planets (additional):**
- Atmosphere composition (pill badges)
- Temperature range
- Moon count (clickable list)
- Key facts / discovery info

**Earth (special):**
- Live EPIC satellite imagery (rotatable gallery from DSCOVR)
- Active EONET events mapped as colored pins on globe
- Event detail cards (category, date, coordinates, source)

**Mars (special):**
- Active rover positions marked on surface
- Photo carousel from Curiosity + Perseverance (filterable by camera, sol)
- Mission status for each rover

**Sun (special):**
- Live SDO imagery in multiple wavelengths (AIA 171, 193, 304)
- Space weather dashboard: active CMEs, recent flares (X/M/C class)
- Geomagnetic storm probability
- DONKI event timeline
- Solar wind speed, particle density

**Moons:**
- Physical + orbital stats relative to parent
- Discovery info, notable features

**Asteroids/NEOs:**
- Orbital elements, estimated size, albedo
- Hazard classification (PHA, Torino scale)
- Close approach timeline (past + future)
- Relative velocity, miss distance per approach

**Dwarf Planets:**
- Same as planets + classification context
- Pluto: New Horizons imagery

## UI Components

### Top Bar
- Logo: "ASTRA" — bold, letter-spaced
- Search: pill-shaped input with autocomplete (fuzzy search across all objects)
- Scale toggle: "COMPRESSED" / "REALISTIC" chip
- Settings: quality, controls help

### Time Slider (Bottom)
- Transport controls: rewind, play/pause, fast-forward
- Scrub bar: 1900–2100
- Current date + speed display
- Subtle gradient fade from transparent to dark

### APOD Card (Bottom Left)
- Thumbnail + title of today's Astronomy Picture of the Day
- Expands to full overlay on click

### Loading Screen
- Animated starfield or sun reveal
- Progress bar for texture loading

## Performance & Mobile

### Texture Strategy
- Progressive: 1K → 4K → 8K (only focused object gets 8K)
- KTX2/Basis compressed textures
- Lazy load moon/asteroid textures on approach

### Adaptive Quality Tiers
- **High** (desktop, good GPU): 8K textures, full post-processing, max particles
- **Medium** (desktop, integrated GPU): 4K textures, reduced bloom, fewer asteroids
- **Low** (mobile): 2K textures, simplified shaders, no chromatic aberration, fewer particles
- Dynamic FPS monitoring — drops quality if < 30fps

### Mobile Touch Controls
- 1 finger drag → orbit
- Pinch → zoom
- 2 finger drag → pan
- Tap → select
- Double tap → fly to
- Data panel → full-screen slide-up sheet

### Bundle
- Target < 500KB initial JS
- Code split: 3D engine first, API data streams in
- Tree-shake Three.js imports
- Textures served from CDN, not bundled

## Project Structure

```
astra/
├── public/
│   └── textures/               # Planet maps (loaded on demand via CDN)
├── src/
│   ├── components/
│   │   ├── canvas/              # R3F 3D components
│   │   │   ├── Scene.tsx
│   │   │   ├── Sun.tsx
│   │   │   ├── Planet.tsx
│   │   │   ├── Moon.tsx
│   │   │   ├── Rings.tsx
│   │   │   ├── Atmosphere.tsx
│   │   │   ├── AsteroidBelt.tsx
│   │   │   ├── NEOAsteroid.tsx
│   │   │   ├── OrbitLine.tsx
│   │   │   ├── Skybox.tsx
│   │   │   ├── CameraController.tsx
│   │   │   └── Effects.tsx
│   │   ├── ui/
│   │   │   ├── DataPanel.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── TimeSlider.tsx
│   │   │   ├── ScaleToggle.tsx
│   │   │   ├── APODCard.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   └── panels/
│   │   │       ├── PlanetPanel.tsx
│   │   │       ├── EarthPanel.tsx
│   │   │       ├── MarsPanel.tsx
│   │   │       ├── SunPanel.tsx
│   │   │       ├── MoonPanel.tsx
│   │   │       ├── AsteroidPanel.tsx
│   │   │       └── DwarfPlanetPanel.tsx
│   │   └── shared/
│   ├── data/
│   │   ├── solarSystem.ts       # Orbital elements, physical data
│   │   ├── planets.ts           # Planet metadata
│   │   └── moons.ts             # Moon data
│   ├── lib/
│   │   ├── orbital.ts           # Keplerian mechanics math
│   │   ├── coordinates.ts       # Coordinate transforms
│   │   ├── scales.ts            # Scale mode calculations
│   │   └── shaders/
│   │       ├── atmosphere.glsl
│   │       ├── sun.glsl
│   │       └── rings.glsl
│   ├── api/
│   │   ├── nasa.ts              # API client
│   │   ├── hooks.ts             # TanStack Query hooks
│   │   └── types.ts             # Response types
│   ├── store/
│   │   └── useStore.ts          # Zustand state
│   ├── App.tsx
│   └── main.tsx
├── api/                          # Vercel serverless functions
│   ├── apod.ts
│   ├── neo.ts
│   ├── epic.ts
│   ├── donki.ts
│   ├── mars-rover.ts
│   ├── eonet.ts
│   ├── exoplanets.ts
│   ├── sdo.ts
│   ├── horizons.ts
│   ├── sbdb.ts
│   ├── nasa-images.ts
│   └── _lib/
│       └── cache.ts
├── .env.local                    # NASA_API_KEY
├── vercel.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## Verification

1. `npm run dev` — app loads, 3D scene renders with all planets
2. Click each planet — data panel opens with correct data
3. Time slider — planets move to correct positions
4. Search "Jupiter" — camera flies to Jupiter
5. Scale toggle — switches between compressed and realistic
6. Open on mobile — touch controls work, panels adapt
7. Check network tab — API calls go through serverless proxy, responses cached
8. Sun panel — shows live DONKI space weather data
9. Earth panel — shows EPIC image and EONET events
10. Mars panel — shows rover photos
11. Asteroids — NEOs plotted with real trajectories from NEO API
