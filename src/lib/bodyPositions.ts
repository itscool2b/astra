import * as THREE from 'three'

/**
 * Global registry of current celestial body positions.
 * Updated each frame by the Planet/Moon/DwarfPlanet components.
 * Read by CameraController for fly-to targeting.
 */
class BodyPositionRegistry {
  private positions = new Map<string, THREE.Vector3>()
  private radii = new Map<string, number>()

  set(id: string, position: THREE.Vector3, radius: number) {
    const existing = this.positions.get(id)
    if (existing) {
      existing.copy(position)
    } else {
      this.positions.set(id, position.clone())
    }
    this.radii.set(id, radius)
  }

  get(id: string): THREE.Vector3 | undefined {
    return this.positions.get(id)
  }

  getRadius(id: string): number {
    return this.radii.get(id) || 1
  }
}

export const bodyPositions = new BodyPositionRegistry()
