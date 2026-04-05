import { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { PlanetData } from '../../data/types'
import { useStore, type CelestialTarget } from '../../store/useStore'
import { computePosition, dateToJulian } from '../../lib/orbital'
import { auToScene, radiusToScene } from '../../lib/scales'
import { OrbitLine } from './OrbitLine'
import { Atmosphere } from './Atmosphere'
import { Rings } from './Rings'
import { EarthMarkers } from './EarthMarkers'
import { ISS } from './ISS'
import { MOONS_BY_PARENT } from '../../data/moons'
import { Moon } from './Moon'
import { bodyPositions } from '../../lib/bodyPositions'

const textureLoader = new THREE.TextureLoader()

// Per-planet visual properties for realistic rendering
const PLANET_VISUALS: Record<string, {
  roughness: number
  metalness: number
  atmosphere?: { color: string; intensity: number; power: number; scale: number }
  clouds?: { opacity: number; scale: number; rotationMultiplier: number; useAlphaMap: boolean }
}> = {
  mercury:  { roughness: 0.9,  metalness: 0.02 },
  venus:    { roughness: 0.85, metalness: 0.02, atmosphere: { color: '#f5deb3', intensity: 2.0, power: 1.5, scale: 1.30 }, clouds: { opacity: 0.95, scale: 1.015, rotationMultiplier: 1.0, useAlphaMap: false } },
  earth:    { roughness: 0.85, metalness: 0.05, atmosphere: { color: '#4a90d9', intensity: 1.5, power: 3.0, scale: 1.12 }, clouds: { opacity: 0.3, scale: 1.01, rotationMultiplier: 1.03, useAlphaMap: true } },
  mars:     { roughness: 0.92, metalness: 0.02, atmosphere: { color: '#d4856a', intensity: 0.15, power: 5.0, scale: 1.02 } },
  jupiter:  { roughness: 0.35, metalness: 0.0,  atmosphere: { color: '#d4a56a', intensity: 1.0, power: 2.0, scale: 1.20 } },
  saturn:   { roughness: 0.4,  metalness: 0.0,  atmosphere: { color: '#e8d5a0', intensity: 0.8, power: 2.5, scale: 1.18 } },
  uranus:   { roughness: 0.3,  metalness: 0.0,  atmosphere: { color: '#a8dce0', intensity: 0.7, power: 2.5, scale: 1.15 } },
  neptune:  { roughness: 0.35, metalness: 0.0,  atmosphere: { color: '#4169e1', intensity: 0.8, power: 2.5, scale: 1.15 } },
}

function useTextureAsync(path: string | undefined): { texture: THREE.Texture | null; loaded: boolean } {
  const [loaded, setLoaded] = useState(false)
  const texture = useMemo(() => {
    if (!path) return null
    setLoaded(false)
    try {
      return textureLoader.load(
        `/textures/${path}`,
        () => setLoaded(true),
      )
    } catch {
      return null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])
  return { texture, loaded }
}

interface PlanetProps {
  data: PlanetData
}

export function Planet({ data }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const cloudRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const positionRef = useRef(new THREE.Vector3())
  const [hovered, setHovered] = useState(false)

  const scaleMode = useStore((s) => s.scaleMode)
  const time = useStore((s) => s.time)
  const selectObject = useStore((s) => s.selectObject)
  const flyTo = useStore((s) => s.flyTo)
  const selectedObject = useStore((s) => s.selectedObject)
  const setHoveredObject = useStore((s) => s.setHoveredObject)
  const overlayOpen = useStore((s) => s.overlayOpen)

  const radius = radiusToScene(data.physical.radius, scaleMode)
  const isSelected = selectedObject?.id === data.id

  // Load textures
  const { texture: albedoTex, loaded: albedoLoaded } = useTextureAsync(data.textureSet.albedo)
  const { texture: normalTex, loaded: normalLoaded } = useTextureAsync(data.textureSet.normal)
  const { texture: cloudsTex } = useTextureAsync(data.textureSet.clouds)
  const { texture: nightTex, loaded: nightLoaded } = useTextureAsync(data.textureSet.night)

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
      auToScene(z, scaleMode), // ecliptic Z -> scene Y
      auToScene(y, scaleMode)  // ecliptic Y -> scene Z
    )

    positionRef.current.copy(groupRef.current.position)
    bodyPositions.set(data.id, groupRef.current.position, radius)

    // Self-rotation
    if (meshRef.current) {
      const hours = time.currentTime.getTime() / 3600000
      const rotAngle = (hours / Math.abs(data.physical.rotationPeriod)) * Math.PI * 2
      const sign = data.physical.rotationPeriod < 0 ? -1 : 1
      meshRef.current.rotation.y = rotAngle * sign
    }

    // Rotate cloud layer (per-planet multiplier)
    if (cloudRef.current && meshRef.current) {
      const cloudMultiplier = PLANET_VISUALS[data.id]?.clouds?.rotationMultiplier ?? 1.0
      cloudRef.current.rotation.y = meshRef.current.rotation.y * cloudMultiplier
    }
  })

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      selectObject(target)
      flyTo(target)
    },
    [selectObject, flyTo, target]
  )

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

  // Determine material color: white if texture loaded, fallback color otherwise
  const materialColor = albedoLoaded ? '#ffffff' : data.color

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
            key={`${data.id}-${albedoLoaded}-${normalLoaded}-${nightLoaded}`}
            color={materialColor}
            map={albedoLoaded ? albedoTex : null}
            normalMap={normalLoaded ? normalTex : null}
            emissiveMap={nightLoaded ? nightTex : null}
            emissive={nightLoaded ? '#ffffff' : '#000000'}
            emissiveIntensity={nightLoaded ? 0.4 : 0}
            roughness={PLANET_VISUALS[data.id]?.roughness ?? 0.85}
            metalness={PLANET_VISUALS[data.id]?.metalness ?? 0.05}
          />
        </mesh>

        {/* Cloud layer (Earth, Venus) */}
        {cloudsTex && PLANET_VISUALS[data.id]?.clouds && (
          <mesh
            ref={cloudRef}
            rotation={[data.physical.axialTilt * (Math.PI / 180), 0, 0]}
          >
            <sphereGeometry args={[radius * (PLANET_VISUALS[data.id].clouds!.scale), 64, 64]} />
            <meshStandardMaterial
              key={`clouds-${data.id}-${!!cloudsTex}`}
              map={cloudsTex}
              alphaMap={PLANET_VISUALS[data.id].clouds!.useAlphaMap ? cloudsTex : null}
              transparent
              opacity={PLANET_VISUALS[data.id].clouds!.opacity}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Atmosphere */}
        {data.atmosphere && PLANET_VISUALS[data.id]?.atmosphere && (
          <Atmosphere
            radius={radius}
            color={PLANET_VISUALS[data.id].atmosphere!.color}
            intensity={PLANET_VISUALS[data.id].atmosphere!.intensity}
            power={PLANET_VISUALS[data.id].atmosphere!.power}
            scale={PLANET_VISUALS[data.id].atmosphere!.scale}
          />
        )}

        {/* Ring system */}
        {data.hasRings && data.ringInnerRadius && data.ringOuterRadius && (
          <Rings
            innerRadius={radius * data.ringInnerRadius}
            outerRadius={radius * data.ringOuterRadius}
            color={data.color}
            opacity={data.id === 'saturn' ? 0.8 : 0.2}
            planetId={data.id}
            ringAlphaTexturePath={data.textureSet.ringAlpha}
          />
        )}

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

        {/* Earth event markers */}
        {data.id === 'earth' && <EarthMarkers radius={radius} />}

        {/* ISS tracker */}
        {data.id === 'earth' && <ISS radius={radius} />}

        {/* Name label */}
        {!overlayOpen && (
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
        )}
      </group>
      {MOONS_BY_PARENT.get(data.id)?.map((moon) => (
        <Moon key={moon.id} data={moon} parentPosition={positionRef.current} />
      ))}
    </>
  )
}
