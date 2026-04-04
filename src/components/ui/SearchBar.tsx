import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import Fuse from 'fuse.js'
import { PLANETS } from '../../data/planets'
import { DWARF_PLANETS } from '../../data/dwarfPlanets'
import { MOONS } from '../../data/moons'
import { SPACECRAFT } from '../../data/spacecraft'
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
  ...SPACECRAFT.map((s) => ({ id: s.id, name: s.name, type: 'spacecraft' as const })),
]

const grouped: { label: string; type: string; items: SearchableObject[] }[] = [
  { label: 'Star', type: 'star', items: allObjects.filter((o) => o.type === 'star') },
  { label: 'Planets', type: 'planet', items: allObjects.filter((o) => o.type === 'planet') },
  { label: 'Dwarf Planets', type: 'dwarf-planet', items: allObjects.filter((o) => o.type === 'dwarf-planet') },
  { label: 'Moons', type: 'moon', items: allObjects.filter((o) => o.type === 'moon') },
  { label: 'Spacecraft', type: 'spacecraft', items: allObjects.filter((o) => o.type === 'spacecraft') },
]

const fuse = new Fuse(allObjects, {
  keys: ['name'],
  threshold: 0.3,
  minMatchCharLength: 1,
})

export function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const selectObject = useStore((s) => s.selectObject)
  const flyTo = useStore((s) => s.flyTo)

  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    return fuse.search(query).slice(0, 10).map((r) => r.item)
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
      inputRef.current?.blur()
    },
    [selectObject, flyTo]
  )

  // Close on Escape, open on /
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

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const showBrowse = open && query.trim() === ''
  const showSearch = open && searchResults.length > 0

  const itemStyle: React.CSSProperties = {
    padding: '8px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    transition: 'background 0.12s',
  }

  const renderItem = (obj: SearchableObject) => (
    <div
      key={obj.id}
      onClick={() => handleSelect(obj)}
      style={itemStyle}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
        {obj.name}
      </span>
      {obj.parentName && (
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>
          {obj.parentName}
        </span>
      )}
    </div>
  )

  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: 400 }} ref={dropdownRef}>
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
          placeholder="Search or browse..."
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

      {/* Dropdown: browse all (when empty) or search results */}
      {(showBrowse || showSearch) && (
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
            maxHeight: 400,
            overflowY: 'auto',
          }}
        >
          {showSearch ? (
            // Search results
            searchResults.map(renderItem)
          ) : (
            // Browse all, grouped by category
            grouped.map((group) => (
              <div key={group.type}>
                <div
                  style={{
                    padding: '8px 16px 4px',
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    color: 'rgba(255,255,255,0.3)',
                    borderTop: group.type !== 'star' ? '1px solid rgba(255,255,255,0.04)' : undefined,
                    marginTop: group.type !== 'star' ? 4 : 0,
                  }}
                >
                  {group.label}
                </div>
                {group.items.map(renderItem)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
