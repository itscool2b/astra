import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExoplanets } from '../../api/hooks'

interface ExoplanetBrowserProps {
  open: boolean
  onClose: () => void
}

type SortKey = 'pl_name' | 'pl_rade' | 'pl_bmasse' | 'pl_eqt' | 'sy_dist' | 'disc_year'
type SortDir = 'asc' | 'desc'

const METHOD_CHIPS = ['Transit', 'Radial Velocity', 'Imaging', 'Microlensing', 'Other'] as const

function formatVal(v: number | null | undefined, decimals = 1, suffix = ''): string {
  if (v == null) return '--'
  return `${Number(v).toFixed(decimals)}${suffix}`
}

export function ExoplanetBrowser({ open, onClose }: ExoplanetBrowserProps) {
  const { data: rawData, isLoading } = useExoplanets()

  const [methodFilter, setMethodFilter] = useState<Set<string>>(new Set())
  const [habitableOnly, setHabitableOnly] = useState(false)
  const [yearMin, setYearMin] = useState('')
  const [yearMax, setYearMax] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('pl_name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleMethod = useCallback((method: string) => {
    setMethodFilter(prev => {
      const next = new Set(prev)
      if (next.has(method)) next.delete(method)
      else next.add(method)
      return next
    })
  }, [])

  const handleSort = useCallback((key: SortKey) => {
    setSortKey(prev => {
      if (prev === key) {
        setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        return prev
      }
      setSortDir('asc')
      return key
    })
  }, [])

  const data = rawData ?? []

  const methodCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of data) {
      const m = p.discoverymethod ?? 'Unknown'
      counts[m] = (counts[m] || 0) + 1
    }
    return counts
  }, [data])

  const habitableCount = useMemo(
    () => data.filter(p => p.pl_eqt != null && p.pl_eqt >= 200 && p.pl_eqt <= 320).length,
    [data]
  )

  const filtered = useMemo(() => {
    let result = data

    if (methodFilter.size > 0) {
      result = result.filter(p => {
        const m = p.discoverymethod ?? 'Unknown'
        if (methodFilter.has('Other')) {
          const known = ['Transit', 'Radial Velocity', 'Imaging', 'Microlensing']
          if (!known.includes(m) && methodFilter.has('Other')) return true
        }
        return methodFilter.has(m)
      })
    }

    if (habitableOnly) {
      result = result.filter(p => p.pl_eqt != null && p.pl_eqt >= 200 && p.pl_eqt <= 320)
    }

    const yMin = yearMin ? parseInt(yearMin, 10) : null
    const yMax = yearMax ? parseInt(yearMax, 10) : null
    if (yMin != null && !isNaN(yMin)) {
      result = result.filter(p => p.disc_year != null && p.disc_year >= yMin)
    }
    if (yMax != null && !isNaN(yMax)) {
      result = result.filter(p => p.disc_year != null && p.disc_year <= yMax)
    }

    result = [...result].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })

    return result
  }, [data, methodFilter, habitableOnly, yearMin, yearMax, sortKey, sortDir])

  const headerStyle: React.CSSProperties = {
    padding: '6px 8px',
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    transition: 'color 0.15s',
  }

  const cellStyle: React.CSSProperties = {
    padding: '8px 8px',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }

  function SortIndicator({ col }: { col: SortKey }) {
    if (sortKey !== col) return null
    return <span style={{ marginLeft: 3, fontSize: 9 }}>{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.94)',
            backdropFilter: 'blur(12px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 20,
              right: 24,
              zIndex: 210,
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
            }}
          >
            &#x2715;
          </button>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              maxWidth: 1000,
              margin: '0 auto',
              padding: '60px 24px 80px',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: 8, color: '#fff', marginBottom: 8 }}>
                EXOPLANET ARCHIVE
              </div>
              <div style={{ fontSize: 13, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                NASA Exoplanet Archive &middot; Confirmed Planets
              </div>
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: 80, color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                <div style={{
                  width: 32, height: 32, border: '2px solid rgba(255,255,255,0.1)',
                  borderTopColor: '#4a90d9', borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 1s linear infinite',
                }} />
                Loading exoplanet data...
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </div>
            ) : (
              <>
                {/* Stats header */}
                <div style={{
                  display: 'flex',
                  gap: 16,
                  marginBottom: 24,
                  flexWrap: 'wrap',
                }}>
                  <StatBox label="Total Planets" value={data.length.toLocaleString()} color="#4a90d9" />
                  <StatBox label="Habitable Zone" value={habitableCount.toLocaleString()} color="#44cc88" />
                  {Object.entries(methodCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 4)
                    .map(([method, count]) => (
                      <StatBox key={method} label={method} value={count.toLocaleString()} color="rgba(255,255,255,0.5)" />
                    ))
                  }
                </div>

                {/* Filter bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                  marginBottom: 20,
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
                    Filters:
                  </span>

                  {/* Method chips */}
                  {METHOD_CHIPS.map(method => {
                    const active = methodFilter.has(method)
                    return (
                      <button
                        key={method}
                        onClick={() => toggleMethod(method)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: 14,
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: 'pointer',
                          border: active ? '1px solid rgba(74,144,217,0.5)' : '1px solid rgba(255,255,255,0.1)',
                          background: active ? 'rgba(74,144,217,0.15)' : 'rgba(255,255,255,0.04)',
                          color: active ? '#6ab0f3' : 'rgba(255,255,255,0.5)',
                          transition: 'all 0.15s',
                        }}
                      >
                        {method}
                      </button>
                    )
                  })}

                  {/* Separator */}
                  <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />

                  {/* Year range */}
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Year:</span>
                  <input
                    type="number"
                    placeholder="from"
                    value={yearMin}
                    onChange={e => setYearMin(e.target.value)}
                    style={yearInputStyle}
                  />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>-</span>
                  <input
                    type="number"
                    placeholder="to"
                    value={yearMax}
                    onChange={e => setYearMax(e.target.value)}
                    style={yearInputStyle}
                  />

                  {/* Separator */}
                  <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />

                  {/* Habitable zone toggle */}
                  <button
                    onClick={() => setHabitableOnly(v => !v)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 14,
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: 'pointer',
                      border: habitableOnly ? '1px solid rgba(68,204,136,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      background: habitableOnly ? 'rgba(68,204,136,0.15)' : 'rgba(255,255,255,0.04)',
                      color: habitableOnly ? '#44cc88' : 'rgba(255,255,255,0.5)',
                      transition: 'all 0.15s',
                    }}
                  >
                    Habitable Zone
                  </button>
                </div>

                {/* Results count */}
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
                  Showing {filtered.length.toLocaleString()} of {data.length.toLocaleString()} planets
                </div>

                {/* Table */}
                <div style={{
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10,
                  overflow: 'hidden',
                }}>
                  {/* Table header */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 0.6fr',
                    background: 'rgba(255,255,255,0.03)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={headerStyle} onClick={() => handleSort('pl_name')}>
                      Planet<SortIndicator col="pl_name" />
                    </div>
                    <div style={{ ...headerStyle, cursor: 'default' }}>Host Star</div>
                    <div style={headerStyle} onClick={() => handleSort('pl_rade')}>
                      Radius<SortIndicator col="pl_rade" />
                    </div>
                    <div style={headerStyle} onClick={() => handleSort('pl_bmasse')}>
                      Mass<SortIndicator col="pl_bmasse" />
                    </div>
                    <div style={headerStyle} onClick={() => handleSort('pl_eqt')}>
                      Temp<SortIndicator col="pl_eqt" />
                    </div>
                    <div style={headerStyle} onClick={() => handleSort('sy_dist')}>
                      Dist<SortIndicator col="sy_dist" />
                    </div>
                    <div style={headerStyle} onClick={() => handleSort('disc_year')}>
                      Year<SortIndicator col="disc_year" />
                    </div>
                  </div>

                  {/* Scrollable list */}
                  <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                    {filtered.slice(0, 500).map(planet => {
                      const isExpanded = expandedId === planet.pl_name
                      const isHZ = planet.pl_eqt != null && planet.pl_eqt >= 200 && planet.pl_eqt <= 320

                      return (
                        <div key={planet.pl_name}>
                          <div
                            onClick={() => setExpandedId(isExpanded ? null : planet.pl_name)}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '2fr 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 0.6fr',
                              borderBottom: '1px solid rgba(255,255,255,0.03)',
                              cursor: 'pointer',
                              transition: 'background 0.12s',
                              background: isExpanded ? 'rgba(74,144,217,0.06)' : 'transparent',
                            }}
                            onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                            onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent' }}
                          >
                            <div style={{ ...cellStyle, fontWeight: 500, color: isHZ ? '#44cc88' : 'rgba(255,255,255,0.85)' }}>
                              {planet.pl_name}
                            </div>
                            <div style={{ ...cellStyle, color: 'rgba(255,255,255,0.5)' }}>{planet.hostname}</div>
                            <div style={cellStyle}>{formatVal(planet.pl_rade, 1, ' R\u2295')}</div>
                            <div style={cellStyle}>{formatVal(planet.pl_bmasse, 1, ' M\u2295')}</div>
                            <div style={cellStyle}>{formatVal(planet.pl_eqt, 0, ' K')}</div>
                            <div style={cellStyle}>{formatVal(planet.sy_dist, 1, ' pc')}</div>
                            <div style={cellStyle}>{planet.disc_year ?? '--'}</div>
                          </div>

                          {/* Expanded detail card */}
                          {isExpanded && (
                            <div style={{
                              padding: '16px 20px',
                              background: 'rgba(74,144,217,0.04)',
                              borderBottom: '1px solid rgba(255,255,255,0.06)',
                            }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                <DetailItem label="Planet Name" value={planet.pl_name} />
                                <DetailItem label="Host Star" value={planet.hostname} />
                                <DetailItem label="Discovery Method" value={planet.discoverymethod ?? '--'} />
                                <DetailItem label="Discovery Year" value={planet.disc_year != null ? String(planet.disc_year) : '--'} />
                                <DetailItem label="Orbital Period" value={formatVal(planet.pl_orbper, 2, ' days')} />
                                <DetailItem label="Semi-major Axis" value={formatVal(planet.pl_orbsmax, 3, ' AU')} />
                                <DetailItem label="Radius" value={formatVal(planet.pl_rade, 2, ' Earth radii')} />
                                <DetailItem label="Mass" value={formatVal(planet.pl_bmasse, 2, ' Earth masses')} />
                                <DetailItem label="Eq. Temperature" value={formatVal(planet.pl_eqt, 0, ' K')} />
                                <DetailItem label="Distance" value={formatVal(planet.sy_dist, 1, ' parsecs')} />
                                <DetailItem label="Stellar Spectral Type" value={planet.st_spectype ?? '--'} />
                                <DetailItem label="Stellar Temperature" value={formatVal(planet.st_teff, 0, ' K')} />
                              </div>
                              {isHZ && (
                                <div style={{
                                  marginTop: 12,
                                  padding: '6px 12px',
                                  background: 'rgba(68,204,136,0.1)',
                                  border: '1px solid rgba(68,204,136,0.25)',
                                  borderRadius: 8,
                                  fontSize: 11,
                                  color: '#44cc88',
                                  display: 'inline-block',
                                }}>
                                  In the habitable zone (200-320 K equilibrium temperature)
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {filtered.length > 500 && (
                      <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                        Showing first 500 of {filtered.length.toLocaleString()} results. Use filters to narrow down.
                      </div>
                    )}
                    {filtered.length === 0 && (
                      <div style={{ padding: 40, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                        No planets match the current filters.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: '10px 16px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 8,
      minWidth: 100,
    }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{value}</div>
    </div>
  )
}

const yearInputStyle: React.CSSProperties = {
  width: 64,
  padding: '4px 8px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 6,
  color: 'rgba(255,255,255,0.7)',
  fontSize: 11,
  outline: 'none',
}
