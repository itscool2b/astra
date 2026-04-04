import { useStore } from '../../store/useStore'

export function ScaleToggle() {
  const scaleMode = useStore((s) => s.scaleMode)
  const toggleScaleMode = useStore((s) => s.toggleScaleMode)

  return (
    <button
      onClick={toggleScaleMode}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: '6px 12px',
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
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
      {scaleMode === 'compressed' ? 'Compressed' : 'Realistic'}
    </button>
  )
}
