import { Skybox } from './Skybox'
import { Sun } from './Sun'
import { CameraController } from './CameraController'
import { SolarSystem } from './SolarSystem'
import { Effects } from './Effects'

export function Scene() {
  return (
    <>
      <CameraController />
      <Skybox />
      <Sun />
      <SolarSystem />
      <Effects />
    </>
  )
}
