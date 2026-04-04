import type { ScaleMode } from '../store/useStore'

// 1 AU in scene units (Three.js units)
// In compressed mode, we use a log scale so everything fits on screen
// In realistic mode, 1 AU = 100 scene units

const AU_REALISTIC = 100 // 1 AU = 100 Three.js units
const SUN_RADIUS_KM = 695700
const AU_KM = 1.496e8

/**
 * Convert AU distance to scene units based on scale mode.
 * Compressed mode uses a logarithmic scaling to keep all planets visible.
 */
export function auToScene(au: number, mode: ScaleMode): number {
  if (mode === 'realistic') {
    return au * AU_REALISTIC
  }
  // Compressed: logarithmic scale preserving sign
  // Maps 0.39 AU (Mercury) -> ~15 units, 30 AU (Neptune) -> ~120 units
  if (au === 0) return 0
  const sign = au < 0 ? -1 : 1
  const abs = Math.abs(au)
  return sign * Math.log2(1 + abs * 10) * 14
}

/**
 * Convert planet radius (km) to scene units.
 * Always exaggerated so planets are visible/clickable.
 * In compressed mode, exaggeration is stronger.
 */
export function radiusToScene(radiusKm: number, mode: ScaleMode): number {
  // Realistic: planet radii are still slightly exaggerated for visibility
  // True scale: Earth at 1 AU = 100 units would be 0.0043 units (invisible)
  // We use a minimum visible size + log scale
  const trueRadius = (radiusKm / AU_KM) * (mode === 'realistic' ? AU_REALISTIC : 50)

  if (mode === 'realistic') {
    // Exaggerate by 200x so planets are at least visible dots
    return Math.max(trueRadius * 200, 0.1)
  }

  // Compressed: stronger exaggeration, log-scaled so gas giants don't dominate
  const logRadius = Math.log2(1 + radiusKm / 1000) * 0.4
  return Math.max(logRadius, 0.15)
}

/**
 * Convert Sun radius to scene units (always larger than planets).
 */
export function sunRadiusToScene(mode: ScaleMode): number {
  if (mode === 'realistic') {
    // True Sun radius at 100 units/AU = 0.465 units (tiny).
    // Exaggerate 20x so it's visible but doesn't swallow Mercury (at 38.7 units).
    return (SUN_RADIUS_KM / AU_KM) * AU_REALISTIC * 20
  }
  return 2.0 // Fixed size in compressed mode
}

/**
 * Get the camera distance for a nice orbit view of an object.
 */
export function getOrbitDistance(objectRadius: number): number {
  return objectRadius * 4
}
