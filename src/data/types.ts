export interface OrbitalElements {
  semiMajorAxis: number      // AU
  eccentricity: number
  inclination: number        // degrees
  longitudeOfAscendingNode: number  // degrees (Omega)
  argumentOfPerihelion: number      // degrees (omega)
  meanAnomalyAtEpoch: number       // degrees (M0)
  epoch: number              // Julian date of M0
  period: number             // Earth years
}

export interface PhysicalData {
  radius: number             // km
  mass: number               // kg
  density: number            // g/cm3
  gravity: number            // m/s2
  escapeVelocity: number     // km/s
  rotationPeriod: number     // hours (negative = retrograde)
  axialTilt: number          // degrees
  meanTemperature: number    // C
  minTemperature?: number    // C
  maxTemperature?: number    // C
}

export interface AtmosphereData {
  composition: { molecule: string; percentage: number }[]
  surfacePressure?: number   // atm
}

export interface PlanetData {
  id: string
  name: string
  type: 'terrestrial' | 'gas-giant' | 'ice-giant'
  orbit: OrbitalElements
  physical: PhysicalData
  atmosphere?: AtmosphereData
  hasRings: boolean
  ringInnerRadius?: number   // planet radii
  ringOuterRadius?: number   // planet radii
  description: string
  discoverer?: string
  discoveryYear?: number
  color: string              // hex color for orbit line and labels
  textureSet: {
    albedo: string
    normal?: string
    specular?: string
    clouds?: string
    night?: string
    ring?: string
    ringAlpha?: string
  }
}

export interface MoonData {
  id: string
  name: string
  parentId: string
  orbit: OrbitalElements     // relative to parent, AU scaled to parent system
  physical: {
    radius: number           // km
    mass?: number            // kg
    albedo?: number
  }
  discoverer?: string
  discoveryYear?: number
  description: string
  textureId?: string
}

export interface DwarfPlanetData {
  id: string
  name: string
  orbit: OrbitalElements
  physical: {
    radius: number
    mass?: number
    density?: number
    rotationPeriod?: number
    axialTilt?: number
    meanTemperature?: number
  }
  description: string
  discoverer: string
  discoveryYear: number
  color: string
}

export interface SearchableObject {
  id: string
  name: string
  type: 'star' | 'planet' | 'dwarf-planet' | 'moon' | 'asteroid' | 'spacecraft'
  parentId?: string
  parentName?: string
}
