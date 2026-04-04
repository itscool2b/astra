import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { sunRadiusToScene } from '../../lib/scales'
import { bodyPositions } from '../../lib/bodyPositions'
import sunVertexShader from '../../lib/shaders/sun.vert'
import sunFragmentShader from '../../lib/shaders/sun.frag'
import coronaVertexShader from '../../lib/shaders/corona.vert'
import coronaFragmentShader from '../../lib/shaders/corona.frag'

export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null)
  const coronaRef = useRef<THREE.Mesh>(null)
  const outerCoronaRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const scaleMode = useStore((s) => s.scaleMode)

  const radius = sunRadiusToScene(scaleMode)
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

  return (
    <group position={[0, 0, 0]}>
      {/* Sun sphere */}
      <mesh ref={meshRef} material={sunMaterial}>
        <sphereGeometry args={[radius, 64, 64]} />
      </mesh>

      {/* Corona glow -billboard that always faces camera */}
      <Billboard>
        <mesh ref={coronaRef} material={coronaMaterial}>
          <planeGeometry args={[radius * 10, radius * 10]} />
        </mesh>
      </Billboard>

      {/* Outer corona -very faint, large outer glow */}
      <Billboard>
        <mesh ref={outerCoronaRef} material={outerCoronaMaterial}>
          <planeGeometry args={[radius * 16, radius * 16]} />
        </mesh>
      </Billboard>

      {/* Point light from the Sun -the sole light source */}
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
