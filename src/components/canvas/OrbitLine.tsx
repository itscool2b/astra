import { useMemo } from 'react'
import * as THREE from 'three'
import type { OrbitalElements } from '../../data/types'
import { computeOrbitPath } from '../../lib/orbital'
import { auToScene } from '../../lib/scales'
import { useStore } from '../../store/useStore'

interface OrbitLineProps {
  orbit: OrbitalElements
  color: string
  opacity?: number
}

export function OrbitLine({ orbit, color, opacity = 0.2 }: OrbitLineProps) {
  const scaleMode = useStore((s) => s.scaleMode)

  const lineObj = useMemo(() => {
    const orbitPoints = computeOrbitPath(orbit, 256)
    const points = orbitPoints.map(
      ([x, y, z]) =>
        new THREE.Vector3(
          auToScene(x, scaleMode),
          auToScene(z, scaleMode), // ecliptic Z -> scene Y
          auToScene(y, scaleMode)  // ecliptic Y -> scene Z
        )
    )
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    })
    return new THREE.Line(geometry, material)
  }, [orbit, scaleMode, color, opacity])

  return <primitive object={lineObj} />
}
