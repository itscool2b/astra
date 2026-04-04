import { SearchBar } from './SearchBar'
import { ScaleToggle } from './ScaleToggle'

export function TopBar() {
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
        }}
      >
        ASTRA
      </div>
      <div style={{ marginLeft: 24, pointerEvents: 'auto', flex: 1, maxWidth: 400 }}>
        <SearchBar />
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center', pointerEvents: 'auto' }}>
        <ScaleToggle />
      </div>
    </div>
  )
}
