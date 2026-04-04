import { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { MoonData } from '../../data/types'
import { useStore, type CelestialTarget } from '../../store/useStore'
import { dateToJulian } from '../../lib/orbital'
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

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
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
