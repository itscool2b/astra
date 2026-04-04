import { useRef, useMemo, useState, useCallback } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Billboard, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useStore, type CelestialTarget } from '../../store/useStore'
import { sunRadiusToScene } from '../../lib/scales'
import { bodyPositions } from '../../lib/bodyPositions'
import sunVertexShader from '../../lib/shaders/sun.vert'
import sunFragmentShader from '../../lib/shaders/sun.frag'
import coronaVertexShader from '../../lib/shaders/corona.vert'
import coronaFragmentShader from '../../lib/shaders/corona.frag'

const SUN_TARGET: CelestialTarget = { id: 'sun', name: 'Sun', type: 'star' }

export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null)
  const coronaRef = useRef<THREE.Mesh>(null)
  const outerCoronaRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const [hovered, setHovered] = useState(false)

  const scaleMode = useStore((s) => s.scaleMode)
  const selectObject = useStore((s) => s.selectObject)
  const flyTo = useStore((s) => s.flyTo)
  const selectedObject = useStore((s) => s.selectedObject)
  const setHoveredObject = useStore((s) => s.setHoveredObject)
  const overlayOpen = useStore((s) => s.overlayOpen)

  const radius = sunRadiusToScene(scaleMode)
  const isSelected = selectedObject?.id === 'sun'
  bodyPositions.set('sun', new THREE.Vector3(0, 0, 0), radius)

  const sunMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: sunVertexShader,
        fragmentShader: sunFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uColor1: { value: new THREE.Color('#ff4500') },
          uColor2: { value: new THREE.Color('#ff8c00') },
          uColor3: { value: new THREE.Color('#fffacd') },
        },
      }),
    []
  )

  const coronaMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coronaVertexShader,
        fragmentShader: coronaFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0.6 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  )

  const outerCoronaMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coronaVertexShader,
        fragmentShader: coronaFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0.25 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    sunMaterial.uniforms.uTime.value = t
    coronaMaterial.uniforms.uTime.value = t
    outerCoronaMaterial.uniforms.uTime.value = t

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.02
    }
  })

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      selectObject(SUN_TARGET)
      flyTo(SUN_TARGET)
    },
    [selectObject, flyTo]
  )

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setHovered(true)
      setHoveredObject('sun')
      document.body.style.cursor = 'pointer'
    },
    [setHoveredObject]
  )

  const handlePointerOut = useCallback(() => {
    setHovered(false)
    setHoveredObject(null)
    document.body.style.cursor = 'auto'
  }, [setHoveredObject])

  return (
    <group position={[0, 0, 0]}>
      {/* Sun sphere (clickable) */}
      <mesh
        ref={meshRef}
        material={sunMaterial}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[radius, 64, 64]} />
      </mesh>

      {/* Name label */}
      {!overlayOpen && (
        <Html
          position={[0, radius * 1.8, 0]}
          center
          style={{
            color: '#fffacd',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textShadow: '0 0 12px rgba(255,170,0,0.6)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            opacity: hovered || isSelected ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}
        >
          Sun
        </Html>
      )}

      {/* Corona glow */}
      <Billboard>
        <mesh ref={coronaRef} material={coronaMaterial}>
          <planeGeometry args={[radius * 8, radius * 8]} />
        </mesh>
      </Billboard>

      {/* Outer corona */}
      <Billboard>
        <mesh ref={outerCoronaRef} material={outerCoronaMaterial}>
          <planeGeometry args={[radius * 14, radius * 14]} />
        </mesh>
      </Billboard>

      {/* Point light */}
      <pointLight
        ref={lightRef}
        color="#fff5e6"
        intensity={5}
        distance={0}
        decay={0}
        castShadow={false}
      />
    </group>
  )
}
