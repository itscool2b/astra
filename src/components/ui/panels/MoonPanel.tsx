import { MOON_MAP } from '../../../data/moons'
import { PLANET_MAP } from '../../../data/planets'

export function MoonPanel({ id }: { id: string }) {
  const moon = MOON_MAP.get(id)
  if (!moon) return null

  const parent = PLANET_MAP.get(moon.parentId)

  return (
    <div>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
          Moon of {parent?.name || moon.parentId}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Radius</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{moon.physical.radius.toLocaleString()} km</div>
          </div>
          {moon.physical.mass && (
            <div>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Mass</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{moon.physical.mass.toExponential(2)} kg</div>
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>{moon.description}</p>
      </div>
      {moon.discoverer && (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Discovery</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            Discovered by {moon.discoverer} in {moon.discoveryYear}
          </div>
        </div>
      )}
    </div>
  )
}
