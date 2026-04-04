import { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { SpacecraftInfo } from '../../data/spacecraft'
import { useStore, type CelestialTarget } from '../../store/useStore'
import { useSpacecraftPosition } from '../../api/hooks'
import { auToScene } from '../../lib/scales'
import { bodyPositions } from '../../lib/bodyPositions'

interface SpacecraftProps {
  data: SpacecraftInfo
}

export function Spacecraft({ data }: SpacecraftProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  const scaleMode = useStore((s) => s.scaleMode)
  const selectObject = useStore((s) => s.selectObject)
  const flyTo = useStore((s) => s.flyTo)
  const selectedObject = useStore((s) => s.selectedObject)
  const setHoveredObject = useStore((s) => s.setHoveredObject)

  const { data: position } = useSpacecraftPosition(data.horizonsId)

  const isSelected = selectedObject?.id === data.id
  const radius = 0.12 // Fixed small size for spacecraft

  const target: CelestialTarget = useMemo(
    () => ({ id: data.id, name: data.name, type: 'spacecraft' }),
    [data.id, data.name]
  )

  useFrame(() => {
    if (!groupRef.current || !position) return

    groupRef.current.position.set(
      auToScene(position.x, scaleMode),
      auToScene(position.z, scaleMode), // ecliptic Z -> scene Y
      auToScene(position.y, scaleMode)  // ecliptic Y -> scene Z
    )

    bodyPositions.set(data.id, groupRef.current.position, radius)
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

  if (!position) return null

  return (
    <group ref={groupRef}>
      {/* Octahedron shape -- visually distinct from planet spheres */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <octahedronGeometry args={[radius, 0]} />
        <meshStandardMaterial
          color={data.color}
          emissive={data.color}
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Hover/selection glow */}
      {(hovered || isSelected) && (
        <mesh scale={1.4}>
          <octahedronGeometry args={[radius, 0]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={isSelected ? 0.2 : 0.1}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Name label */}
      <Html
        position={[0, radius * 2.5, 0]}
        center
        style={{
          color: 'white',
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.5px',
          textShadow: '0 0 6px rgba(0,0,0,0.9)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          opacity: hovered || isSelected ? 1 : 0.5,
          transition: 'opacity 0.2s',
        }}
      >
        {data.name}
      </Html>
    </group>
  )
}
