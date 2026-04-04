import { useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

/**
 * Procedural starfield skybox — no external texture dependency.
 * Creates a sphere of point stars with varying brightness and subtle color.
 */
export function Skybox() {
  const { scene } = useThree()

  const starGeometry = useMemo(() => {
    const count = 12000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Random point on sphere
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 5000 + Math.random() * 500

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      // Subtle color variation: white, blue-white, yellow-white
      const colorRoll = Math.random()
      if (colorRoll < 0.6) {
        // White
        colors[i * 3] = 0.9 + Math.random() * 0.1
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1
        colors[i * 3 + 2] = 0.95 + Math.random() * 0.05
      } else if (colorRoll < 0.8) {
        // Blue-white (hot stars)
        colors[i * 3] = 0.7 + Math.random() * 0.1
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.1
        colors[i * 3 + 2] = 1.0
      } else {
        // Yellow-white (cooler stars)
        colors[i * 3] = 1.0
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1
        colors[i * 3 + 2] = 0.6 + Math.random() * 0.2
      }

      // Varying sizes — most small, a few bright
      sizes[i] = Math.random() < 0.97 ? 0.5 + Math.random() * 1.5 : 2 + Math.random() * 3
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [])

  useEffect(() => {
    scene.background = new THREE.Color(0x000005)
  }, [scene])

  return (
    <points geometry={starGeometry}>
      <pointsMaterial
        vertexColors
        sizeAttenuation={false}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  )
}
