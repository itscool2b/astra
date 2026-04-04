import { OrbitalElements } from '../data/types'

const DEG_TO_RAD = Math.PI / 180
const TWO_PI = 2 * Math.PI
const J2000 = 2451545.0 // Julian date for J2000 epoch

/**
 * Convert a Date to Julian Date
 */
export function dateToJulian(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5
}

/**
 * Convert Julian Date to Date
 */
export function julianToDate(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000)
}

/**
 * Solve Kepler's equation M = E - e*sin(E) for E using Newton-Raphson.
 * M: mean anomaly (radians)
 * e: eccentricity
 * Returns: eccentric anomaly E (radians)
 */
export function solveKepler(M: number, e: number, tolerance = 1e-10): number {
  // Normalize M to [0, 2pi)
  let Mn = M % TWO_PI
  if (Mn < 0) Mn += TWO_PI

  // Initial guess
  let E = Mn + e * Math.sin(Mn) * (1 + e * Math.cos(Mn))

  // Newton-Raphson iteration
  for (let i = 0; i < 30; i++) {
    const dE = (E - e * Math.sin(E) - Mn) / (1 - e * Math.cos(E))
    E -= dE
    if (Math.abs(dE) < tolerance) break
  }

  return E
}

/**
 * Compute true anomaly from eccentric anomaly
 */
export function trueAnomalyFromEccentric(E: number, e: number): number {
  return 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  )
}

/**
 * Compute 3D position in heliocentric ecliptic coordinates (AU) at a given Julian Date.
 * Returns [x, y, z] in AU.
 */
export function computePosition(
  orbit: OrbitalElements,
  jd: number
): [number, number, number] {
  // Mean motion (radians per day)
  const n = TWO_PI / (orbit.period * 365.25)

  // Time since epoch in days
  const dt = jd - orbit.epoch

  // Mean anomaly at time jd
  const M = (orbit.meanAnomalyAtEpoch * DEG_TO_RAD + n * dt) % TWO_PI

  // Solve Kepler's equation for eccentric anomaly
  const E = solveKepler(M, orbit.eccentricity)

  // True anomaly
  const v = trueAnomalyFromEccentric(E, orbit.eccentricity)

  // Distance from focus
  const r = orbit.semiMajorAxis * (1 - orbit.eccentricity * Math.cos(E))

  // Position in orbital plane
  const xOrb = r * Math.cos(v)
  const yOrb = r * Math.sin(v)

  // Convert orbital elements to radians
  const Omega = orbit.longitudeOfAscendingNode * DEG_TO_RAD
  const omega = orbit.argumentOfPerihelion * DEG_TO_RAD
  const I = orbit.inclination * DEG_TO_RAD

  // Rotation to heliocentric ecliptic coordinates
  const cosOmega = Math.cos(Omega)
  const sinOmega = Math.sin(Omega)
  const cosomega = Math.cos(omega)
  const sinomega = Math.sin(omega)
  const cosI = Math.cos(I)
  const sinI = Math.sin(I)

  const x = xOrb * (cosOmega * cosomega - sinOmega * sinomega * cosI) -
            yOrb * (cosOmega * sinomega + sinOmega * cosomega * cosI)

  const y = xOrb * (sinOmega * cosomega + cosOmega * sinomega * cosI) -
            yOrb * (sinOmega * sinomega - cosOmega * cosomega * cosI)

  const z = xOrb * (sinomega * sinI) + yOrb * (cosomega * sinI)

  return [x, y, z]
}

/**
 * Compute an array of [x, y, z] points tracing the full orbit ellipse.
 * Used for drawing orbit lines. `segments` controls smoothness.
 */
export function computeOrbitPath(
  orbit: OrbitalElements,
  segments = 256
): [number, number, number][] {
  const points: [number, number, number][] = []

  const Omega = orbit.longitudeOfAscendingNode * DEG_TO_RAD
  const omega = orbit.argumentOfPerihelion * DEG_TO_RAD
  const I = orbit.inclination * DEG_TO_RAD

  const cosOmega = Math.cos(Omega)
  const sinOmega = Math.sin(Omega)
  const cosomega = Math.cos(omega)
  const sinomega = Math.sin(omega)
  const cosI = Math.cos(I)
  const sinI = Math.sin(I)

  for (let i = 0; i <= segments; i++) {
    const v = (i / segments) * TWO_PI
    const r = orbit.semiMajorAxis * (1 - orbit.eccentricity ** 2) / (1 + orbit.eccentricity * Math.cos(v))

    const xOrb = r * Math.cos(v)
    const yOrb = r * Math.sin(v)

    const x = xOrb * (cosOmega * cosomega - sinOmega * sinomega * cosI) -
              yOrb * (cosOmega * sinomega + sinOmega * cosomega * cosI)

    const y = xOrb * (sinOmega * cosomega + cosOmega * sinomega * cosI) -
              yOrb * (sinOmega * sinomega - cosOmega * cosomega * cosI)

    const z = xOrb * (sinomega * sinI) + yOrb * (cosomega * sinI)

    points.push([x, y, z])
  }

  return points
}
