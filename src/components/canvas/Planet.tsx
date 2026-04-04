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

function useTextureAsync(path: string | undefined): THREE.Texture | null {
  return useMemo(() => {
    if (!path) return null
    try {
      return textureLoader.load(`/textures/${path}`)
    } catch {
      return null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])
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

  const radius = radiusToScene(data.physical.radius, scaleMode)
  const isSelected = selectedObject?.id === data.id

  // Load textures
  const albedoTex = useTextureAsync(data.textureSet.albedo)
  const normalTex = useTextureAsync(data.textureSet.normal)
  const cloudsTex = useTextureAsync(data.textureSet.clouds)
  const nightTex = useTextureAsync(data.textureSet.night)

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

    // Rotate Earth's cloud layer slightly faster for visual effect
    if (cloudRef.current && meshRef.current) {
      cloudRef.current.rotation.y = meshRef.current.rotation.y * 1.03
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
  const materialColor = albedoTex ? '#ffffff' : data.color

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
            color={materialColor}
            map={albedoTex}
            normalMap={normalTex}
            emissiveMap={nightTex}
            emissive={nightTex ? '#ffffff' : '#000000'}
            emissiveIntensity={nightTex ? 0.6 : 0}
            roughness={
              data.type === 'terrestrial' ? 0.9 :
              data.type === 'gas-giant' ? 0.4 :
              data.type === 'ice-giant' ? 0.5 :
              0.8
            }
            metalness={
              data.type === 'gas-giant' ? 0.15 :
              data.type === 'ice-giant' ? 0.1 :
              0.1
            }
          />
        </mesh>

        {/* Earth cloud layer */}
        {data.id === 'earth' && cloudsTex && (
          <mesh
            ref={cloudRef}
            rotation={[data.physical.axialTilt * (Math.PI / 180), 0, 0]}
          >
            <sphereGeometry args={[radius * 1.01, 64, 64]} />
            <meshStandardMaterial
              map={cloudsTex}
              transparent
              opacity={0.35}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Atmosphere */}
        {data.atmosphere && (
          <Atmosphere
            radius={radius}
            color={
              data.id === 'earth' ? '#4a90d9' :
              data.id === 'venus' ? '#e8b86a' :
              data.id === 'mars' ? '#c47040' :
              data.id === 'jupiter' || data.id === 'saturn' ? '#c4a882' :
              data.id === 'uranus' ? '#7ec8e3' :
              data.id === 'neptune' ? '#3f54ba' :
              '#aaaaaa'
            }
            intensity={data.id === 'earth' ? 1.5 : data.id === 'venus' ? 1.5 : 0.6}
            power={data.id === 'venus' ? 2.0 : 3.0}
          />
        )}

        {/* Ring system */}
        {data.hasRings && data.ringInnerRadius && data.ringOuterRadius && (
          <Rings
            innerRadius={radius * data.ringInnerRadius}
            outerRadius={radius * data.ringOuterRadius}
            color={data.color}
            opacity={data.id === 'saturn' ? 0.6 : 0.2}
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
      {MOONS_BY_PARENT.get(data.id)?.map((moon) => (
        <Moon key={moon.id} data={moon} parentPosition={positionRef.current} />
      ))}
    </>
  )
}
