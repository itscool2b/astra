uniform vec3 uSunPosition;
uniform vec3 uAtmosphereColor;
uniform float uAtmosphereIntensity;
uniform float uAtmospherePower;

varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  // View direction
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  vec3 sunDir = normalize(uSunPosition - vWorldPosition);

  // Fresnel effect -atmosphere is brightest at the limb
  float fresnel = 1.0 - dot(viewDir, vNormal);
  fresnel = pow(fresnel, uAtmospherePower);

  // Sun-facing side is brighter
  float sunFacing = dot(sunDir, vNormal) * 0.5 + 0.5;
  sunFacing = pow(sunFacing, 0.8);

  // Combine
  float intensity = fresnel * uAtmosphereIntensity * sunFacing;

  // Slight color shift -bluer at edges (Rayleigh approximation)
  vec3 color = mix(uAtmosphereColor, uAtmosphereColor * vec3(0.6, 0.8, 1.2), fresnel);

  gl_FragColor = vec4(color * 1.5, intensity);
}
