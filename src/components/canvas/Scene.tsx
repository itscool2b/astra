import { Skybox } from './Skybox'
import { Sun } from './Sun'
import { CameraController } from './CameraController'
import { SolarSystem } from './SolarSystem'

export function Scene() {
  return (
    <>
      <CameraController />
      <Skybox />
      <Sun />
      <SolarSystem />
    </>
  )
}
