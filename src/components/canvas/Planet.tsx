import { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { PlanetData } from '../../data/types'
import { useStore, type CelestialTarget } from '../../store/useStore'
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
      auToScene(z, scaleMode), // ecliptic Z -> scene Y
      auToScene(y, scaleMode)  // ecliptic Y -> scene Z
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
