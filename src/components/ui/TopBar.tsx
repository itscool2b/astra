import { SearchBar } from './SearchBar'
import { ScaleToggle } from './ScaleToggle'

interface TopBarProps {
  onOpenAbout: () => void
  onOpenExoplanets: () => void
}

export function TopBar({ onOpenAbout, onOpenExoplanets }: TopBarProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '16px 24px',
        zIndex: 10,
        pointerEvents: 'none',
        background: 'linear-gradient(rgba(0,0,0,0.4) 0%, transparent 100%)',
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 4,
          color: '#fff',
          pointerEvents: 'auto',
          userSelect: 'none',
          cursor: 'pointer',
        }}
        onClick={onOpenAbout}
        title="About ASTRA"
      >
        ASTRA
      </div>
      <div style={{ marginLeft: 24, pointerEvents: 'auto', flex: 1, maxWidth: 400 }}>
        <SearchBar />
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center', pointerEvents: 'auto' }}>
        <ScaleToggle />
        <button
          onClick={onOpenExoplanets}
          style={{
            height: 28,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 12px',
            letterSpacing: 0.5,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
          }}
          title="Browse Exoplanet Archive"
        >
          Exoplanets
        </button>
        <button
          onClick={onOpenAbout}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
          }}
          title="About ASTRA"
        >
          ?
        </button>
      </div>
    </div>
  )
}
