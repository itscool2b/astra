uniform float uTime;
uniform float uOpacity;

varying vec2 vUv;

void main() {
  vec2 center = vUv - 0.5;
  float dist = length(center);

  // Radial falloff
  float corona = 1.0 - smoothstep(0.0, 0.5, dist);
  corona = pow(corona, 2.0);

  // Flickering rays
  float angle = atan(center.y, center.x);
  float rays = sin(angle * 8.0 + uTime * 0.5) * 0.5 + 0.5;
  rays *= sin(angle * 13.0 - uTime * 0.3) * 0.5 + 0.5;
  corona *= mix(0.5, 1.0, rays);

  vec3 color = mix(vec3(1.0, 0.6, 0.1), vec3(1.0, 0.9, 0.5), corona);
  float alpha = corona * uOpacity * smoothstep(0.5, 0.2, dist);

  gl_FragColor = vec4(color * 3.0, alpha);
}
