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
