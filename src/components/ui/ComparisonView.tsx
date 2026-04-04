import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PLANETS } from '../../data/planets'
import { DWARF_PLANETS } from '../../data/dwarfPlanets'

interface ComparisonViewProps {
  open: boolean
  onClose: () => void
  initialId?: string
}

interface CompareBody {
  id: string
  name: string
  diameter: number
  mass: number
  gravity: number
  temperature: number
  dayLength: number
  yearLength: number
  distanceAU: number
}

function toCompareBody(p: (typeof PLANETS)[0]): CompareBody {
  return {
    id: p.id,
    name: p.name,
    diameter: p.physical.radius * 2,
    mass: p.physical.mass,
    gravity: p.physical.gravity,
    temperature: p.physical.meanTemperature,
    dayLength: Math.abs(p.physical.rotationPeriod),
    yearLength: p.orbit.period * 365.25,
    distanceAU: p.orbit.semiMajorAxis,
  }
}

function toDwarfCompareBody(d: (typeof DWARF_PLANETS)[0]): CompareBody {
  return {
    id: d.id,
    name: d.name,
    diameter: d.physical.radius * 2,
    mass: d.physical.mass || 0,
    gravity: 0,
    temperature: d.physical.meanTemperature || 0,
    dayLength: d.physical.rotationPeriod ? Math.abs(d.physical.rotationPeriod) : 0,
    yearLength: d.orbit.period * 365.25,
    distanceAU: d.orbit.semiMajorAxis,
  }
}

const ALL_BODIES: CompareBody[] = [
  ...PLANETS.map(toCompareBody),
  ...DWARF_PLANETS.map(toDwarfCompareBody),
]

const STATS: { key: keyof CompareBody; label: string; unit: string; format: (v: number) => string }[] = [
  { key: 'diameter', label: 'Diameter', unit: 'km', format: (v) => v.toLocaleString() },
  { key: 'mass', label: 'Mass', unit: 'kg', format: (v) => v.toExponential(2) },
  { key: 'gravity', label: 'Surface Gravity', unit: 'm/s2', format: (v) => v.toFixed(2) },
  { key: 'temperature', label: 'Mean Temp', unit: 'C', format: (v) => `${v > 0 ? '+' : ''}${v}` },
  { key: 'dayLength', label: 'Day Length', unit: 'hours', format: (v) => v < 100 ? v.toFixed(1) : v.toFixed(0) },
  { key: 'yearLength', label: 'Year Length', unit: 'days', format: (v) => v < 1000 ? v.toFixed(1) : v.toFixed(0) },
  { key: 'distanceAU', label: 'Distance from Sun', unit: 'AU', format: (v) => v.toFixed(3) },
]

export function ComparisonView({ open, onClose, initialId }: ComparisonViewProps) {
  const [leftId, setLeftId] = useState(initialId || 'earth')
  const [rightId, setRightId] = useState('mars')

  const left = useMemo(() => ALL_BODIES.find((b) => b.id === leftId) || ALL_BODIES[2], [leftId])
  const right = useMemo(() => ALL_BODIES.find((b) => b.id === rightId) || ALL_BODIES[3], [rightId])

  const selectStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: '8px 12px',
    color: '#e0e0e0',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            style={{ maxWidth: 700, width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Compare</div>
              <button
                onClick={onClose}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)', border: 'none',
                  color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                x
              </button>
            </div>

            {/* Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 0, alignItems: 'center', marginBottom: 24 }}>
              <select value={leftId} onChange={(e) => setLeftId(e.target.value)} style={selectStyle}>
                {ALL_BODIES.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>vs</div>
              <select value={rightId} onChange={(e) => setRightId(e.target.value)} style={selectStyle}>
                {ALL_BODIES.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            {/* Stats comparison */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STATS.map((stat) => {
                const lVal = left[stat.key] as number
                const rVal = right[stat.key] as number
                const maxVal = Math.max(Math.abs(lVal), Math.abs(rVal), 0.001)
                const lPct = (Math.abs(lVal) / maxVal) * 100
                const rPct = (Math.abs(rVal) / maxVal) * 100

                return (
                  <div key={stat.key} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.3)', marginBottom: 8, textAlign: 'center' }}>
                      {stat.label}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 8px 1fr', gap: 0, alignItems: 'center' }}>
                      {/* Left value + bar */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                          {stat.format(lVal)} <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{stat.unit}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <div style={{
                            height: 4, borderRadius: 2,
                            width: `${lPct}%`, minWidth: 2,
                            background: '#4a90d9',
                          }} />
                        </div>
                      </div>
                      <div />
                      {/* Right value + bar */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                          {stat.format(rVal)} <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{stat.unit}</span>
                        </div>
                        <div>
                          <div style={{
                            height: 4, borderRadius: 2,
                            width: `${rPct}%`, minWidth: 2,
                            background: '#cc6644',
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
