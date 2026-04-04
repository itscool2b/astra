import { useEffect } from 'react'
import { useStore } from '../store/useStore'

/**
 * Keeps simulation time synced with real wall-clock time.
 * Updates every second.
 */
export function useTimeLoop() {
  const setTime = useStore((s) => s.setTime)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [setTime])
}
