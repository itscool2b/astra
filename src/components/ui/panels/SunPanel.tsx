import { useState } from 'react'
import { useDONKICMEs, useDONKIFlares, useDONKIStorms, useDONKISEP, useDONKIIPS } from '../../../api/hooks'

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

type EventTab = 'flares' | 'cmes' | 'storms' | 'particles' | 'shocks'

const TABS: { key: EventTab; label: string }[] = [
  { key: 'flares', label: 'Flares' },
  { key: 'cmes', label: 'CMEs' },
  { key: 'storms', label: 'Storms' },
  { key: 'particles', label: 'Particles' },
  { key: 'shocks', label: 'Shocks' },
]

function kpColor(kp: number): string {
  if (kp >= 7) return '#ff4444'
  if (kp >= 4) return '#ffcc00'
  return '#44cc88'
}

export function SunPanel() {
  const { data: cmes } = useDONKICMEs()
  const { data: flares } = useDONKIFlares()
  const { data: storms } = useDONKIStorms()
  const { data: sep } = useDONKISEP()
  const { data: ips } = useDONKIIPS()
  const [selectedWavelength, setSelectedWavelength] = useState('171')
  const [activeTab, setActiveTab] = useState<EventTab>('flares')
  const [expandedCME, setExpandedCME] = useState<string | null>(null)

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

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 20px' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #4a90d9' : '2px solid transparent',
              color: activeTab === tab.key ? '#4a90d9' : 'rgba(255,255,255,0.4)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '16px 20px' }}>
        {/* Flares tab */}
        {activeTab === 'flares' && flares && flares.length > 0 && (
          <div>
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
        {activeTab === 'flares' && (!flares || flares.length === 0) && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 20 }}>
            No recent flare data
          </div>
        )}

        {/* CMEs tab */}
        {activeTab === 'cmes' && cmes && cmes.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
              Recent Coronal Mass Ejections
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {cmes.slice(-5).reverse().map((cme) => (
                <div
                  key={cme.activityID}
                  onClick={() => setExpandedCME(expandedCME === cme.activityID ? null : cme.activityID)}
                  style={{
                    background: 'rgba(255,136,0,0.08)',
                    border: '1px solid rgba(255,136,0,0.15)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{new Date(cme.startTime).toLocaleDateString()} | {cme.sourceLocation || 'Unknown location'}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                      {expandedCME === cme.activityID ? '[-]' : '[+]'}
                    </span>
                  </div>
                  {cme.instruments && cme.instruments.length > 0 && (
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>
                      {cme.instruments.map(i => i.displayName).join(', ')}
                    </div>
                  )}
                  {expandedCME === cme.activityID && cme.note && (
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 6, lineHeight: 1.5 }}>
                      {cme.note}
                    </div>
                  )}
                  {expandedCME !== cme.activityID && cme.note && (
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, lineHeight: 1.4 }}>
                      {cme.note.slice(0, 80)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'cmes' && (!cmes || cmes.length === 0) && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 20 }}>
            No recent CME data
          </div>
        )}

        {/* Storms tab */}
        {activeTab === 'storms' && storms && storms.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
              Geomagnetic Storms
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {storms.slice(-5).reverse().map((storm) => (
                <div
                  key={storm.gstID}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 8 }}>
                    {new Date(storm.startTime).toLocaleDateString()} {new Date(storm.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {storm.allKpIndex && storm.allKpIndex.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {storm.allKpIndex.map((kp, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10 }}>
                          <div
                            style={{
                              width: `${Math.max(kp.kpIndex * 10, 8)}%`,
                              height: 14,
                              background: kpColor(kp.kpIndex),
                              borderRadius: 3,
                              minWidth: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 9,
                              color: '#000',
                            }}
                          >
                            Kp{kp.kpIndex}
                          </div>
                          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9 }}>
                            {new Date(kp.observedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }}>
                            {kp.source}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'storms' && (!storms || storms.length === 0) && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 20 }}>
            No recent geomagnetic storm data
          </div>
        )}

        {/* Particles tab */}
        {activeTab === 'particles' && sep && sep.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
              Solar Energetic Particles
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sep.slice(-8).reverse().map((event) => (
                <div
                  key={event.sepID}
                  style={{
                    background: 'rgba(255,200,0,0.06)',
                    border: '1px solid rgba(255,200,0,0.12)',
                    borderRadius: 8,
                    padding: '8px 10px',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 500 }}>
                    {new Date(event.eventTime).toLocaleDateString()} {new Date(event.eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {event.instruments && event.instruments.length > 0 && (
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                      {event.instruments.map(i => i.displayName).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'particles' && (!sep || sep.length === 0) && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 20 }}>
            No recent solar energetic particle data
          </div>
        )}

        {/* Shocks tab */}
        {activeTab === 'shocks' && ips && ips.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
              Interplanetary Shocks
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ips.slice(-8).reverse().map((event) => (
                <div
                  key={event.activityID}
                  style={{
                    background: 'rgba(100,180,255,0.06)',
                    border: '1px solid rgba(100,180,255,0.12)',
                    borderRadius: 8,
                    padding: '8px 10px',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 500 }}>
                    {new Date(event.eventTime).toLocaleDateString()} {new Date(event.eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {event.location && (
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                      Location: {event.location}
                    </div>
                  )}
                  {event.instruments && event.instruments.length > 0 && (
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                      {event.instruments.map(i => i.displayName).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'shocks' && (!ips || ips.length === 0) && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 20 }}>
            No recent interplanetary shock data
          </div>
        )}
      </div>
    </div>
  )
}
