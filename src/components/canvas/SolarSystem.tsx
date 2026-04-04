import { PLANETS } from '../../data/planets'
import { DWARF_PLANETS } from '../../data/dwarfPlanets'
import { SPACECRAFT } from '../../data/spacecraft'
import { Planet } from './Planet'
import { DwarfPlanet } from './DwarfPlanet'
import { Spacecraft } from './Spacecraft'
import { AsteroidBelt } from './AsteroidBelt'
import { NEOAsteroids } from './NEOAsteroids'

export function SolarSystem() {
  return (
    <group>
      {PLANETS.map((planet) => (
        <Planet key={planet.id} data={planet} />
      ))}
      {DWARF_PLANETS.map((dp) => (
        <DwarfPlanet key={dp.id} data={dp} />
      ))}
      {SPACECRAFT.map((sc) => (
        <Spacecraft key={sc.id} data={sc} />
      ))}
      <AsteroidBelt />
      <NEOAsteroids />
    </group>
  )
}
