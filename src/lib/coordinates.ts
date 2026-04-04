import * as THREE from 'three'
import { OrbitalElements } from '../data/types'
import { computePosition } from './orbital'
import { auToScene, radiusToScene } from './scales'
import { ScaleMode } from '../store/useStore'

/**
 * Get a Three.js Vector3 position for a body at a given time.
 */
export function getBodyPosition(
  orbit: OrbitalElements,
  time: Date,
  scaleMode: ScaleMode,
  parentPosition?: THREE.Vector3
): THREE.Vector3 {
  const jd = time.getTime() / 86400000 + 2440587.5
  const [x, y, z] = computePosition(orbit, jd)

  // Convert from ecliptic AU to scene coordinates
  const sx = auToScene(x, scaleMode)
  const sy = auToScene(z, scaleMode) // ecliptic Z -> scene Y (up)
  const sz = auToScene(y, scaleMode) // ecliptic Y -> scene Z

  const pos = new THREE.Vector3(sx, sy, sz)

  if (parentPosition) {
    pos.add(parentPosition)
  }

  return pos
}

/**
 * Compute the rotation angle of a body around its axis at a given time.
 * Returns radians.
 */
export function getBodyRotation(
  rotationPeriodHours: number,
  time: Date
): number {
  const hours = time.getTime() / 3600000
  const rotationsCompleted = hours / Math.abs(rotationPeriodHours)
  const sign = rotationPeriodHours < 0 ? -1 : 1
  return (rotationsCompleted * 2 * Math.PI * sign) % (2 * Math.PI)
}
