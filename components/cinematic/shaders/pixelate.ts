export const PIXELATE_VERTEX = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * 사진을 "의도한 도트 그림"처럼 보이게 하는 3단계 처리.
 * 1) 가로세로 비율을 맞춘 정사각 셀 샘플링
 * 2) 색 단계 축소(포스터라이즈) — 사진 티를 지우는 핵심
 * 3) Bayer 디더로 계단 경계를 도트답게 흩뿌림
 */
export const PIXELATE_FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uCells;
  uniform float uDither;
  uniform float uLevels;
  uniform float uSaturation;
  uniform float uGain;
  uniform float uOpacity;
  uniform float uAlphaTest;
  varying vec2 vUv;

  float bayer4(vec2 coord) {
    vec2 p = mod(floor(coord), 4.0);
    float x = p.x + p.y * 4.0;
    float index = 0.0;
    if (x < 0.5) index = 0.0;
    else if (x < 1.5) index = 8.0;
    else if (x < 2.5) index = 2.0;
    else if (x < 3.5) index = 10.0;
    else if (x < 4.5) index = 12.0;
    else if (x < 5.5) index = 4.0;
    else if (x < 6.5) index = 14.0;
    else if (x < 7.5) index = 6.0;
    else if (x < 8.5) index = 3.0;
    else if (x < 9.5) index = 11.0;
    else if (x < 10.5) index = 1.0;
    else if (x < 11.5) index = 9.0;
    else if (x < 12.5) index = 15.0;
    else if (x < 13.5) index = 7.0;
    else if (x < 14.5) index = 13.0;
    else index = 5.0;
    return index / 16.0;
  }

  void main() {
    vec2 cells = max(uCells, vec2(4.0));
    vec2 pixelUv = (floor(vUv * cells) + 0.5) / cells;
    vec4 texel = texture2D(uMap, pixelUv);

    if (texel.a < uAlphaTest) discard;

    vec3 color = texel.rgb;

    color *= uGain;

    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luma), color, uSaturation);

    float dither = (bayer4(vUv * cells) - 0.5) * uDither;
    color += dither;

    float levels = max(uLevels, 2.0);
    color = floor(clamp(color, 0.0, 1.0) * levels + 0.5) / levels;

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), texel.a * uOpacity);
  }
`;
