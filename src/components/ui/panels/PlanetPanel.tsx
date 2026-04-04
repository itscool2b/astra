import { PLANET_MAP } from '../../../data/planets'
import { MOONS_BY_PARENT } from '../../../data/moons'
import { useStore, type CelestialTarget } from '../../../store/useStore'

interface StatProps {
  label: string
  value: string
}

function Stat({ label, value }: StatProps) {
  return (
    <div>
      <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  )
}

export function PlanetPanel({ id }: { id: string }) {
  const planet = PLANET_MAP.get(id)
  const moons = MOONS_BY_PARENT.get(id) || []
  const selectObject = useStore((s) => s.selectObject)
  const flyTo = useStore((s) => s.flyTo)

  if (!planet) return null

  const { physical: p, atmosphere: atm } = planet

  const formatNum = (n: number) => {
    if (n >= 1e24) return `${(n / 1e24).toFixed(2)} × 10²⁴ kg`
    if (n >= 1e23) return `${(n / 1e23).toFixed(2)} × 10²³ kg`
    if (n >= 1e27) return `${(n / 1e27).toFixed(2)} × 10²⁷ kg`
    if (n >= 1e26) return `${(n / 1e26).toFixed(2)} × 10²⁶ kg`
    if (n >= 1e25) return `${(n / 1e25).toFixed(2)} × 10²⁵ kg`
    return `${n.toExponential(2)} kg`
  }

  const handleMoonClick = (moonId: string, moonName: string) => {
    const target: CelestialTarget = { id: moonId, name: moonName, type: 'moon', parentId: id }
    selectObject(target)
    flyTo(target)
  }

  return (
    <div>
      {/* Stats grid */}
      <div
        style={{
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Stat label="Diameter" value={`${(p.radius * 2).toLocaleString()} km`} />
        <Stat label="Mass" value={formatNum(p.mass)} />
        <Stat label="Gravity" value={`${p.gravity} m/s²`} />
        <Stat label="Temperature" value={
          p.minTemperature !== undefined && p.maxTemperature !== undefined
            ? `${p.minTemperature}° to ${p.maxTemperature}°C`
            : `${p.meanTemperature}°C`
        } />
        <Stat label="Day Length" value={
          Math.abs(p.rotationPeriod) < 48
            ? `${Math.abs(p.rotationPeriod).toFixed(1)}h`
            : `${(Math.abs(p.rotationPeriod) / 24).toFixed(1)} days`
        } />
        <Stat label="Year Length" value={
          planet.orbit.period < 2
            ? `${(planet.orbit.period * 365.25).toFixed(1)} days`
            : `${planet.orbit.period.toFixed(1)} years`
        } />
      </div>

      {/* Description */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
          {planet.description}
        </p>
      </div>

      {/* Orbital parameters */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Orbital Parameters</div>
        {[
          ['Semi-major axis', `${planet.orbit.semiMajorAxis.toFixed(3)} AU`],
          ['Eccentricity', planet.orbit.eccentricity.toFixed(4)],
          ['Inclination', `${planet.orbit.inclination.toFixed(3)}°`],
          ['Axial tilt', `${p.axialTilt.toFixed(2)}°`],
          ['Escape velocity', `${p.escapeVelocity} km/s`],
          ['Density', `${p.density} g/cm³`],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}
          >
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>

      {/* Atmosphere */}
      {atm && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Atmosphere</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {atm.composition.map(({ molecule, percentage }) => (
              <span
                key={molecule}
                style={{
                  background: 'rgba(74,144,217,0.12)',
                  border: '1px solid rgba(74,144,217,0.25)',
                  borderRadius: 12,
                  padding: '3px 10px',
                  fontSize: 11,
                }}
              >
                {molecule} {percentage}%
              </span>
            ))}
          </div>
          {atm.surfacePressure !== undefined && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
              Surface pressure: {atm.surfacePressure} atm
            </div>
          )}
        </div>
      )}

      {/* Moons */}
      {moons.length > 0 && (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
            Moons ({moons.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {moons.map((moon) => (
              <button
                key={moon.id}
                onClick={() => handleMoonClick(moon.id, moon.name)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#e0e0e0',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                  fontSize: 13,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              >
                <span style={{ fontWeight: 500 }}>{moon.name}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                  {moon.physical.radius > 100 ? `${moon.physical.radius.toLocaleString()} km` : `${moon.physical.radius} km`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
