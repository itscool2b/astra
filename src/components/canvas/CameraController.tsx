import { useRef, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { bodyPositions } from '../../lib/bodyPositions'

// Cubic bezier easing for cinematic fly-to
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function CameraController() {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()

  const cameraTarget = useStore((s) => s.cameraTarget)
  const isFlyingTo = useStore((s) => s.isFlyingTo)
  const setIsFlyingTo = useStore((s) => s.setIsFlyingTo)

  // Fly-to animation state
  const flyState = useRef({
    active: false,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    controlPoint: new THREE.Vector3(),
    progress: 0,
    duration: 2.5, // seconds
  })

  // Idle drift state
  const idleTimer = useRef(0)
  const isIdle = useRef(false)

  // Trigger fly-to when cameraTarget changes
  useEffect(() => {
    if (!cameraTarget || !isFlyingTo) return

    const targetPos = bodyPositions.get(cameraTarget.id)
    if (!targetPos || (targetPos.x === 0 && targetPos.y === 0 && targetPos.z === 0 && cameraTarget.type !== 'star')) {
      // Position not registered yet, skip
      setIsFlyingTo(false)
      return
    }

    const targetRadius = bodyPositions.getRadius(cameraTarget.id)
    // Orbit distance: larger for bigger objects, minimum 3 units so camera doesn't clip
    const orbitDist = Math.max(targetRadius * 6, 5)

    const fs = flyState.current
    fs.active = true
    fs.progress = 0
    fs.startPos.copy(camera.position)
    fs.startTarget.copy(controlsRef.current?.target || new THREE.Vector3())
    fs.endTarget.copy(targetPos)

    // End position: approach from a consistent angle (slightly above and to the side)
    const dir = new THREE.Vector3().subVectors(camera.position, targetPos)
    if (dir.length() < 0.01) dir.set(1, 0.5, 1) // avoid zero-length direction
    dir.normalize()
    fs.endPos.copy(targetPos).add(dir.multiplyScalar(orbitDist))

    // Control point: arc above for a swooping path
    const travel = fs.startPos.distanceTo(fs.endPos)
    fs.controlPoint.lerpVectors(fs.startPos, fs.endPos, 0.5)
    fs.controlPoint.y += Math.max(travel * 0.2, 5)

    // Scale duration to travel distance (faster for short hops, slower for long ones)
    fs.duration = Math.min(Math.max(travel * 0.02, 1.5), 3.5)
  }, [cameraTarget, isFlyingTo, camera, setIsFlyingTo])

  useFrame((_, delta) => {
    const fs = flyState.current

    if (fs.active) {
      fs.progress += delta / fs.duration
      const t = easeInOutCubic(Math.min(fs.progress, 1))

      // Quadratic bezier curve for swooping arc
      const p0 = fs.startPos
      const p1 = fs.controlPoint
      const p2 = fs.endPos

      camera.position.set(
        (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
        (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y,
        (1 - t) * (1 - t) * p0.z + 2 * (1 - t) * t * p1.z + t * t * p2.z
      )

      // Interpolate look-at target
      if (controlsRef.current) {
        const target = controlsRef.current.target
        target.lerpVectors(fs.startTarget, fs.endTarget, t)
      }

      if (fs.progress >= 1) {
        fs.active = false
        setIsFlyingTo(false)
      }

      idleTimer.current = 0
      isIdle.current = false
    } else {
      // Idle drift -subtle auto-orbit when user isn't interacting
      idleTimer.current += delta
      if (idleTimer.current > 10 && controlsRef.current) {
        isIdle.current = true
        controlsRef.current.autoRotate = true
        controlsRef.current.autoRotateSpeed = 0.15
      }
    }

    controlsRef.current?.update()
  })

  const handleInteraction = useCallback(() => {
    idleTimer.current = 0
    if (isIdle.current && controlsRef.current) {
      controlsRef.current.autoRotate = false
      isIdle.current = false
    }
  }, [])

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={0.1}
      maxDistance={50000}
      enablePan
      zoomSpeed={1.2}
      rotateSpeed={0.5}
      onStart={handleInteraction}
      makeDefault
    />
  )
}
