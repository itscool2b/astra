import { useEffect, useRef } from 'react'
import { useStore, type CelestialTarget } from '../store/useStore'
import { PLANETS } from '../data/planets'
import { MOONS_BY_PARENT } from '../data/moons'

const PLANET_TARGETS: CelestialTarget[] = PLANETS.map((p) => ({
  id: p.id,
  name: p.name,
  type: 'planet',
}))

export function useKeyboardNav() {
  const selectObject = useStore((s) => s.selectObject)
  const flyTo = useStore((s) => s.flyTo)
  const selectedObject = useStore((s) => s.selectedObject)
  const selectedRef = useRef(selectedObject)
  selectedRef.current = selectedObject

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in an input
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const current = selectedRef.current

      // Number keys 1-8: jump to planet by order
      if (e.key >= '1' && e.key <= '8') {
        const idx = parseInt(e.key) - 1
        const target = PLANET_TARGETS[idx]
        if (target) {
          selectObject(target)
          flyTo(target)
        }
        return
      }

      // Left/Right: cycle planets
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const currentIdx = current ? PLANET_TARGETS.findIndex((p) => p.id === current.id) : -1
        let nextIdx: number
        if (currentIdx === -1) {
          nextIdx = e.key === 'ArrowRight' ? 0 : PLANET_TARGETS.length - 1
        } else {
          nextIdx = e.key === 'ArrowRight'
            ? (currentIdx + 1) % PLANET_TARGETS.length
            : (currentIdx - 1 + PLANET_TARGETS.length) % PLANET_TARGETS.length
        }
        const target = PLANET_TARGETS[nextIdx]
        selectObject(target)
        flyTo(target)
        return
      }

      // Up/Down: cycle moons of current planet
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && current) {
        e.preventDefault()
        const parentId = current.type === 'moon' ? current.parentId : current.id
        if (!parentId) return
        const moons = MOONS_BY_PARENT.get(parentId)
        if (!moons || moons.length === 0) return

        const moonTargets: CelestialTarget[] = moons.map((m) => ({
          id: m.id,
          name: m.name,
          type: 'moon',
          parentId: m.parentId,
        }))

        const currentMoonIdx = moonTargets.findIndex((m) => m.id === current.id)
        let nextIdx: number
        if (currentMoonIdx === -1) {
          nextIdx = 0
        } else {
          nextIdx = e.key === 'ArrowDown'
            ? (currentMoonIdx + 1) % moonTargets.length
            : (currentMoonIdx - 1 + moonTargets.length) % moonTargets.length
        }
        const target = moonTargets[nextIdx]
        selectObject(target)
        flyTo(target)
        return
      }

      // Escape: deselect
      if (e.key === 'Escape' && current) {
        selectObject(null)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectObject, flyTo])
}
