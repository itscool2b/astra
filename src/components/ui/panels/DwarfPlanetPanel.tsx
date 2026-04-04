import { DWARF_PLANET_MAP } from '../../../data/dwarfPlanets'

export function DwarfPlanetPanel({ id }: { id: string }) {
  const dp = DWARF_PLANET_MAP.get(id)
  if (!dp) return null

  return (
    <div>
      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {dp.physical.radius && (
          <div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Diameter</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{(dp.physical.radius * 2).toLocaleString()} km</div>
          </div>
        )}
        {dp.physical.density && (
          <div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Density</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{dp.physical.density} g/cm3</div>
          </div>
        )}
        {dp.physical.rotationPeriod && (
          <div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Day Length</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{Math.abs(dp.physical.rotationPeriod).toFixed(1)}h</div>
          </div>
        )}
        {dp.physical.meanTemperature !== undefined && (
          <div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.35)' }}>Temperature</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{dp.physical.meanTemperature}°C</div>
          </div>
        )}
      </div>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>{dp.description}</p>
      </div>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Discovery</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          Discovered by {dp.discoverer} in {dp.discoveryYear}
        </div>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Orbital Parameters</div>
        {([
          ['Semi-major axis', `${dp.orbit.semiMajorAxis.toFixed(2)} AU`],
          ['Eccentricity', dp.orbit.eccentricity.toFixed(4)],
          ['Inclination', `${dp.orbit.inclination.toFixed(2)}\u00B0`],
          ['Orbital period', `${dp.orbit.period.toFixed(1)} years`],
        ] as const).map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
