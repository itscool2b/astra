import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'

/**
 * Advances the simulation time based on playback speed.
 * Runs outside of R3F's frame loop since it's pure state.
 */
export function useTimeLoop() {
  const time = useStore((s) => s.time)
  const setTime = useStore((s) => s.setTime)
  const lastFrameTime = useRef(performance.now())

  useEffect(() => {
    if (!time.isPlaying) return

    let raf: number
    const tick = () => {
      const now = performance.now()
      const deltaSec = (now - lastFrameTime.current) / 1000
      lastFrameTime.current = now

      const msAdvance = deltaSec * time.playbackSpeed * 1000
      const newTime = new Date(time.currentTime.getTime() + msAdvance)

      // Clamp to 1900-2100 range
      const minTime = new Date(1900, 0, 1)
      const maxTime = new Date(2100, 11, 31)
      if (newTime >= minTime && newTime <= maxTime) {
        setTime(newTime)
      }

      raf = requestAnimationFrame(tick)
    }

    lastFrameTime.current = performance.now()
    raf = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(raf)
  }, [time.isPlaying, time.playbackSpeed, time.currentTime, setTime])
}
