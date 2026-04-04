import { useMemo } from 'react'
import * as THREE from 'three'
import atmosphereVertexShader from '../../lib/shaders/atmosphere.vert'
import atmosphereFragmentShader from '../../lib/shaders/atmosphere.frag'

interface AtmosphereProps {
  radius: number
  color?: string
  intensity?: number
  power?: number
  scale?: number
}

export function Atmosphere({
  radius,
  color = '#4a90d9',
  intensity = 1.0,
  power = 3.0,
  scale = 1.12,
}: AtmosphereProps) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        uniforms: {
          uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
          uAtmosphereColor: { value: new THREE.Color(color) },
          uAtmosphereIntensity: { value: intensity },
          uAtmospherePower: { value: power },
        },
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [color, intensity, power]
  )

  return (
    <mesh material={material} scale={scale}>
      <sphereGeometry args={[radius, 64, 64]} />
    </mesh>
  )
}
