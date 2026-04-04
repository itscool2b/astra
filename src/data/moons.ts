import { MoonData } from './types'

// Orbital elements for moons are relative to parent, with semiMajorAxis in AU
// For moons, we use simplified circular-ish orbits since the visual difference is negligible
const kmToAU = (km: number) => km / 1.496e8

export const MOONS: MoonData[] = [
  // Earth
  {
    id: 'moon', name: 'Moon', parentId: 'earth',
    orbit: { semiMajorAxis: kmToAU(384400), eccentricity: 0.0549, inclination: 5.145, longitudeOfAscendingNode: 125.08, argumentOfPerihelion: 318.15, meanAnomalyAtEpoch: 135.27, epoch: 2451545.0, period: 0.0748 },
    physical: { radius: 1737.4, mass: 7.342e22, albedo: 0.12 },
    description: 'Earth\'s only natural satellite. The fifth-largest moon in the solar system and the largest relative to its parent planet.',
    textureId: 'moon',
  },
  // Mars
  {
    id: 'phobos', name: 'Phobos', parentId: 'mars',
    orbit: { semiMajorAxis: kmToAU(9376), eccentricity: 0.0151, inclination: 1.093, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.000877 },
    physical: { radius: 11.267, albedo: 0.071 },
    discoverer: 'Asaph Hall', discoveryYear: 1877,
    description: 'Mars\'s larger moon, slowly spiraling inward. Will either crash into Mars or break apart into a ring in ~50 million years.',
  },
  {
    id: 'deimos', name: 'Deimos', parentId: 'mars',
    orbit: { semiMajorAxis: kmToAU(23460), eccentricity: 0.00033, inclination: 0.93, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.003455 },
    physical: { radius: 6.2, albedo: 0.068 },
    discoverer: 'Asaph Hall', discoveryYear: 1877,
    description: 'Mars\'s smaller, more distant moon. Likely a captured asteroid.',
  },
  // Jupiter -- Galilean moons
  {
    id: 'io', name: 'Io', parentId: 'jupiter',
    orbit: { semiMajorAxis: kmToAU(421700), eccentricity: 0.0041, inclination: 0.05, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.00485 },
    physical: { radius: 1821.6, mass: 8.9319e22, albedo: 0.63 },
    discoverer: 'Galileo Galilei', discoveryYear: 1610,
    description: 'The most volcanically active body in the solar system, with over 400 active volcanoes driven by tidal heating from Jupiter.',
    textureId: 'io',
  },
  {
    id: 'europa', name: 'Europa', parentId: 'jupiter',
    orbit: { semiMajorAxis: kmToAU(671100), eccentricity: 0.009, inclination: 0.47, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.00972 },
    physical: { radius: 1560.8, mass: 4.7998e22, albedo: 0.67 },
    discoverer: 'Galileo Galilei', discoveryYear: 1610,
    description: 'A prime candidate for extraterrestrial life. Beneath its icy crust lies a global ocean with more water than all of Earth\'s oceans.',
    textureId: 'europa',
  },
  {
    id: 'ganymede', name: 'Ganymede', parentId: 'jupiter',
    orbit: { semiMajorAxis: kmToAU(1070400), eccentricity: 0.0013, inclination: 0.20, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.01959 },
    physical: { radius: 2634.1, mass: 1.4819e23, albedo: 0.43 },
    discoverer: 'Galileo Galilei', discoveryYear: 1610,
    description: 'The largest moon in the solar system -- bigger than Mercury. The only moon known to have its own magnetic field.',
    textureId: 'ganymede',
  },
  {
    id: 'callisto', name: 'Callisto', parentId: 'jupiter',
    orbit: { semiMajorAxis: kmToAU(1882700), eccentricity: 0.0074, inclination: 0.192, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.04570 },
    physical: { radius: 2410.3, mass: 1.0759e23, albedo: 0.17 },
    discoverer: 'Galileo Galilei', discoveryYear: 1610,
    description: 'The most heavily cratered object in the solar system. May also harbor a subsurface ocean.',
    textureId: 'callisto',
  },
  // Saturn
  {
    id: 'mimas', name: 'Mimas', parentId: 'saturn',
    orbit: { semiMajorAxis: kmToAU(185540), eccentricity: 0.0196, inclination: 1.574, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.00259 },
    physical: { radius: 198.2, albedo: 0.962 },
    discoverer: 'William Herschel', discoveryYear: 1789,
    description: 'Known as the "Death Star moon" for its enormous Herschel crater that gives it a striking resemblance to the Star Wars space station.',
  },
  {
    id: 'enceladus', name: 'Enceladus', parentId: 'saturn',
    orbit: { semiMajorAxis: kmToAU(238040), eccentricity: 0.0047, inclination: 0.009, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.00375 },
    physical: { radius: 252.1, mass: 1.08e20, albedo: 1.375 },
    discoverer: 'William Herschel', discoveryYear: 1789,
    description: 'Shoots geysers of water ice into space from its south pole. A prime target in the search for extraterrestrial life.',
  },
  {
    id: 'titan', name: 'Titan', parentId: 'saturn',
    orbit: { semiMajorAxis: kmToAU(1221870), eccentricity: 0.0288, inclination: 0.3485, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.04369 },
    physical: { radius: 2574.7, mass: 1.3452e23, albedo: 0.22 },
    discoverer: 'Christiaan Huygens', discoveryYear: 1655,
    description: 'The only moon with a dense atmosphere and the only body besides Earth with stable surface liquids (methane/ethane lakes).',
    textureId: 'titan',
  },
  {
    id: 'iapetus', name: 'Iapetus', parentId: 'saturn',
    orbit: { semiMajorAxis: kmToAU(3560820), eccentricity: 0.0286, inclination: 15.47, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.21723 },
    physical: { radius: 734.5, albedo: 0.6 },
    discoverer: 'Giovanni Cassini', discoveryYear: 1671,
    description: 'The "yin-yang moon" with one hemisphere bright white ice and the other dark as coal. Has a mysterious equatorial ridge.',
  },
  // Uranus
  {
    id: 'miranda', name: 'Miranda', parentId: 'uranus',
    orbit: { semiMajorAxis: kmToAU(129900), eccentricity: 0.0013, inclination: 4.338, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.00387 },
    physical: { radius: 235.8, albedo: 0.32 },
    discoverer: 'Gerard Kuiper', discoveryYear: 1948,
    description: 'Has one of the most extreme and varied surface topographies in the solar system, with canyons 12x deeper than the Grand Canyon.',
  },
  {
    id: 'ariel', name: 'Ariel', parentId: 'uranus',
    orbit: { semiMajorAxis: kmToAU(190900), eccentricity: 0.0012, inclination: 0.26, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.00693 },
    physical: { radius: 578.9, albedo: 0.53 },
    discoverer: 'William Lassell', discoveryYear: 1851,
    description: 'The brightest and possibly youngest surface of all Uranian moons, with extensive valleys and ridges.',
  },
  {
    id: 'titania', name: 'Titania', parentId: 'uranus',
    orbit: { semiMajorAxis: kmToAU(436300), eccentricity: 0.0011, inclination: 0.34, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.02383 },
    physical: { radius: 788.4, mass: 3.4e21, albedo: 0.35 },
    discoverer: 'William Herschel', discoveryYear: 1787,
    description: 'The largest moon of Uranus and the eighth-largest moon in the solar system.',
  },
  {
    id: 'oberon', name: 'Oberon', parentId: 'uranus',
    orbit: { semiMajorAxis: kmToAU(583500), eccentricity: 0.0014, inclination: 0.058, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.03691 },
    physical: { radius: 761.4, mass: 3.076e21, albedo: 0.31 },
    discoverer: 'William Herschel', discoveryYear: 1787,
    description: 'The outermost major moon of Uranus. Its surface is the most heavily cratered of all Uranian moons.',
  },
  // Neptune
  {
    id: 'triton', name: 'Triton', parentId: 'neptune',
    orbit: { semiMajorAxis: kmToAU(354759), eccentricity: 0.000016, inclination: 156.865, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: -0.01609 },
    physical: { radius: 1353.4, mass: 2.14e22, albedo: 0.76 },
    discoverer: 'William Lassell', discoveryYear: 1846,
    description: 'The only large moon with a retrograde orbit -- likely a captured Kuiper Belt object. Has nitrogen geysers and a thin atmosphere.',
    textureId: 'triton',
  },
  // Pluto
  {
    id: 'charon', name: 'Charon', parentId: 'pluto',
    orbit: { semiMajorAxis: kmToAU(19591), eccentricity: 0.0002, inclination: 0.08, longitudeOfAscendingNode: 0, argumentOfPerihelion: 0, meanAnomalyAtEpoch: 0, epoch: 2451545.0, period: 0.01754 },
    physical: { radius: 606, mass: 1.586e21, albedo: 0.2 },
    discoverer: 'James Christy', discoveryYear: 1978,
    description: 'Pluto\'s largest moon -- so large relative to Pluto that they orbit each other (a binary system). Has canyons, mountains, and a reddish north pole.',
  },
]

export const MOON_MAP = new Map(MOONS.map((m) => [m.id, m]))
export const MOONS_BY_PARENT = MOONS.reduce((acc, m) => {
  const arr = acc.get(m.parentId) || []
  arr.push(m)
  acc.set(m.parentId, arr)
  return acc
}, new Map<string, MoonData[]>())
