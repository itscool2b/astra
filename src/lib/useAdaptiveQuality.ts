import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import type { QualityTier } from '../store/useStore'

/**
 * Monitors FPS and adjusts quality tier automatically.
 * - Starts at 'high' on desktop, 'low' on mobile
 * - If FPS drops below 25 for 3 seconds, drops a tier
 * - If FPS stays above 55 for 3 seconds, raises a tier
 */
export function useAdaptiveQuality() {
  const setQuality = useStore((s) => s.setQuality)
  const quality = useStore((s) => s.quality)
  const frameTimesRef = useRef<number[]>([])
  const lastCheckRef = useRef(0)

  useEffect(() => {
    // Set initial quality based on device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)
    if (isMobile) {
      setQuality('low')
      return
    }

    // Check WebGL capabilities
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        // Integrated GPUs get medium
        if (/Intel|Mesa|Integrated/i.test(renderer)) {
          setQuality('medium')
          return
        }
      }
    }

    setQuality('high')
  }, [setQuality])

  // FPS monitoring loop
  useEffect(() => {
    let raf: number
    const tiers: QualityTier[] = ['low', 'medium', 'high']

    const tick = () => {
      const now = performance.now()
      frameTimesRef.current.push(now)

      // Keep last 60 frame times
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift()
      }

      // Check every 3 seconds
      if (now - lastCheckRef.current > 3000) {
        lastCheckRef.current = now
        const times = frameTimesRef.current
        if (times.length > 10) {
          const avgFrameTime = (times[times.length - 1] - times[0]) / (times.length - 1)
          const fps = 1000 / avgFrameTime

          const currentIdx = tiers.indexOf(quality)
          if (fps < 25 && currentIdx > 0) {
            setQuality(tiers[currentIdx - 1])
          } else if (fps > 55 && currentIdx < 2) {
            setQuality(tiers[currentIdx + 1])
          }
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [quality, setQuality])
}
