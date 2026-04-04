import { Skybox } from './Skybox'
import { Sun } from './Sun'
import { CameraController } from './CameraController'

export function Scene() {
  return (
    <>
      <CameraController />
      <Skybox />
      <Sun />
    </>
  )
}
