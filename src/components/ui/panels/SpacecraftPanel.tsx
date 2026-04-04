import { SPACECRAFT_MAP } from '../../../data/spacecraft'
import { useSpacecraftPosition } from '../../../api/hooks'

export function SpacecraftPanel({ id }: { id: string }) {
  const spacecraft = SPACECRAFT_MAP.get(id)
  if (!spacecraft) return null

  const { data: position, isLoading } = useSpacecraftPosition(spacecraft.horizonsId)

  const distanceAU = position
    ? Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2)
    : null

  return (
    <div>
      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Launch Date</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>
            {new Date(spacecraft.launchDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Distance from Sun</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>
            {isLoading ? '...' : distanceAU ? `${distanceAU.toFixed(2)} AU` : 'N/A'}
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>{spacecraft.description}</p>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <a
          href={spacecraft.missionUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            color: '#e0e0e0',
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          Mission Website
        </a>
      </div>
    </div>
  )
}
