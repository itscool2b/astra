import { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useStore, type CelestialTarget } from '../../store/useStore'
import { useISSPosition } from '../../api/hooks'
import { bodyPositions } from '../../lib/bodyPositions'

const DEG_TO_RAD = Math.PI / 180

function latLonToPosition(lat: number, lon: number, radius: number, altitude: number = 0.02) {
  const phi = (90 - lat) * DEG_TO_RAD
  const theta = (lon + 180) * DEG_TO_RAD
  const r = radius + altitude
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  )
}

interface ISSProps {
  radius: number
}

export function ISS({ radius }: ISSProps) {
  const { data: issData } = useISSPosition()
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const visibleRef = useRef(false)
  const [hovered, setHovered] = useState(false)

  const selectObject = useStore((s) => s.selectObject)
  const flyTo = useStore((s) => s.flyTo)
  const selectedObject = useStore((s) => s.selectedObject)
  const setHoveredObject = useStore((s) => s.setHoveredObject)

  const isSelected = selectedObject?.id === 'iss'
  const issSize = radius * 0.012

  const target: CelestialTarget = useMemo(
    () => ({ id: 'iss', name: 'ISS', type: 'spacecraft' }),
    []
  )

  useFrame(() => {
    if (!groupRef.current || !issData) return

    const lat = parseFloat(issData.iss_position.latitude)
    const lon = parseFloat(issData.iss_position.longitude)
    const pos = latLonToPosition(lat, lon, radius, radius * 0.04)

    groupRef.current.position.copy(pos)
    bodyPositions.set('iss', groupRef.current.position, issSize)

    // Only show when camera is near Earth
    const earthPos = bodyPositions.get('earth')
    if (!earthPos) return
    const dist = camera.position.distanceTo(earthPos)
    const threshold = radius * 15
    visibleRef.current = dist < threshold
    groupRef.current.visible = visibleRef.current
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
      setHoveredObject('iss')
      document.body.style.cursor = 'pointer'
    },
    [setHoveredObject]
  )

  const handlePointerOut = useCallback(() => {
    setHovered(false)
    setHoveredObject(null)
    document.body.style.cursor = 'auto'
  }, [setHoveredObject])

  if (!issData) return null

  return (
    <group ref={groupRef}>
      {/* Invisible interaction sphere */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        visible={false}
      >
        <sphereGeometry args={[issSize * 4, 8, 8]} />
        <meshBasicMaterial />
      </mesh>

      {/* ISS cross/plus shape - horizontal bar */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[issSize * 0.3, issSize * 3, issSize * 0.3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* ISS cross/plus shape - vertical bar */}
      <mesh>
        <boxGeometry args={[issSize * 0.3, issSize * 3, issSize * 0.3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Emissive glow */}
      <mesh>
        <sphereGeometry args={[issSize * 1.2, 8, 8]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Hover/selection glow */}
      {(hovered || isSelected) && (
        <mesh scale={2.5}>
          <sphereGeometry args={[issSize, 12, 12]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={isSelected ? 0.2 : 0.1}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Name label */}
      <Html
        position={[0, issSize * 4, 0]}
        center
        style={{
          color: 'white',
          fontSize: '9px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          textShadow: '0 0 6px rgba(0,0,0,0.9)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          opacity: hovered || isSelected ? 1 : 0.6,
          transition: 'opacity 0.2s',
        }}
      >
        ISS
      </Html>
    </group>
  )
}
