import { useState } from 'react'
import { useDSNStatus } from '../../api/hooks'

export function DSNStatus() {
  const { data: dishes, isLoading } = useDSNStatus()
  const [collapsed, setCollapsed] = useState(true)

  if (isLoading || !dishes || dishes.length === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 110,
        right: 16,
        zIndex: 15,
        maxWidth: 280,
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

      {/* Dish list - collapsible */}
      {!collapsed && (
        <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {dishes.slice(0, 8).map((dish, i) => (
            <div
              key={`${dish.dish}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 8px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 6,
                fontSize: 10,
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, minWidth: 60, flexShrink: 0 }}>
                {dish.dish}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>{'>'}</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {dish.targets.join(', ')}
              </span>
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
