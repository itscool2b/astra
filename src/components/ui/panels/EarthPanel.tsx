import { useEPIC, useEONET } from '../../../api/hooks'
import { PlanetPanel } from './PlanetPanel'

const CATEGORY_COLORS: Record<string, string> = {
  wildfires: '#ff4444',
  volcanoes: '#ff6600',
  severeStorms: '#ffaa00',
  floods: '#4a90d9',
  seaLakeIce: '#7ec8e3',
  earthquakes: '#c45050',
  drought: '#cc8833',
  snow: '#ffffff',
  landslides: '#8b6914',
}

export function EarthPanel() {
  const { data: epicImages } = useEPIC()
  const { data: events } = useEONET()

  return (
    <div>
      {/* Base planet panel */}
      <PlanetPanel id="earth" />

      {/* EPIC satellite images */}
      {epicImages && epicImages.length > 0 && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
            Latest Satellite Image
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
            From DSCOVR/EPIC at L1 point
          </div>
          {(() => {
            const img = epicImages[0]
            const date = img.date.split(' ')[0].replace(/-/g, '/')
            const imgUrl = `https://epic.gsfc.nasa.gov/archive/natural/${date}/png/${img.image}.png`
            return (
              <div>
                <img
                  src={imgUrl}
                  alt={img.caption}
                  style={{ width: '100%', borderRadius: 8, marginBottom: 6 }}
                  loading="lazy"
                />
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                  {new Date(img.date).toLocaleString()}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* EONET Natural Events */}
      {events && events.length > 0 && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
            Active Natural Events ({events.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {events.slice(0, 10).map((event) => {
              const category = event.categories[0]?.id || 'unknown'
              const color = CATEGORY_COLORS[category] || '#888'
              return (
                <div
                  key={event.id}
                  style={{
                    background: `${color}10`,
                    border: `1px solid ${color}30`,
                    borderRadius: 8,
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500 }}>{event.title}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                      {event.categories[0]?.title}
                    </div>
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
