import { useDONKICMEs, useDONKIFlares } from '../../../api/hooks'

export function SunPanel() {
  const { data: cmes } = useDONKICMEs()
  const { data: flares } = useDONKIFlares()

  return (
    <div>
      {/* Sun stats */}
      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Diameter</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>1,391,000 km</div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Mass</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>1.989 x 10^30 kg</div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Surface Temp</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>5,778 K</div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Core Temp</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>~15.7M K</div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Spectral Type</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>G2V</div>
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Age</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>4.6 billion yrs</div>
        </div>
      </div>

      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
          A G-type main-sequence star at the center of our solar system. It contains 99.86% of the solar system's total mass and provides the energy that sustains nearly all life on Earth.
        </p>
      </div>

      {/* Recent CMEs */}
      {cmes && cmes.length > 0 && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
            Recent Coronal Mass Ejections
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cmes.slice(-5).reverse().map((cme) => (
              <div
                key={cme.activityID}
                style={{
                  background: 'rgba(255,136,0,0.08)',
                  border: '1px solid rgba(255,136,0,0.15)',
                  borderRadius: 8,
                  padding: '8px 10px',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 500 }}>
                  {new Date(cme.startTime).toLocaleDateString()} | {cme.sourceLocation || 'Unknown location'}
                </div>
                {cme.note && (
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, lineHeight: 1.4 }}>
                    {cme.note.slice(0, 150)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Flares */}
      {flares && flares.length > 0 && (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
            Recent Solar Flares
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {flares.slice(-8).reverse().map((flare) => {
              const classColor =
                flare.classType.startsWith('X') ? '#ff4444' :
                flare.classType.startsWith('M') ? '#ff8800' :
                '#ffcc00'
              return (
                <div
                  key={flare.flrID}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, padding: '4px 0' }}
                >
                  <span
                    style={{
                      background: `${classColor}20`,
                      color: classColor,
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: 11,
                      minWidth: 36,
                      textAlign: 'center',
                    }}
                  >
                    {flare.classType}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {new Date(flare.beginTime).toLocaleDateString()}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                    {flare.sourceLocation}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
