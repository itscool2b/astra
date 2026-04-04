import { useState } from 'react'
import { useDONKICMEs, useDONKIFlares } from '../../../api/hooks'

const SDO_WAVELENGTHS = [
  { key: '171', label: '171', url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0171.jpg', desc: 'AIA 171 - Corona (blue)' },
  { key: '193', label: '193', url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0193.jpg', desc: 'AIA 193 - Corona (gold)' },
  { key: '304', label: '304', url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0304.jpg', desc: 'AIA 304 - Chromosphere (red)' },
  { key: 'hmi', label: 'HMI', url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIIC.jpg', desc: 'HMI Intensitygram - Visible light' },
  { key: 'mag', label: 'MAG', url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIB.jpg', desc: 'HMI Magnetogram - Magnetic field' },
]

const SOHO_IMAGES = [
  { key: 'c2', label: 'LASCO C2', url: 'https://soho.nascom.nasa.gov/data/realtime/c2/1024/latest.jpg', desc: 'Inner corona' },
  { key: 'c3', label: 'LASCO C3', url: 'https://soho.nascom.nasa.gov/data/realtime/c3/1024/latest.jpg', desc: 'Outer corona' },
]

export function SunPanel() {
  const { data: cmes } = useDONKICMEs()
  const { data: flares } = useDONKIFlares()
  const [selectedWavelength, setSelectedWavelength] = useState('171')

  const activeSDO = SDO_WAVELENGTHS.find(w => w.key === selectedWavelength) || SDO_WAVELENGTHS[0]
  const cacheBust = `?t=${Math.floor(Date.now() / 60000)}`

  return (
    <div>
      {/* Live Solar Imagery (SDO) */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Live Solar Imagery</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Updated every 15 min</div>
        </div>

        {/* Large active image */}
        <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 10, background: 'rgba(0,0,0,0.3)' }}>
          <img
            src={`${activeSDO.url}${cacheBust}`}
            alt={activeSDO.desc}
            style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
          />
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
          {activeSDO.desc}
        </div>

        {/* Wavelength selector chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SDO_WAVELENGTHS.map(w => (
            <button
              key={w.key}
              onClick={() => setSelectedWavelength(w.key)}
              style={{
                padding: '4px 10px',
                borderRadius: 12,
                border: selectedWavelength === w.key ? '1px solid #4a90d9' : '1px solid rgba(255,255,255,0.12)',
                background: selectedWavelength === w.key ? 'rgba(74,144,217,0.15)' : 'rgba(255,255,255,0.04)',
                color: selectedWavelength === w.key ? '#4a90d9' : 'rgba(255,255,255,0.55)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {w.label}
            </button>
          ))}
        </div>

        {/* SDO thumbnails row */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          {SDO_WAVELENGTHS.map(w => (
            <div
              key={w.key}
              onClick={() => setSelectedWavelength(w.key)}
              style={{
                flex: 1,
                cursor: 'pointer',
                borderRadius: 6,
                overflow: 'hidden',
                border: selectedWavelength === w.key ? '2px solid #4a90d9' : '2px solid transparent',
                opacity: selectedWavelength === w.key ? 1 : 0.6,
                transition: 'all 0.2s',
              }}
            >
              <img
                src={`${w.url}${cacheBust}`}
                alt={w.desc}
                style={{ width: '100%', height: 48, objectFit: 'cover', display: 'block' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* SOHO Coronagraph */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>SOHO Coronagraph</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Live coronagraph</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {SOHO_IMAGES.map(img => (
            <div key={img.key} style={{ flex: 1 }}>
              <div style={{ borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
                <img
                  src={`${img.url}${cacheBust}`}
                  alt={img.desc}
                  style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, textAlign: 'center' }}>
                {img.label} - {img.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

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
