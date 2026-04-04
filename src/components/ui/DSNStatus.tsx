import { useState, useMemo } from 'react'
import { useDSNStatus, type DSNDish } from '../../api/hooks'
import { SPACECRAFT } from '../../data/spacecraft'

const TRACKED_NAMES = new Set(SPACECRAFT.map(s => s.name.toUpperCase()))

function isTracked(target: string): boolean {
  const upper = target.toUpperCase()
  for (const name of TRACKED_NAMES) {
    if (upper.includes(name) || name.includes(upper)) return true
  }
  return false
}

function formatDataRate(bps: number): string {
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(1)} Mbps`
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(1)} kbps`
  return `${Math.round(bps)} bps`
}

const COMPLEX_ORDER = ['Goldstone', 'Canberra', 'Madrid', 'Unknown']

export function DSNStatus() {
  const { data: dishes, isLoading } = useDSNStatus()
  const [collapsed, setCollapsed] = useState(true)

  const grouped = useMemo(() => {
    if (!dishes) return new Map<string, DSNDish[]>()
    const map = new Map<string, DSNDish[]>()
    for (const complex of COMPLEX_ORDER) {
      const matching = dishes.filter(d => d.complex === complex)
      if (matching.length > 0) map.set(complex, matching)
    }
    return map
  }, [dishes])

  if (isLoading || !dishes || dishes.length === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 110,
        right: 16,
        zIndex: 15,
        maxWidth: 300,
        background: 'rgba(8,8,24,0.88)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        overflow: 'hidden',
        fontFamily: 'inherit',
      }}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '8px 12px',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#44cc88',
              boxShadow: '0 0 6px #44cc88',
            }}
          />
          DSN Live
        </span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
          {collapsed ? `${dishes.length} active` : 'collapse'}
        </span>
      </button>

      {/* Dish list - collapsible, grouped by complex */}
      {!collapsed && (
        <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Array.from(grouped.entries()).map(([complex, complexDishes]) => (
            <div key={complex}>
              <div style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
                padding: '6px 4px 3px',
              }}>
                {complex}
              </div>
              {complexDishes.slice(0, 6).map((dish, i) => (
                <div
                  key={`${dish.dish}-${i}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    padding: '5px 8px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 6,
                    fontSize: 10,
                    marginBottom: 3,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, minWidth: 60, flexShrink: 0 }}>
                      {dish.dish}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>{'>'}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {dish.targets.map((t, ti) => (
                        <span key={ti}>
                          {ti > 0 && ', '}
                          <span style={{
                            color: isTracked(t) ? '#4a90d9' : 'rgba(255,255,255,0.7)',
                            fontWeight: isTracked(t) ? 700 : 400,
                          }}>
                            {t}
                          </span>
                        </span>
                      ))}
                    </span>
                  </div>
                  {dish.signals.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, paddingLeft: 66, fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
                      {dish.signals.map((sig, si) => (
                        <span key={si} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <span>{sig.direction === 'down' ? 'v' : '^'}</span>
                          {sig.dataRate != null && sig.dataRate > 0 && (
                            <span>{formatDataRate(sig.dataRate)}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 4 }}>
            Updates every 30s
          </div>
        </div>
      )}
    </div>
  )
}
