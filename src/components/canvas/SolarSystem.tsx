import { PLANETS } from '../../data/planets'
import { DWARF_PLANETS } from '../../data/dwarfPlanets'
import { Planet } from './Planet'
import { DwarfPlanet } from './DwarfPlanet'
import { AsteroidBelt } from './AsteroidBelt'

export function SolarSystem() {
  return (
    <group>
      {PLANETS.map((planet) => (
        <Planet key={planet.id} data={planet} />
      ))}
      {DWARF_PLANETS.map((dp) => (
        <DwarfPlanet key={dp.id} data={dp} />
      ))}
      <AsteroidBelt />
    </group>
  )
}
