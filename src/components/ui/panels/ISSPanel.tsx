import { useISSPosition } from '../../../api/hooks'

export function ISSPanel() {
  const { data: issData, isLoading } = useISSPosition()

  const lat = issData ? parseFloat(issData.iss_position.latitude) : null
  const lon = issData ? parseFloat(issData.iss_position.longitude) : null

  return (
    <div>
      {/* ISS stats */}
      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Latitude</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>
            {isLoading ? '...' : lat !== null ? `${lat.toFixed(4)}°` : 'N/A'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Longitude</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>
            {isLoading ? '...' : lon !== null ? `${lon.toFixed(4)}°` : 'N/A'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Altitude</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>~408 km</div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Speed</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>~27,600 km/h</div>
        </div>
      </div>

      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
          The largest artificial object in space, orbiting Earth at roughly 408 km altitude and
          completing about 15.5 orbits per day. Regularly visible to the naked eye from the ground.
        </p>
      </div>

      {/* Live Stream */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
          NASA Live
        </div>
        <div style={{ borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
          <iframe
            src="https://www.youtube.com/embed/21X5lGlDOfg?autoplay=0"
            title="NASA Live Stream"
            style={{ width: '100%', height: 200, border: 'none', display: 'block' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
          NASA TV live broadcast. Switches between ISS views, mission coverage, and educational content.
        </div>
      </div>

      {/* Link */}
      <div style={{ padding: '16px 20px' }}>
        <a
          href="https://www.nasa.gov/mission_pages/station/main/index.html"
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
          NASA ISS Page
        </a>
      </div>
    </div>
  )
}
