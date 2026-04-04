import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import Fuse from 'fuse.js'
import { PLANETS } from '../../data/planets'
import { DWARF_PLANETS } from '../../data/dwarfPlanets'
import { MOONS } from '../../data/moons'
import { useStore, type CelestialTarget } from '../../store/useStore'
import type { SearchableObject } from '../../data/types'

const allObjects: SearchableObject[] = [
  { id: 'sun', name: 'Sun', type: 'star' },
  ...PLANETS.map((p) => ({ id: p.id, name: p.name, type: 'planet' as const })),
  ...DWARF_PLANETS.map((d) => ({ id: d.id, name: d.name, type: 'dwarf-planet' as const })),
  ...MOONS.map((m) => ({
    id: m.id,
    name: m.name,
    type: 'moon' as const,
    parentId: m.parentId,
    parentName: PLANETS.find((p) => p.id === m.parentId)?.name || m.parentId,
  })),
]

const fuse = new Fuse(allObjects, {
  keys: ['name'],
  threshold: 0.3,
  minMatchCharLength: 1,
})

export function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const selectObject = useStore((s) => s.selectObject)
  const flyTo = useStore((s) => s.flyTo)

  const results = useMemo(() => {
    if (!query.trim()) return []
    return fuse.search(query).slice(0, 8)
  }, [query])

  const handleSelect = useCallback(
    (obj: SearchableObject) => {
      const target: CelestialTarget = {
        id: obj.id,
        name: obj.name,
        type: obj.type,
        parentId: obj.parentId,
      }
      selectObject(target)
      flyTo(target)
      setQuery('')
      setOpen(false)
    },
    [selectObject, flyTo]
  )

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === '/' && !open) {
        e.preventDefault()
        setOpen(true)
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: '8px 16px',
          cursor: 'text',
          transition: 'border-color 0.2s',
          borderColor: open ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
        }}
        onClick={() => {
          setOpen(true)
          inputRef.current?.focus()
        }}
      >
        <span style={{ opacity: 0.4, fontSize: 14 }}>&#128269;</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search planets, moons, asteroids..."
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#e0e0e0',
            fontSize: 13,
          }}
        />
        {!open && (
          <span
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 4,
              padding: '1px 5px',
            }}
          >
            /
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'rgba(10,10,30,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            overflow: 'hidden',
            zIndex: 100,
          }}
        >
          {results.map(({ item }) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, minWidth: 55 }}>
                {item.type}
              </span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</span>
              {item.parentName && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
                  {item.parentName}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
