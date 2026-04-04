import { useRef, useMemo, useCallback } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useNEOFeed } from '../../api/hooks'
import { useStore, type CelestialTarget } from '../../store/useStore'
import { dateToJulian, solveKepler, trueAnomalyFromEccentric } from '../../lib/orbital'
import { auToScene } from '../../lib/scales'
import type { NEOData } from '../../api/types'

const DEG_TO_RAD = Math.PI / 180

interface NEOWithOrbit {
  neo: NEOData
  orbit: {
    semiMajorAxis: number
    eccentricity: number
    inclination: number
    longitudeOfAscendingNode: number
    argumentOfPerihelion: number
    meanAnomaly: number
    epoch: number
    period: number // days
  }
}

function parseNEOs(neoData: Record<string, NEOData[]>): NEOWithOrbit[] {
  const results: NEOWithOrbit[] = []
  const allNeos = Object.values(neoData).flat()

  for (const neo of allNeos) {
    if (!neo.orbital_data) continue
    const od = neo.orbital_data

    const sma = parseFloat(od.semi_major_axis)
    const ecc = parseFloat(od.eccentricity)
    const period = parseFloat(od.orbital_period)

    // Skip objects with invalid orbital data
    if (isNaN(sma) || isNaN(ecc) || isNaN(period) || sma <= 0 || period <= 0) continue
    if (ecc >= 1) continue // Skip hyperbolic orbits

    results.push({
      neo,
      orbit: {
        semiMajorAxis: sma,
        eccentricity: ecc,
        inclination: parseFloat(od.inclination) || 0,
        longitudeOfAscendingNode: parseFloat(od.ascending_node_longitude) || 0,
        argumentOfPerihelion: parseFloat(od.perihelion_argument) || 0,
        meanAnomaly: parseFloat(od.mean_anomaly) || 0,
        epoch: parseFloat(od.epoch_osculation) || 2451545.0,
        period,
      },
    })
  }

  return results.slice(0, 50) // Limit to 50 for performance
}

function computeNEOPosition(
  orbit: NEOWithOrbit['orbit'],
  jd: number
): [number, number, number] {
  const n = (2 * Math.PI) / orbit.period // rad/day
  const dt = jd - orbit.epoch
  const M = (orbit.meanAnomaly * DEG_TO_RAD + n * dt) % (2 * Math.PI)
  const E = solveKepler(M, orbit.eccentricity)
  const v = trueAnomalyFromEccentric(E, orbit.eccentricity)
  const r = orbit.semiMajorAxis * (1 - orbit.eccentricity * Math.cos(E))

  const xOrb = r * Math.cos(v)
  const yOrb = r * Math.sin(v)

  const Omega = orbit.longitudeOfAscendingNode * DEG_TO_RAD
  const omega = orbit.argumentOfPerihelion * DEG_TO_RAD
  const I = orbit.inclination * DEG_TO_RAD

  const cosO = Math.cos(Omega), sinO = Math.sin(Omega)
  const cosw = Math.cos(omega), sinw = Math.sin(omega)
  const cosI = Math.cos(I), sinI = Math.sin(I)

  const x = xOrb * (cosO * cosw - sinO * sinw * cosI) - yOrb * (cosO * sinw + sinO * cosw * cosI)
  const y = xOrb * (sinO * cosw + cosO * sinw * cosI) - yOrb * (sinO * sinw - cosO * cosw * cosI)
  const z = xOrb * (sinw * sinI) + yOrb * (cosw * sinI)

  return [x, y, z]
}

function diameterScale(neo: NEOData): number {
  const d = neo.estimated_diameter.kilometers
  const avgKm = (d.estimated_diameter_min + d.estimated_diameter_max) / 2
  // Scale: 0.01 km -> 0.04, 0.1 km -> 0.08, 1 km -> 0.16, 10 km -> 0.32
  return Math.max(0.03, Math.min(0.4, 0.08 + Math.log10(Math.max(avgKm, 0.001)) * 0.06))
}

function magnitudeEmissive(mag: number): number {
  // Linear scale: mag 20 = 0.2, mag 25 = 0.5, mag 30 = 0.8
  return Math.max(0.1, Math.min(1.0, 0.2 + (mag - 20) * 0.06))
}

function NEOMarker({ data, jd, scaleMode }: { data: NEOWithOrbit; jd: number; scaleMode: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const selectObject = useStore((s) => s.selectObject)
  const flyTo = useStore((s) => s.flyTo)

  const isHazardous = data.neo.is_potentially_hazardous_asteroid
  const color = isHazardous ? '#ff4444' : '#ffcc44'
  const emissiveColor = isHazardous ? '#ff0000' : '#ffaa00'

  const meshRadius = useMemo(() => diameterScale(data.neo), [data.neo])
  const emissiveIntensity = useMemo(() => magnitudeEmissive(data.neo.absolute_magnitude_h), [data.neo])

  const target: CelestialTarget = useMemo(() => ({
    id: `neo-${data.neo.id}`,
    name: data.neo.name.replace(/[()]/g, ''),
    type: 'asteroid',
  }), [data.neo.id, data.neo.name])

  useFrame(() => {
    if (!meshRef.current) return
    const [x, , z] = computeNEOPosition(data.orbit, jd)
    // y (ecliptic) goes to scene-z, z (ecliptic) goes to scene-y
    const [, ay, ] = computeNEOPosition(data.orbit, jd)
    meshRef.current.position.set(
      auToScene(x, scaleMode as 'compressed' | 'realistic'),
      auToScene(z, scaleMode as 'compressed' | 'realistic'),
      auToScene(ay, scaleMode as 'compressed' | 'realistic'),
    )
  })

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectObject(target)
    flyTo(target)
  }, [selectObject, flyTo, target])

  return (
    <mesh ref={meshRef} onClick={handleClick}>
      <sphereGeometry args={[meshRadius, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={emissiveColor}
        emissiveIntensity={emissiveIntensity}
        roughness={0.4}
      />
    </mesh>
  )
}

export function NEOAsteroids() {
  const { data: neoData } = useNEOFeed()
  const time = useStore((s) => s.time)
  const scaleMode = useStore((s) => s.scaleMode)
  const overlayOpen = useStore((s) => s.overlayOpen)

  const parsedNEOs = useMemo(() => {
    if (!neoData?.near_earth_objects) return []
    return parseNEOs(neoData.near_earth_objects)
  }, [neoData])

  const jd = dateToJulian(time.currentTime)

  if (parsedNEOs.length === 0) return null

  return (
    <group>
      {parsedNEOs.map((neo) => (
        <NEOMarker
          key={neo.neo.id}
          data={neo}
          jd={jd}
          scaleMode={scaleMode}
        />
      ))}
      {/* Legend label */}
      {!overlayOpen && parsedNEOs.length > 0 && (
        <Html position={[0, 5, 0]} center style={{ pointerEvents: 'none', opacity: 0 }}>
          <span />
        </Html>
      )}
    </group>
  )
}
