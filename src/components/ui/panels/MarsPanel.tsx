import { useState, useMemo } from 'react'
import { useMarsRoverPhotos } from '../../../api/hooks'
import { PlanetPanel } from './PlanetPanel'

const ROVERS = ['curiosity', 'perseverance'] as const
const CAMERAS = ['ALL', 'FHAZ', 'RHAZ', 'NAVCAM', 'MAST', 'CHEMCAM', 'MAHLI', 'MARDI'] as const

const ROVER_INFO: Record<string, { status: string; launch: string; landing: string }> = {
  curiosity: { status: 'Active', launch: '2011-11-26', landing: '2012-08-06' },
  perseverance: { status: 'Active', launch: '2020-07-30', landing: '2021-02-18' },
}

export function MarsPanel() {
  const [activeRover, setActiveRover] = useState<string>('curiosity')
  const [activeCamera, setActiveCamera] = useState<string>('ALL')
  const { data: photos, isLoading } = useMarsRoverPhotos(activeRover)

  const roverInfo = ROVER_INFO[activeRover]

  const filteredPhotos = useMemo(() => {
    if (!photos) return []
    if (activeCamera === 'ALL') return photos
    return photos.filter((p) => p.camera.name === activeCamera)
  }, [photos, activeCamera])

  const latestPhoto = filteredPhotos[0]
  const latestSol = photos?.[0]?.sol

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 10px',
    borderRadius: 12,
    border: 'none',
    background: active ? 'rgba(193,68,14,0.3)' : 'rgba(255,255,255,0.06)',
    color: active ? '#ff8c5a' : 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: 500,
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    transition: 'all 0.15s',
  })

  return (
    <div>
      <PlanetPanel id="mars" />

      {/* Rover Photos */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
          Mars Rover Photos
        </div>

        {/* Rover selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {ROVERS.map((rover) => (
            <button
              key={rover}
              onClick={() => { setActiveRover(rover); setActiveCamera('ALL') }}
              style={{
                padding: '6px 14px',
                borderRadius: 16,
                border: 'none',
                background: activeRover === rover ? 'rgba(193,68,14,0.3)' : 'rgba(255,255,255,0.06)',
                color: activeRover === rover ? '#ff8c5a' : 'rgba(255,255,255,0.5)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {rover}
            </button>
          ))}
        </div>

        {/* Mission status */}
        {roverInfo && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8,
            padding: '10px 12px',
            marginBottom: 12,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px 12px',
            fontSize: 11,
          }}>
            <div>
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>Rover </span>
              <span style={{ color: 'rgba(255,255,255,0.8)', textTransform: 'capitalize' }}>{activeRover}</span>
            </div>
            <div>
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>Status </span>
              <span style={{ color: '#44cc88' }}>{roverInfo.status}</span>
            </div>
            <div>
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>Launch </span>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{roverInfo.launch}</span>
            </div>
            <div>
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>Landing </span>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{roverInfo.landing}</span>
            </div>
            {latestSol !== undefined && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>Latest Sol </span>
                <span style={{ color: '#ff8c5a' }}>{latestSol}</span>
              </div>
            )}
          </div>
        )}

        {/* Camera filter chips */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
          {CAMERAS.map((cam) => (
            <button
              key={cam}
              onClick={() => setActiveCamera(cam)}
              style={chipStyle(activeCamera === cam)}
            >
              {cam}
            </button>
          ))}
        </div>

        {isLoading && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', padding: 20, textAlign: 'center' }}>
            Loading photos...
          </div>
        )}

        {/* Featured large photo */}
        {latestPhoto && (
          <a
            href={latestPhoto.img_src}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', marginBottom: 10 }}
          >
            <img
              src={latestPhoto.img_src}
              alt={`${latestPhoto.rover.name} - ${latestPhoto.camera.full_name}`}
              style={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
                borderRadius: 8,
              }}
              loading="lazy"
            />
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              {latestPhoto.camera.full_name} · Sol {latestPhoto.sol} · {latestPhoto.earth_date}
            </div>
          </a>
        )}

        {/* Photo grid */}
        {filteredPhotos.length > 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {filteredPhotos.slice(1, 7).map((photo) => (
              <a
                key={photo.id}
                href={photo.img_src}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block' }}
              >
                <img
                  src={photo.img_src}
                  alt={`${photo.rover.name} - ${photo.camera.full_name}`}
                  style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }}
                  loading="lazy"
                />
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                  {photo.camera.name} · Sol {photo.sol}
                </div>
              </a>
            ))}
          </div>
        )}

        {filteredPhotos.length === 0 && !isLoading && photos && photos.length > 0 && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 12 }}>
            No photos with {activeCamera} camera for this sol
          </div>
        )}
      </div>
    </div>
  )
}
