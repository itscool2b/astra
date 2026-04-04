import { useNASAImages } from '../../../api/hooks'
import { PlanetPanel } from './PlanetPanel'

const ROVER_INFO = [
  { name: 'Curiosity', status: 'Active', launch: '2011-11-26', landing: '2012-08-06', site: 'Gale Crater' },
  { name: 'Perseverance', status: 'Active', launch: '2020-07-30', landing: '2021-02-18', site: 'Jezero Crater' },
  { name: 'Opportunity', status: 'Complete', launch: '2003-07-07', landing: '2004-01-25', site: 'Meridiani Planum' },
  { name: 'Spirit', status: 'Complete', launch: '2003-06-10', landing: '2004-01-04', site: 'Gusev Crater' },
]

export function MarsPanel() {
  const { data: imageData, isLoading } = useNASAImages('mars rover surface')

  const photos = imageData?.collection?.items?.filter(item => item.links && item.links.length > 0) ?? []

  return (
    <div>
      <PlanetPanel id="mars" />

      {/* Rover missions */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
          Mars Rover Missions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ROVER_INFO.map((rover) => (
            <div
              key={rover.name}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{rover.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {rover.site} · Landed {rover.landing}
                </div>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 10,
                  background: rover.status === 'Active' ? 'rgba(68,204,136,0.15)' : 'rgba(255,255,255,0.06)',
                  color: rover.status === 'Active' ? '#44cc88' : 'rgba(255,255,255,0.4)',
                }}
              >
                {rover.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* NASA Image Library photos */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
          Mars Surface Photos
        </div>

        {isLoading && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', padding: 20, textAlign: 'center' }}>
            Loading photos...
          </div>
        )}

        {/* Featured large photo */}
        {photos.length > 0 && (
          <a
            href={photos[0].links![0].href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', marginBottom: 10 }}
          >
            <img
              src={photos[0].links![0].href}
              alt={photos[0].data[0]?.title || 'Mars'}
              style={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
                borderRadius: 8,
              }}
              loading="lazy"
            />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: 500 }}>
              {photos[0].data[0]?.title}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
              {photos[0].data[0]?.date_created?.split('T')[0]}
            </div>
          </a>
        )}

        {/* Photo grid */}
        {photos.length > 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {photos.slice(1, 7).map((item, i) => (
              <a
                key={item.data[0]?.nasa_id || i}
                href={item.links![0].href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block' }}
              >
                <img
                  src={item.links![0].href}
                  alt={item.data[0]?.title || 'Mars'}
                  style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }}
                  loading="lazy"
                />
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.data[0]?.title}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
