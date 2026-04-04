import { PLANETS } from '../../data/planets'
import { Planet } from './Planet'

export function SolarSystem() {
  return (
    <group>
      {PLANETS.map((planet) => (
        <Planet key={planet.id} data={planet} />
      ))}
    </group>
  )
}
