import { useRef, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'

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

    // We need to resolve the target position — for now, use a placeholder
    // This will be connected to the actual body positions later
    const targetPos = new THREE.Vector3(0, 0, 0) // will be replaced

    const fs = flyState.current
    fs.active = true
    fs.progress = 0
    fs.startPos.copy(camera.position)
    fs.startTarget.copy(controlsRef.current?.target || new THREE.Vector3())
    fs.endTarget.copy(targetPos)

    // End position: orbit the target at a nice distance
    const dir = new THREE.Vector3().subVectors(camera.position, targetPos).normalize()
    fs.endPos.copy(targetPos).add(dir.multiplyScalar(10))

    // Control point: arc above for a swooping path
    fs.controlPoint.lerpVectors(fs.startPos, fs.endPos, 0.5)
    fs.controlPoint.y += Math.max(
      fs.startPos.distanceTo(fs.endPos) * 0.3,
      20
    )
  }, [cameraTarget, isFlyingTo, camera])

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
      // Idle drift — subtle auto-orbit when user isn't interacting
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
      minDistance={0.5}
      maxDistance={5000}
      enablePan
      zoomSpeed={1.2}
      rotateSpeed={0.5}
      onStart={handleInteraction}
      makeDefault
    />
  )
}
