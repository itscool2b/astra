export interface SpacecraftInfo {
  id: string
  name: string
  horizonsId: string
  launchDate: string
  description: string
  color: string
  missionUrl: string
}

export const SPACECRAFT: SpacecraftInfo[] = [
  {
    id: 'jwst',
    name: 'James Webb Space Telescope',
    horizonsId: '-170',
    launchDate: '2021-12-25',
    description: 'Infrared space observatory at the Earth-Sun L2 point, 1.5 million km from Earth. Successor to the Hubble Space Telescope.',
    color: '#ffd700',
    missionUrl: 'https://webb.nasa.gov',
  },
  {
    id: 'voyager1',
    name: 'Voyager 1',
    horizonsId: '-31',
    launchDate: '1977-09-05',
    description: 'The most distant human-made object. Launched in 1977, now in interstellar space beyond the heliopause.',
    color: '#00ccff',
    missionUrl: 'https://voyager.jpl.nasa.gov',
  },
  {
    id: 'voyager2',
    name: 'Voyager 2',
    horizonsId: '-32',
    launchDate: '1977-08-20',
    description: 'The only spacecraft to visit all four giant planets. Now in interstellar space, still transmitting data.',
    color: '#00aadd',
    missionUrl: 'https://voyager.jpl.nasa.gov',
  },
  {
    id: 'tess',
    name: 'TESS',
    horizonsId: '-95',
    launchDate: '2018-04-18',
    description: 'Transiting Exoplanet Survey Satellite. Scanning the sky for planets orbiting nearby bright stars.',
    color: '#44cc88',
    missionUrl: 'https://tess.mit.edu',
  },
]

export const SPACECRAFT_MAP = new Map(SPACECRAFT.map(s => [s.id, s]))
