import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  ToneMapping,
  Vignette,
  Noise,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'

export function Effects() {
  const quality = useStore((s) => s.quality)

  // Skip heavy effects on low quality
  if (quality === 'low') {
    return (
      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.5}
          mipmapBlur
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={0}>
      {/* Bloom — aggressive on sun, subtle elsewhere */}
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.6}
        mipmapBlur
        radius={0.8}
      />

      {/* ACES Filmic tone mapping — cinematic color science */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

      {/* Chromatic aberration — subtle edge-of-lens effect */}
      {quality === 'high' && (
        <ChromaticAberration
          offset={new THREE.Vector2(0.0008, 0.0008)}
          radialModulation
          modulationOffset={0.5}
          blendFunction={BlendFunction.NORMAL}
        />
      )}

      {/* Film grain — barely perceptible */}
      {quality === 'high' && (
        <Noise
          premultiply
          blendFunction={BlendFunction.SOFT_LIGHT}
          opacity={0.15}
        />
      )}

      {/* Vignette — focus the eye */}
      <Vignette
        offset={0.3}
        darkness={0.6}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
