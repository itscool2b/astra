import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEONET } from '../../api/hooks'
import { bodyPositions } from '../../lib/bodyPositions'
import { useRef } from 'react'

interface EarthMarkersProps {
  radius: number
}

const DEG_TO_RAD = Math.PI / 180

function getCategoryColor(categories: { id: string; title: string }[]): string {
  const title = (categories[0]?.title ?? '').toLowerCase()
  if (title.includes('wildfire') || title.includes('fire')) return '#ff3333'
  if (title.includes('volcan')) return '#ff8800'
  if (title.includes('storm') || title.includes('cyclon') || title.includes('hurricane') || title.includes('typhoon')) return '#4488ff'
  return '#ffffff'
}

function latLonToPosition(
  lat: number,
  lon: number,
  radius: number
): THREE.Vector3 {
  const phi = (90 - lat) * DEG_TO_RAD
  const theta = (lon + 180) * DEG_TO_RAD

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

export function EarthMarkers({ radius }: EarthMarkersProps) {
  const { data: events } = useEONET()
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const visibleRef = useRef(false)

  // Check camera distance to Earth each frame
  useFrame(() => {
    if (!groupRef.current) return
    const earthPos = bodyPositions.get('earth')
    if (!earthPos) return
    const dist = camera.position.distanceTo(earthPos)
    // Only show markers when camera is within ~15 radii of Earth
    const threshold = radius * 15
    visibleRef.current = dist < threshold
    groupRef.current.visible = visibleRef.current
  })

  const markers = useMemo(() => {
    if (!events) return []
    return events
      .filter((e) => e.geometry.length > 0)
      .slice(0, 40)
      .map((evt) => {
        // geometry.coordinates is [lon, lat]
        const coords = evt.geometry[evt.geometry.length - 1].coordinates
        const [lon, lat] = coords
        const pos = latLonToPosition(lat, lon, radius * 1.02)
        const color = getCategoryColor(evt.categories)
        return { id: evt.id, position: pos, color, title: evt.title }
      })
  }, [events, radius])

  const migrationLines = useMemo(() => {
    if (!events) return []
    return events
      .filter((e) => e.geometry.length > 1)
      .slice(0, 40)
      .map((evt) => {
        const color = getCategoryColor(evt.categories)
        const points = evt.geometry.map((g) => {
          const [lon, lat] = g.coordinates
          return latLonToPosition(lat, lon, radius * 1.025)
        })
        return { id: evt.id, points, color }
      })
  }, [events, radius])

  if (markers.length === 0) return null

  return (
    <group ref={groupRef}>
      {markers.map((marker) => (
        <mesh key={marker.id} position={marker.position}>
          <sphereGeometry args={[radius * 0.015, 6, 6]} />
          <meshBasicMaterial
            color={marker.color}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
      {migrationLines.map((line) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(line.points)
        const material = new THREE.LineBasicMaterial({ color: line.color, transparent: true, opacity: 0.6 })
        const lineObj = new THREE.Line(geometry, material)
        return (
          <primitive key={`line-${line.id}`} object={lineObj} />
        )
      })}
    </group>
  )
}
