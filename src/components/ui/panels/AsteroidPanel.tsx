import { useNEOFeed } from '../../../api/hooks'
import type { NEOData } from '../../../api/types'

function formatDiameter(min: number, max: number): string {
  const avg = (min + max) / 2
  if (avg >= 1) {
    return `${min.toFixed(2)} - ${max.toFixed(2)} km`
  }
  return `${(min * 1000).toFixed(0)} - ${(max * 1000).toFixed(0)} m`
}

export function AsteroidPanel({ asteroidId }: { asteroidId: string }) {
  const { data: neoData } = useNEOFeed()

  const neo: NEOData | undefined = (() => {
    if (!neoData?.near_earth_objects) return undefined
    const allNeos = Object.values(neoData.near_earth_objects).flat()
    // asteroidId comes as "neo-<id>"
    const rawId = asteroidId.replace(/^neo-/, '')
    return allNeos.find((n) => n.id === rawId)
  })()

  if (!neo) {
    return (
      <div style={{ padding: 20, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
        Asteroid data not available
      </div>
    )
  }

  const diam = neo.estimated_diameter.kilometers
  const sortedApproaches = [...neo.close_approach_data].sort(
    (a, b) => new Date(a.close_approach_date).getTime() - new Date(b.close_approach_date).getTime()
  )

  return (
    <div>
      {/* Name + Hazard Status */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a
          href={neo.nasa_jpl_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#4a90d9', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
        >
          {neo.name} &#8599;
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          {neo.is_potentially_hazardous_asteroid ? (
            <span
              style={{
                background: 'rgba(255,60,60,0.15)',
                border: '1px solid rgba(255,60,60,0.4)',
                color: '#ff4444',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                padding: '3px 10px',
                borderRadius: 12,
              }}
            >
              Potentially Hazardous
            </span>
          ) : (
            <span
              style={{
                background: 'rgba(68,204,136,0.12)',
                border: '1px solid rgba(68,204,136,0.3)',
                color: '#44cc88',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                padding: '3px 10px',
                borderRadius: 12,
              }}
            >
              Non-Hazardous
            </span>
          )}
        </div>
      </div>

      {/* Physical Properties */}
      <div
        style={{
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>
            Est. Diameter
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
            {formatDiameter(diam.estimated_diameter_min, diam.estimated_diameter_max)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>
            Abs. Magnitude
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{neo.absolute_magnitude_h.toFixed(2)} H</div>
        </div>
      </div>

      {/* Orbital Parameters */}
      {neo.orbital_data && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Orbital Parameters</div>
          {[
            ['Semi-major axis', `${parseFloat(neo.orbital_data.semi_major_axis).toFixed(4)} AU`],
            ['Eccentricity', parseFloat(neo.orbital_data.eccentricity).toFixed(6)],
            ['Inclination', `${parseFloat(neo.orbital_data.inclination).toFixed(3)}°`],
            ['Orbital period', `${parseFloat(neo.orbital_data.orbital_period).toFixed(1)} days`],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}
            >
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Close Approach Timeline */}
      {sortedApproaches.length > 0 && (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
            Close Approaches ({sortedApproaches.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sortedApproaches.map((ca, i) => {
              const missKm = parseFloat(ca.miss_distance.kilometers)
              const missLunar = parseFloat(ca.miss_distance.lunar)
              const velKmS = parseFloat(ca.relative_velocity.kilometers_per_hour) / 3600
              return (
                <div
                  key={`${ca.close_approach_date}-${i}`}
                  style={{
                    background: missLunar < 5 ? 'rgba(255,60,60,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${missLunar < 5 ? 'rgba(255,60,60,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 8,
                    padding: '8px 10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                      {new Date(ca.close_approach_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                      {ca.orbiting_body}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                    <span>{missKm < 1e6 ? `${missKm.toFixed(0)} km` : `${(missKm / 1e6).toFixed(2)}M km`}</span>
                    <span>{missLunar.toFixed(2)} LD</span>
                    <span>{velKmS.toFixed(2)} km/s</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
