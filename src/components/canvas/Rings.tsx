import { useMemo, useState } from 'react'
import * as THREE from 'three'

const textureLoader = new THREE.TextureLoader()

interface RingsProps {
  innerRadius: number  // scene units (planet radius * multiplier)
  outerRadius: number
  color?: string
  opacity?: number
  planetId?: string
  ringAlphaTexturePath?: string
}

export function Rings({
  innerRadius,
  outerRadius,
  color: _color = '#c4a882',
  opacity = 0.5,
  planetId = 'saturn',
  ringAlphaTexturePath,
}: RingsProps) {
  const [alphaTexLoaded, setAlphaTexLoaded] = useState(false)

  const alphaTexture = useMemo(() => {
    if (!ringAlphaTexturePath) return null
    try {
      return textureLoader.load(
        `/textures/${ringAlphaTexturePath}`,
        () => setAlphaTexLoaded(true),
      )
    } catch {
      return null
    }
  }, [ringAlphaTexturePath])

  const geometry = useMemo(() => {
    const segments = 128
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, segments)

    // Fix UV mapping for rings - map to radial distance
    const pos = geo.attributes.position
    const uv = geo.attributes.uv
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const dist = Math.sqrt(x * x + y * y)
      const t = (dist - innerRadius) / (outerRadius - innerRadius)
      uv.setXY(i, t, 0.5)
    }
    uv.needsUpdate = true

    return geo
  }, [innerRadius, outerRadius])

  // Procedural ring color texture -- varies by planet
  const ringTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1
    const ctx = canvas.getContext('2d')!

    if (planetId === 'saturn') {
      // Saturn: realistic ice-white rings with warm band variations
      for (let x = 0; x < 1024; x++) {
        const t = x / 1024

        // Ring structure zones (B ring brightest, A ring moderate, C ring dim)
        const cRing = t < 0.25 ? Math.smoothstep(0, 0.25, t) * 0.4 : 0     // inner C ring (faint)
        const bRing = t >= 0.25 && t < 0.50 ? 0.9 + Math.sin(t * 40) * 0.1 : 0 // B ring (bright)
        const cassiniGap = t >= 0.50 && t < 0.56 ? 0.05 : 0                    // Cassini Division
        const aRing = t >= 0.56 && t < 0.85 ? 0.7 + Math.sin(t * 30) * 0.1 : 0 // A ring
        const enckeGap = (t >= 0.74 && t < 0.76) ? -0.5 : 0                     // Encke Gap
        const fRing = t >= 0.90 ? Math.exp(-Math.pow((t - 0.93) / 0.02, 2)) * 0.3 : 0 // F ring (thin)

        let density = cRing + bRing + cassiniGap + aRing + fRing
        density = Math.max(0, density + enckeGap)

        // Taper at extreme edges
        const edgeFade = Math.min(t * 8, (1 - t) * 8, 1)
        const alpha = density * edgeFade

        // Realistic Saturn ring colors: pale cream/ice with subtle warm tones
        const r = Math.floor(225 + Math.sin(t * 25) * 15)
        const g = Math.floor(215 + Math.sin(t * 18 + 0.5) * 12)
        const b = Math.floor(195 + Math.sin(t * 14 + 1.0) * 10)

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.fillRect(x, 0, 1, 1)
      }
    } else {
      // Jupiter, Uranus, Neptune: faint, simple thin ring band
      for (let x = 0; x < 1024; x++) {
        const t = x / 1024
        const density = Math.exp(-Math.pow((t - 0.5) / 0.3, 2))
        const edgeFade = Math.min(t * 5, (1 - t) * 5, 1)
        const alpha = density * edgeFade * 0.25

        const r = Math.floor(120 + Math.sin(t * 10) * 10)
        const g = Math.floor(110 + Math.sin(t * 8 + 1) * 8)
        const b = Math.floor(100 + Math.sin(t * 6 + 2) * 6)

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.fillRect(x, 0, 1, 1)
      }
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.ClampToEdgeWrapping
    return tex
  }, [planetId])

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshBasicMaterial
        map={ringTexture}
        alphaMap={alphaTexLoaded ? alphaTexture : null}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// Polyfill Math.smoothstep if not available
if (!(Math as any).smoothstep) {
  (Math as any).smoothstep = (edge0: number, edge1: number, x: number) => {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)
  }
}
declare global {
  interface Math {
    smoothstep(edge0: number, edge1: number, x: number): number
  }
}
