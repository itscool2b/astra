import { useState, useMemo } from 'react'
import { useCloseApproaches } from '../../api/hooks'

const AU_TO_LD = 389.17

// CAD API field indices
const DES = 0
const CD = 3
const DIST = 4
const V_REL = 7
const DIAMETER = 11
const FULLNAME = 13

export function CloseApproachWidget() {
  const { data, isLoading, isError } = useCloseApproaches()
  const [collapsed, setCollapsed] = useState(true)

  const approaches = useMemo(() => {
    if (!data?.data) return []
    return data.data
      .filter((row) => row.length >= 14)
      .map((row) => {
        const distLD = parseFloat(row[DIST]) * AU_TO_LD
        return {
          name: (row[FULLNAME] || row[DES] || '').trim(),
          date: row[CD],
          distLD,
          diameter: row[DIAMETER] ? parseFloat(row[DIAMETER]) : null,
          velocity: parseFloat(row[V_REL]),
        }
      })
      .sort((a, b) => a.distLD - b.distLD)
      .slice(0, 5)
  }, [data])

  if (isError) {
    return (
      <div
        style={{
          position: 'absolute',
          bottom: 270,
          left: 24,
          zIndex: 10,
          background: 'rgba(8,8,24,0.88)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          padding: '8px 12px',
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
        }}
      >
        Data unavailable
      </div>
    )
  }

  if (isLoading || !data || approaches.length === 0) return null

  const totalCount = parseInt(data.count, 10) || approaches.length

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 270,
        left: 24,
        zIndex: 10,
        maxWidth: 300,
        background: 'rgba(8,8,24,0.88)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        overflow: 'hidden',
        fontFamily: 'inherit',
      }}
    >
      {/* Header */}
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
              background: '#ffaa00',
              boxShadow: '0 0 6px #ffaa00',
            }}
          />
          Close Approaches
        </span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
          {collapsed ? `${totalCount} approaches` : 'collapse'}
        </span>
      </button>

      {/* Approach list */}
      {!collapsed && (
        <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {approaches.map((a, i) => {
            const isClose = a.distLD < 1
            return (
              <div
                key={`${a.name}-${i}`}
                style={{
                  background: isClose ? 'rgba(255,60,60,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isClose ? 'rgba(255,60,60,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 6,
                  padding: '6px 8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isClose ? '#ff4444' : 'rgba(255,255,255,0.85)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 180,
                    }}
                  >
                    {a.name}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', flexShrink: 0, marginLeft: 6 }}>
                    {a.date}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
                  <span style={{ color: isClose ? '#ff6666' : 'rgba(255,255,255,0.5)' }}>
                    {a.distLD.toFixed(2)} LD
                  </span>
                  <span>{a.velocity.toFixed(1)} km/s</span>
                  {a.diameter !== null && <span>{(a.diameter * 1000).toFixed(0)} m</span>}
                </div>
              </div>
            )
          })}
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 2 }}>
            Next 60 days within 10 LD
          </div>
        </div>
      )}
    </div>
  )
}
