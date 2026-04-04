import { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { SpacecraftInfo } from '../../data/spacecraft'
import { useStore, type CelestialTarget } from '../../store/useStore'
import { useSpacecraftPosition } from '../../api/hooks'
import { auToScene } from '../../lib/scales'
import { bodyPositions } from '../../lib/bodyPositions'

/* ------------------------------------------------------------------ */
/*  Per-spacecraft procedural models                                   */
/* ------------------------------------------------------------------ */

/** JWST -- hexagonal primary mirror + rectangular sunshield */
function JWSTModel({ radius }: { radius: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.15
    }
  })

  const mirrorSize = radius * 1.8
  const shieldWidth = mirrorSize * 1.3
  const shieldHeight = mirrorSize * 0.9

  return (
    <group ref={groupRef}>
      {/* Primary mirror -- flat hexagon */}
      <mesh position={[0, radius * 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[mirrorSize, mirrorSize, mirrorSize * 0.05, 6]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Sunshield -- flat plane below mirror, slightly tilted */}
      <mesh
        position={[0, -radius * 0.35, 0]}
        rotation={[0.15, 0, 0]}
      >
        <planeGeometry args={[shieldWidth, shieldHeight]} />
        <meshStandardMaterial
          color="#888888"
          emissive="#888888"
          emissiveIntensity={0.2}
          roughness={0.5}
          metalness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

/** Voyager -- dish antenna, central bus, RTG and magnetometer booms */
function VoyagerModel({ radius }: { radius: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.12
    }
  })

  const dishRadius = radius * 1.2
  const busSize = radius * 0.5
  const boomLength = radius * 2.0
  const boomRadius = radius * 0.06

  return (
    <group ref={groupRef}>
      {/* High-gain antenna dish -- cone pointing up */}
      <mesh position={[0, radius * 0.4, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[dishRadius, dishRadius * 0.5, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0.5}
        />
      </mesh>

      {/* Central bus -- small box */}
      <mesh position={[0, -radius * 0.1, 0]}>
        <boxGeometry args={[busSize, busSize, busSize]} />
        <meshStandardMaterial
          color="#444444"
          emissive="#444444"
          emissiveIntensity={0.3}
          roughness={0.6}
          metalness={0.5}
        />
      </mesh>

      {/* RTG boom -- thin cylinder extending to one side */}
      <mesh
        position={[boomLength * 0.5, -radius * 0.1, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[boomRadius, boomRadius, boomLength, 8]} />
        <meshStandardMaterial
          color="#555555"
          emissive="#555555"
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0.4}
        />
      </mesh>

      {/* Magnetometer boom -- thin cylinder extending opposite side */}
      <mesh
        position={[-boomLength * 0.5, -radius * 0.1, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[boomRadius, boomRadius, boomLength, 8]} />
        <meshStandardMaterial
          color="#555555"
          emissive="#555555"
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0.4}
        />
      </mesh>
    </group>
  )
}

/** TESS -- central body, two solar panels, camera module */
function TESSModel({ radius }: { radius: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.18
    }
  })

  const bodySize = radius * 0.7
  const panelWidth = radius * 1.4
  const panelHeight = radius * 0.8
  const cameraRadius = radius * 0.2
  const cameraHeight = radius * 0.4

  return (
    <group ref={groupRef}>
      {/* Central body -- small box */}
      <mesh>
        <boxGeometry args={[bodySize, bodySize, bodySize]} />
        <meshStandardMaterial
          color="#444444"
          emissive="#444444"
          emissiveIntensity={0.3}
          roughness={0.6}
          metalness={0.5}
        />
      </mesh>

      {/* Left solar panel */}
      <mesh position={[-(bodySize * 0.5 + panelWidth * 0.5), 0, 0]}>
        <planeGeometry args={[panelWidth, panelHeight]} />
        <meshStandardMaterial
          color="#1a2a6c"
          emissive="#1a2a6c"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Right solar panel */}
      <mesh position={[bodySize * 0.5 + panelWidth * 0.5, 0, 0]}>
        <planeGeometry args={[panelWidth, panelHeight]} />
        <meshStandardMaterial
          color="#1a2a6c"
          emissive="#1a2a6c"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Camera module -- small cylinder on top */}
      <mesh position={[0, bodySize * 0.5 + cameraHeight * 0.5, 0]}>
        <cylinderGeometry args={[cameraRadius, cameraRadius, cameraHeight, 8]} />
        <meshStandardMaterial
          color="#111111"
          emissive="#111111"
          emissiveIntensity={0.2}
          roughness={0.8}
          metalness={0.3}
        />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Spacecraft component                                               */
/* ------------------------------------------------------------------ */

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

  /** Pick the right procedural model based on spacecraft id */
  function renderModel() {
    switch (data.id) {
      case 'jwst':
        return <JWSTModel radius={radius} />
      case 'voyager1':
      case 'voyager2':
        return <VoyagerModel radius={radius} />
      case 'tess':
        return <TESSModel radius={radius} />
      default:
        // Fallback octahedron for any unknown spacecraft
        return (
          <mesh>
            <octahedronGeometry args={[radius, 0]} />
            <meshStandardMaterial
              color={data.color}
              emissive={data.color}
              emissiveIntensity={0.4}
              roughness={0.3}
              metalness={0.6}
            />
          </mesh>
        )
    }
  }

  return (
    <group ref={groupRef}>
      {/* Invisible interaction sphere -- ensures consistent click/hover area */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        visible={false}
      >
        <sphereGeometry args={[radius * 2.5, 8, 8]} />
        <meshBasicMaterial />
      </mesh>

      {/* Procedural spacecraft model */}
      {renderModel()}

      {/* Hover/selection glow */}
      {(hovered || isSelected) && (
        <mesh scale={1.8}>
          <sphereGeometry args={[radius, 16, 16]} />
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
