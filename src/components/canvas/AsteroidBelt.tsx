import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { auToScene } from '../../lib/scales'

const ASTEROID_COUNT = 3000
const BELT_INNER_AU = 2.1
const BELT_OUTER_AU = 3.3
const BELT_HEIGHT_AU = 0.15

export function AsteroidBelt() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const scaleMode = useStore((s) => s.scaleMode)

  // Pre-compute random orbital parameters for each asteroid
  const asteroidData = useMemo(() => {
    const data = []
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      const distance = BELT_INNER_AU + Math.random() * (BELT_OUTER_AU - BELT_INNER_AU)
      const angle = Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * BELT_HEIGHT_AU
      const speed = 0.0001 + Math.random() * 0.0002
      const size = 0.01 + Math.random() * 0.04
      data.push({ distance, angle, height, speed, size })
    }
    return data
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()

    for (let i = 0; i < ASTEROID_COUNT; i++) {
      const { distance, angle, height, speed, size } = asteroidData[i]
      const a = angle + t * speed

      const x = Math.cos(a) * distance
      const z = Math.sin(a) * distance
      const y = height

      dummy.position.set(
        auToScene(x, scaleMode),
        auToScene(y, scaleMode),
        auToScene(z, scaleMode)
      )
      dummy.scale.setScalar(size)
      dummy.rotation.set(t * speed * 10, t * speed * 7, 0)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, ASTEROID_COUNT]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#888" roughness={0.95} metalness={0.1} />
    </instancedMesh>
  )
}
