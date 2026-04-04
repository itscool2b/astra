import { SearchBar } from './SearchBar'
import { ScaleToggle } from './ScaleToggle'

interface TopBarProps {
  onOpenAbout: () => void
}

export function TopBar({ onOpenAbout }: TopBarProps) {
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
          onClick={onOpenAbout}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '6px 12px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
          }}
        >
          About
        </button>
      </div>
    </div>
  )
}
