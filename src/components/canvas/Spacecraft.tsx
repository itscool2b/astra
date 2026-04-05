import { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { SpacecraftInfo } from '../../data/spacecraft'
import { useStore, type CelestialTarget } from '../../store/useStore'
import { useSpacecraftPosition } from '../../api/hooks'
import { auToScene } from '../../lib/scales'
import { bodyPositions } from '../../lib/bodyPositions'
import { PLANETS } from '../../data/planets'

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

/** Parker Solar Probe -- flat disc heat shield + small box body behind it */
function ParkerModel({ radius }: { radius: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.2
    }
  })

  const shieldRadius = radius * 1.4
  const bodySize = radius * 0.5

  return (
    <group ref={groupRef}>
      {/* Heat shield -- flat disc facing forward */}
      <mesh position={[0, radius * 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[shieldRadius, shieldRadius, shieldRadius * 0.04, 24]} />
        <meshStandardMaterial
          color="#ff6600"
          emissive="#ff6600"
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Spacecraft body -- small box behind the shield */}
      <mesh position={[0, -radius * 0.3, 0]}>
        <boxGeometry args={[bodySize, bodySize * 1.2, bodySize]} />
        <meshStandardMaterial
          color="#444444"
          emissive="#444444"
          emissiveIntensity={0.3}
          roughness={0.6}
          metalness={0.5}
        />
      </mesh>
    </group>
  )
}

/** Juno -- central cylinder + 3 rectangular solar panels at 120-degree spacing */
function JunoModel({ radius }: { radius: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.25
    }
  })

  const bodyRadius = radius * 0.4
  const bodyHeight = radius * 0.8
  const panelWidth = radius * 1.8
  const panelHeight = radius * 0.5

  return (
    <group ref={groupRef}>
      {/* Central cylinder body */}
      <mesh>
        <cylinderGeometry args={[bodyRadius, bodyRadius, bodyHeight, 12]} />
        <meshStandardMaterial
          color="#555555"
          emissive="#555555"
          emissiveIntensity={0.3}
          roughness={0.5}
          metalness={0.6}
        />
      </mesh>

      {/* 3 solar panels at 120-degree intervals */}
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(angle) * (bodyRadius + panelWidth * 0.5),
            0,
            Math.sin(angle) * (bodyRadius + panelWidth * 0.5),
          ]}
          rotation={[0, -angle, 0]}
        >
          <planeGeometry args={[panelWidth, panelHeight]} />
          <meshStandardMaterial
            color="#99cc33"
            emissive="#99cc33"
            emissiveIntensity={0.4}
            roughness={0.3}
            metalness={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

/** New Horizons -- flat triangular prism body + cone dish on top */
function NewHorizonsModel({ radius }: { radius: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.14
    }
  })

  const bodySize = radius * 0.8
  const dishRadius = radius * 0.6
  const dishHeight = radius * 0.5

  return (
    <group ref={groupRef}>
      {/* Flat triangular prism body */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[bodySize, bodySize, bodySize * 0.2, 3]} />
        <meshStandardMaterial
          color="#444444"
          emissive="#444444"
          emissiveIntensity={0.3}
          roughness={0.5}
          metalness={0.6}
        />
      </mesh>

      {/* Dish cone on top */}
      <mesh position={[0, radius * 0.4, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[dishRadius, dishHeight, 16]} />
        <meshStandardMaterial
          color="#cc88ff"
          emissive="#cc88ff"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
    </group>
  )
}

/** OSIRIS-APEX -- box body + 2 extending solar panel planes + small sphere on arm */
function OSIRISAPEXModel({ radius }: { radius: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.16
    }
  })

  const bodySize = radius * 0.6
  const panelWidth = radius * 1.3
  const panelHeight = radius * 0.6
  const armLength = radius * 1.0
  const armRadius = radius * 0.05
  const capsuleRadius = radius * 0.2

  return (
    <group ref={groupRef}>
      {/* Box body */}
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

      {/* Sample arm -- thin cylinder extending upward */}
      <mesh
        position={[0, bodySize * 0.5 + armLength * 0.5, 0]}
      >
        <cylinderGeometry args={[armRadius, armRadius, armLength, 8]} />
        <meshStandardMaterial
          color="#555555"
          emissive="#555555"
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0.4}
        />
      </mesh>

      {/* Sample capsule sphere at end of arm */}
      <mesh position={[0, bodySize * 0.5 + armLength + capsuleRadius, 0]}>
        <sphereGeometry args={[capsuleRadius, 12, 12]} />
        <meshStandardMaterial
          color="#ff4488"
          emissive="#ff4488"
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.5}
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
  const velocityLineRef = useRef<THREE.Line>(null)
  const [hovered, setHovered] = useState(false)

  const scaleMode = useStore((s) => s.scaleMode)
  const selectObject = useStore((s) => s.selectObject)
  const flyTo = useStore((s) => s.flyTo)
  const selectedObject = useStore((s) => s.selectedObject)
  const setHoveredObject = useStore((s) => s.setHoveredObject)
  const overlayOpen = useStore((s) => s.overlayOpen)

  const { data: position } = useSpacecraftPosition(data.horizonsId)

  const isSelected = selectedObject?.id === data.id
  const radius = scaleMode === 'realistic' ? 0.8 : 0.12

  const target: CelestialTarget = useMemo(
    () => ({ id: data.id, name: data.name, type: 'spacecraft' }),
    [data.id, data.name]
  )

  // Geometry for velocity direction line (2 points)
  const velocityGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const positions = new Float32Array(6) // 2 points x 3 components
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geom
  }, [])

  const velocityMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.3,
    })
  }, [data.color])

  useFrame(() => {
    if (!groupRef.current || !position) return

    groupRef.current.position.set(
      auToScene(position.x, scaleMode),
      auToScene(position.z, scaleMode), // ecliptic Z -> scene Y
      auToScene(position.y, scaleMode)  // ecliptic Y -> scene Z
    )

    // Push spacecraft outside any planet it overlaps with (e.g. TESS inside exaggerated Earth)
    for (const planet of PLANETS) {
      const planetPos = bodyPositions.get(planet.id)
      if (!planetPos) continue
      const planetRadius = bodyPositions.getRadius(planet.id)
      const dist = groupRef.current.position.distanceTo(planetPos)
      if (dist < planetRadius * 1.5) {
        const dir = groupRef.current.position.clone().sub(planetPos)
        if (dir.length() < 0.001) dir.set(1, 0, 0)
        dir.normalize()
        groupRef.current.position.copy(planetPos).addScaledVector(dir, planetRadius * 1.6)
        // Scale spacecraft to be small relative to the planet
        const scaleVal = planetRadius * 0.08
        groupRef.current.scale.setScalar(scaleVal / radius)
      }
    }

    bodyPositions.set(data.id, groupRef.current.position, radius)

    // Update velocity direction line
    if (velocityLineRef.current && position.speed > 0) {
      const posAttr = velocityGeom.getAttribute('position') as THREE.BufferAttribute
      // Start at origin (relative to group)
      posAttr.setXYZ(0, 0, 0, 0)
      // End: normalized velocity * visual length, mapped to scene coords
      const len = radius * 4
      const invSpeed = 1 / position.speed
      posAttr.setXYZ(1,
        position.vx * invSpeed * len,
        position.vz * invSpeed * len,  // ecliptic Z -> scene Y
        position.vy * invSpeed * len,  // ecliptic Y -> scene Z
      )
      posAttr.needsUpdate = true
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
      case 'parker':
        return <ParkerModel radius={radius} />
      case 'juno':
        return <JunoModel radius={radius} />
      case 'newhorizons':
        return <NewHorizonsModel radius={radius} />
      case 'osirisapex':
        return <OSIRISAPEXModel radius={radius} />
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

      {/* Velocity direction line */}
      <primitive object={new THREE.Line(velocityGeom, velocityMaterial)} ref={velocityLineRef} />

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
      {!overlayOpen && (
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
      )}
    </group>
  )
}
