import { useMemo } from 'react'
import * as THREE from 'three'

interface RingsProps {
  innerRadius: number  // scene units (planet radius * multiplier)
  outerRadius: number
  color?: string
  opacity?: number
  planetId?: string
}

export function Rings({
  innerRadius,
  outerRadius,
  color: _color = '#c4a882',
  opacity = 0.5,
  planetId = 'saturn',
}: RingsProps) {
  const geometry = useMemo(() => {
    const segments = 128
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, segments)

    // Fix UV mapping for rings -map to radial distance
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

  // Procedural ring color variation -- varies by planet
  const ringTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 1
    const ctx = canvas.getContext('2d')!

    if (planetId === 'saturn') {
      // Saturn: detailed rings with Cassini Division and Encke Gap
      for (let x = 0; x < 512; x++) {
        const t = x / 512
        // Cassini Division at ~0.50 of ring span (wider for visibility)
        const cassini = 1 - Math.exp(-Math.pow((t - 0.50) / 0.04, 2))
        // Encke Gap at ~0.83 of ring span
        const encke = 1 - Math.exp(-Math.pow((t - 0.83) / 0.01, 2))
        // General ring density
        const density = (Math.sin(t * Math.PI * 8) * 0.2 + 0.8) * cassini * encke
        // Taper at edges
        const edgeFade = Math.min(t * 5, (1 - t) * 5, 1)

        const alpha = density * edgeFade * 0.7

        // Slight color variation
        const r = Math.floor(196 + Math.sin(t * 20) * 20)
        const g = Math.floor(168 + Math.sin(t * 15 + 1) * 15)
        const b = Math.floor(130 + Math.sin(t * 12 + 2) * 10)

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.fillRect(x, 0, 1, 1)
      }
    } else {
      // Jupiter, Uranus, Neptune: faint, simple thin ring band
      for (let x = 0; x < 512; x++) {
        const t = x / 512
        // Simple bell-curve density peaking in center of ring
        const density = Math.exp(-Math.pow((t - 0.5) / 0.3, 2))
        // Taper at edges
        const edgeFade = Math.min(t * 5, (1 - t) * 5, 1)
        const alpha = density * edgeFade * 0.25

        // Darker, muted color for faint rings
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
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}
