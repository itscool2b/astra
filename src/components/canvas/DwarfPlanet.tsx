import { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { DwarfPlanetData } from '../../data/types'
import { useStore, type CelestialTarget } from '../../store/useStore'
import { computePosition, dateToJulian } from '../../lib/orbital'
import { auToScene, radiusToScene } from '../../lib/scales'
import { OrbitLine } from './OrbitLine'
import { bodyPositions } from '../../lib/bodyPositions'

// Seeded PRNG for deterministic procedural textures
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// Per-dwarf-planet visual characteristics
const DWARF_PLANET_VISUALS: Record<string, {
  baseColor: [number, number, number]
  variation: number       // color noise intensity
  spots?: { x: number; y: number; radius: number; brightness: number }[]
  roughness: number
}> = {
  ceres: {
    baseColor: [140, 140, 140],
    variation: 20,
    spots: [
      { x: 0.35, y: 0.45, radius: 0.03, brightness: 60 },  // Occator bright spot
      { x: 0.37, y: 0.47, radius: 0.015, brightness: 50 },
    ],
    roughness: 0.92,
  },
  pluto: {
    baseColor: [195, 165, 120],
    variation: 25,
    spots: [
      { x: 0.5, y: 0.45, radius: 0.15, brightness: 50 },  // Tombaugh Regio (heart)
      { x: 0.45, y: 0.42, radius: 0.12, brightness: 40 },
    ],
    roughness: 0.88,
  },
  haumea: {
    baseColor: [210, 210, 215],
    variation: 10,
    roughness: 0.8,
  },
  makemake: {
    baseColor: [180, 135, 100],
    variation: 18,
    roughness: 0.9,
  },
  eris: {
    baseColor: [220, 220, 225],
    variation: 8,
    roughness: 0.75,
  },
}

function generateDwarfPlanetTexture(id: string, _color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')!

  const config = DWARF_PLANET_VISUALS[id]
  const rng = seededRandom(hashString(id))

  // Parse base color from config or hex fallback
  const [br, bg, bb] = config?.baseColor ?? [160, 160, 160]
  const variation = config?.variation ?? 15

  // Fill with noise-based surface variation
  const imageData = ctx.createImageData(256, 128)
  const data = imageData.data

  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 256; x++) {
      const i = (y * 256 + x) * 4

      // Multi-scale noise approximation using seeded random
      const nx = x / 256
      const ny = y / 128
      const noise1 = Math.sin(nx * 12 + rng() * 6.28) * Math.cos(ny * 8 + rng() * 6.28) * 0.5
      const noise2 = Math.sin(nx * 25 + ny * 18 + hashString(id + 'b') * 0.001) * 0.3
      const noise3 = Math.sin(nx * 50 + ny * 40 + hashString(id + 'c') * 0.001) * 0.15
      const noiseVal = (noise1 + noise2 + noise3) * variation

      let r = br + noiseVal
      let g = bg + noiseVal * 0.9
      let b = bb + noiseVal * 0.8

      // Apply bright spots (craters, regions)
      if (config?.spots) {
        for (const spot of config.spots) {
          const dx = nx - spot.x
          const dy = ny - spot.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < spot.radius) {
            const falloff = 1 - (dist / spot.radius)
            const blend = falloff * falloff
            r += spot.brightness * blend
            g += spot.brightness * blend
            b += spot.brightness * blend * 0.9
          }
        }
      }

      data[i] = Math.max(0, Math.min(255, r))
      data[i + 1] = Math.max(0, Math.min(255, g))
      data[i + 2] = Math.max(0, Math.min(255, b))
      data[i + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

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
  const overlayOpen = useStore((s) => s.overlayOpen)

  const radius = Math.max(radiusToScene(data.physical.radius, scaleMode) * 0.7, 0.08)
  const isSelected = selectedObject?.id === data.id

  const surfaceTexture = useMemo(
    () => generateDwarfPlanetTexture(data.id, data.color),
    [data.id, data.color]
  )

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
    bodyPositions.set(data.id, groupRef.current.position, radius)
  })

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectObject(target)
    flyTo(target)
  }, [selectObject, flyTo, target])

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
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
      <OrbitLine orbit={data.orbit} color={data.color} opacity={0.1} />
      <group ref={groupRef}>
        <mesh
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial
            map={surfaceTexture}
            roughness={DWARF_PLANET_VISUALS[data.id]?.roughness ?? 0.85}
            metalness={0.02}
          />
        </mesh>
        {!overlayOpen && (hovered || isSelected) && (
          <Html position={[0, radius * 2, 0]} center style={{ color: 'white', fontSize: '10px', fontWeight: 500, textShadow: '0 0 6px rgba(0,0,0,0.9)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            {data.name}
          </Html>
        )}
      </group>
    </>
  )
}
