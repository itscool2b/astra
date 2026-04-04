import { useState } from 'react'
import { useMarsRoverPhotos } from '../../../api/hooks'
import { PlanetPanel } from './PlanetPanel'

const ROVERS = ['curiosity', 'perseverance']

export function MarsPanel() {
  const [activeRover, setActiveRover] = useState('curiosity')
  const { data: photos, isLoading } = useMarsRoverPhotos(activeRover)

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
              onClick={() => setActiveRover(rover)}
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

        {isLoading && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', padding: 20, textAlign: 'center' }}>
            Loading photos...
          </div>
        )}

        {photos && photos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {photos.slice(0, 6).map((photo) => (
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
      </div>
    </div>
  )
}
