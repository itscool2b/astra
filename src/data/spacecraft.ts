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
  {
    id: 'parker',
    name: 'Parker Solar Probe',
    horizonsId: '-96',
    launchDate: '2018-08-12',
    description: 'The closest human-made object to the Sun. Making repeated close approaches to study the solar corona and solar wind.',
    color: '#ff6600',
    missionUrl: 'https://parkersolarprobe.jhuapl.edu',
  },
  {
    id: 'juno',
    name: 'Juno',
    horizonsId: '-61',
    launchDate: '2011-08-05',
    description: 'Orbiting Jupiter to study its atmosphere, magnetic field, and interior structure. Extended mission includes flybys of Galilean moons.',
    color: '#99cc33',
    missionUrl: 'https://www.nasa.gov/mission_pages/juno/main/index.html',
  },
  {
    id: 'newhorizons',
    name: 'New Horizons',
    horizonsId: '-98',
    launchDate: '2006-01-19',
    description: 'First spacecraft to fly by Pluto (2015) and Kuiper Belt object Arrokoth (2019). Now exploring the outer solar system.',
    color: '#cc88ff',
    missionUrl: 'https://www.nasa.gov/mission_pages/newhorizons/main/index.html',
  },
  {
    id: 'osirisapex',
    name: 'OSIRIS-APEX',
    horizonsId: '-64',
    launchDate: '2016-09-08',
    description: 'Originally OSIRIS-REx, collected samples from asteroid Bennu. Now redirected as OSIRIS-APEX to study asteroid Apophis during its 2029 Earth flyby.',
    color: '#ff4488',
    missionUrl: 'https://science.nasa.gov/mission/osiris-rex/',
  },
]

export const SPACECRAFT_MAP = new Map(SPACECRAFT.map(s => [s.id, s]))
