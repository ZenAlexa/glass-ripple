// Shared fullscreen quad vertex shader
export const quadVert = /* glsl */ `
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Wave equation simulation (ping-pong feedback)
// Key improvement: line-segment distance for continuous wake when dragging
export const waveSimFrag = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uState;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform vec2 uResolution;
uniform float uSpeed;
uniform float uDamping;
uniform float uRadius;
uniform float uIntensity;

void main() {
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  float texelScale = mix(1.0, 8.0, 0.96);
  vec2 texelSize = (1.0 / (vec2(1080.0) * aspect)) * texelScale;

  vec4 data = texture(uState, vUv);
  float height = data.r;
  float velocity = data.g;

  // Laplacian (4-neighbor, weighted)
  float sumH = 0.0;
  float totalW = 0.0;

  vec2 o1 = vec2(texelSize.x, 0.0);
  vec2 o2 = vec2(-texelSize.x, 0.0);
  vec2 o3 = vec2(0.0, texelSize.y);
  vec2 o4 = vec2(0.0, -texelSize.y);

  vec2 nUv;
  float w;

  nUv = clamp(vUv + o1, vec2(0.0), vec2(1.0));
  w = 1.0 - length(o1) / (length(texelSize) * 2.0);
  sumH += texture(uState, nUv).r * w; totalW += w;

  nUv = clamp(vUv + o2, vec2(0.0), vec2(1.0));
  w = 1.0 - length(o2) / (length(texelSize) * 2.0);
  sumH += texture(uState, nUv).r * w; totalW += w;

  nUv = clamp(vUv + o3, vec2(0.0), vec2(1.0));
  w = 1.0 - length(o3) / (length(texelSize) * 2.0);
  sumH += texture(uState, nUv).r * w; totalW += w;

  nUv = clamp(vUv + o4, vec2(0.0), vec2(1.0));
  w = 1.0 - length(o4) / (length(texelSize) * 2.0);
  sumH += texture(uState, nUv).r * w; totalW += w;

  float laplacian = sumH / totalW - height;

  float waveSpeed = uSpeed;
  velocity += waveSpeed * waveSpeed * laplacian;
  velocity *= uDamping;
  height += velocity;
  height *= uDamping;

  // Mouse interaction — line segment between prev and current position
  // Creates a continuous wake instead of discrete point ripples
  vec2 mPos = uMouse;
  vec2 pmPos = uPrevMouse;
  vec2 p = vUv * aspect;
  vec2 a = pmPos * aspect;
  vec2 b = mPos * aspect;
  vec2 ab = b - a;
  float segLenSq = dot(ab, ab);
  float mouseSpeed = sqrt(segLenSq);

  if (mouseSpeed > 0.0001) {
    float t = clamp(dot(p - a, ab) / segLenSq, 0.0, 1.0);
    vec2 closest = a + t * ab;
    float dist = distance(p, closest);

    if (dist < uRadius) {
      float drop = cos(dist / uRadius * 3.14159265 * 0.5);
      height += drop * mouseSpeed * uIntensity;
    }
  }

  fragColor = vec4(height, velocity, 0.0, 1.0);
}`;

// Compute surface normals from height field
export const normalMapFrag = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uHeightMap;

void main() {
  float strengthScale = 7.84;
  float s = 3.42 / 1080.0;

  float l = texture(uHeightMap, vUv + vec2(-s, 0.0)).r;
  float r = texture(uHeightMap, vUv + vec2( s, 0.0)).r;
  float t = texture(uHeightMap, vUv + vec2(0.0, -s)).r;
  float b = texture(uHeightMap, vUv + vec2(0.0,  s)).r;

  vec3 normal;
  normal.x = (r - l) * strengthScale;
  normal.y = -(b - t) * strengthScale;
  normal.z = 1.0;
  fragColor = vec4(normalize(normal), 1.0);
}`;

// Separable Gaussian blur
export const blurFrag = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTexture;
uniform vec2 uDirection;

void main() {
  vec4 color = vec4(0.0);
  float total = 0.0;
  float w0 = 0.798;
  color += texture(uTexture, vUv) * w0;
  total += w0;

  float weights[11] = float[11](
    0.795, 0.787, 0.773, 0.755, 0.732,
    0.704, 0.673, 0.639, 0.602, 0.564, 0.524
  );

  for (int i = 0; i < 11; i++) {
    float wt = weights[i];
    float off = mix(0.005, 0.015, 0.63) * float(i + 1) / 11.0;
    color += texture(uTexture, vUv + off * uDirection) * wt;
    color += texture(uTexture, vUv - off * uDirection) * wt;
    total += 2.0 * wt;
  }

  fragColor = color / total;
}`;

// Composite: refraction + color-adaptive specular lighting + shadow
export const compositeFrag = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uNormals;
uniform sampler2D uBase;

const vec3 LIGHT_POS = vec3(2.0, 2.0, 3.0);
const vec3 VIEW_POS  = vec3(0.0, 0.0, 2.0);
const float SPECULAR = 2.4;
const float SHININESS = 128.0;
const float REFRACTION_AMOUNT = 0.442;

float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

vec3 calculateLighting(vec3 n, vec2 uv) {
  vec3 pos = vec3(uv * 2.0 - 1.0, 0.0);
  vec3 L = normalize(LIGHT_POS - pos);
  vec3 V = normalize(VIEW_POS - pos);
  vec3 R = reflect(-L, n);
  float spec = pow(max(dot(V, R), 0.0), SHININESS) * SPECULAR;
  return vec3(spec);
}

void main() {
  vec3 normal = texture(uNormals, vUv).rgb;

  vec2 offset = normal.xy * REFRACTION_AMOUNT;
  vec2 refractedUv = vUv + offset;

  vec4 base = texture(uBase, refractedUv);

  // Chromatic micro-offset on refracted UV
  vec2 chromaOffset = offset * 0.2;
  base.r = texture(uBase, refractedUv - chromaOffset).r;
  base.b = texture(uBase, refractedUv + chromaOffset).b;

  // Specular highlights (only visible during waves)
  vec3 refN = texture(uNormals, refractedUv).rgb;
  vec3 light = calculateLighting(refN, refractedUv);

  // Color-adaptive specular: tint highlights with icon's local color
  float baseLuma = luma(base.rgb);
  float iconMask = smoothstep(0.02, 0.08, baseLuma);
  vec3 tintColor = base.rgb / (baseLuma + 0.001);
  vec3 specTint = mix(vec3(1.0), tintColor, iconMask * 0.85);

  // Shadow: gentle modulation, ~0.93 at rest
  vec3 lightDir = normalize(LIGHT_POS - vec3(vUv * 2.0 - 1.0, 0.0));
  float shadow = dot(normal, lightDir) * 0.25 + 0.75;

  // Add subtle colored bloom near icon edges
  vec3 colorBloom = base.rgb * iconMask * 0.08;

  vec3 col = base.rgb * clamp(shadow, 0.0, 1.5) + light * 0.15 * specTint + colorBloom;
  fragColor = vec4(col, base.a);
}`;

// Halftone dot pattern with color-adaptive tinting
export const halftoneFrag = /* glsl */ `
precision mediump float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTexture;
uniform sampler2D uBase;
uniform vec2 uResolution;
uniform vec3 uTint;
uniform float uMix;
uniform float uScale;
uniform float uAngle;

float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

float aastep(float threshold, float value, float size) {
  float fw = size * 200.0 / uResolution.x;
  return smoothstep(threshold - fw, threshold + fw, value);
}

vec2 rotate2d(vec2 st, float deg) {
  float c = cos(radians(deg));
  float s = sin(radians(deg));
  return mat2(c, -s, s, c) * st;
}

float halftone(vec2 st, float col) {
  float ar = uResolution.x / uResolution.y;
  float ac = mix(ar, 1.0 / ar, 0.5);
  st -= 0.5;
  st *= vec2(ar, 1.0);
  vec2 r = uScale * 200.0 * rotate2d(st, -uAngle * 360.0);
  r /= ac;
  st = (2.0 * fract(r) - 1.0) * 0.82;
  return aastep(-0.01, sqrt(col) - length(st), uScale);
}

void main() {
  vec4 tex = texture(uTexture, vUv);
  if (tex.a < 0.001) { fragColor = vec4(0); return; }

  // Color-adaptive tint: blend uniform tint with icon's saturated local color
  vec3 localColor = texture(uBase, vUv).rgb;
  float localLuma = luma(localColor);
  // Boost saturation for vivid halftone dots
  vec3 saturated = mix(vec3(localLuma), localColor, 1.8);
  vec3 effectiveTint = mix(uTint, saturated, smoothstep(0.02, 0.08, localLuma));

  float g = 1.0 - halftone(vUv, 1.0 - luma(tex.rgb));
  vec4 ht = vec4(mix(vec3(g), effectiveTint, 1.0 - g * g), 1.0) * tex.a;

  fragColor = mix(tex, ht, uMix);
}`;

// Chromatic aberration with time-rotating direction
export const chromabFrag = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;
uniform float uAmount;

void main() {
  float angle = (uTime * 0.05 * 360.0) * 3.14159265 / 180.0;
  vec2 dir = vec2(sin(angle), cos(angle));
  vec2 offset = uAmount * dir * 0.03;

  vec4 center = texture(uTexture, vUv);
  if (length(offset) < 0.001) { fragColor = center; return; }

  vec4 left  = texture(uTexture, vUv - offset);
  vec4 right = texture(uTexture, vUv + offset);

  center.r = left.r;
  center.b = right.b;
  center.a = max(max(left.a, center.a), right.a);
  fragColor = center;
}`;

// CRT retro screen with color-adaptive icon tinting
export const retroScreenFrag = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTexture;
uniform sampler2D uBase;
uniform float uTime;
uniform vec2 uResolution;
uniform float uCellScale;
uniform float uGlow;

void main() {
  vec4 src = texture(uTexture, vUv);
  if (src.a <= 0.001) { fragColor = vec4(0); return; }

  float size = max(3.0 / 1080.0, uCellScale * (1.0 - 0.6));
  float ar = uResolution.x / uResolution.y;
  float ac = mix(ar, 1.0 / ar, 0.5);
  vec2 cell = vec2(size / ar, size) * ac;

  vec2 stUv = vUv;
  if (mod(floor(vUv.x / cell.x), 2.0) > 0.5)
    stUv.y += 0.5 * cell.y;

  vec2 cellCoord = floor(stUv / cell) * cell;

  vec2 unstagger = vec2(0.0);
  if (mod(floor(vUv.x / cell.x), 2.0) > 0.5)
    unstagger.y = -0.5 * cell.y;
  vec2 sampleUv = cellCoord + 0.5 * cell + unstagger;

  // 3x3 blur for glow
  vec3 blur = vec3(0.0);
  for (int dx = -1; dx <= 1; dx++)
    for (int dy = -1; dy <= 1; dy++)
      blur += texture(uTexture, sampleUv + vec2(float(dx), float(dy)) * cell * uGlow).rgb / 9.0;

  // RGB subpixel columns
  vec2 pos = mod(stUv, cell) / cell;
  float seg = 0.5;
  float dR = min(abs(pos.x - seg * 0.5), 1.0 - abs(pos.x - seg * 0.5));
  float dG = min(abs(pos.x - seg),       1.0 - abs(pos.x - seg));
  float dB = min(abs(pos.x - seg * 1.5), 1.0 - abs(pos.x - seg * 1.5));
  float soft = 0.75 * seg;
  float rF = smoothstep(soft, 0.0, dR * 1.05);
  float gF = smoothstep(soft, 0.0, dG * 1.1);
  float bF = smoothstep(soft, 0.0, dB * 0.9);

  vec3 col;
  float brightness = 3.0 * uGlow;
  col.r = rF * blur.r * brightness;
  col.g = gF * blur.g * brightness;
  col.b = bF * blur.b * brightness;

  // Cell edge darkening
  vec2 edge = abs(pos - 0.5);
  float ef = (1.0 - smoothstep(0.45 - 0.05, 0.5, max(edge.x, edge.y))) + 0.2;
  col *= ef;

  // 8-level quantize
  col = floor(col * 8.0) / 8.0;

  // Flicker
  float flicker = 1.0 + 0.03 * cos(sampleUv.x / 60.0 + uTime * 20.0);
  col *= mix(1.0, flicker, uGlow);

  // Color-adaptive: reinforce icon's local color in CRT output
  vec3 iconColor = texture(uBase, sampleUv).rgb;
  float iconLuma = dot(iconColor, vec3(0.299, 0.587, 0.114));
  float iconMask = smoothstep(0.03, 0.10, iconLuma);
  vec3 pureColor = iconColor / max(iconLuma, 0.01);
  col *= mix(vec3(1.0), clamp(pureColor, 0.3, 3.0), iconMask * 0.35);

  fragColor = mix(src, vec4(col, src.a), 1.0);
}`;

// Vignette (elliptical with skew)
export const vignetteFrag = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uIntensity;

mat2 rot(float a) {
  return mat2(cos(a), -sin(a), sin(a), cos(a));
}

void main() {
  vec4 col = texture(uTexture, vUv);

  vec2 ar = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 skew = vec2(0.33, 0.67);
  float halfRadius = 0.48 * 0.5;
  float innerEdge = halfRadius - halfRadius * 0.5;
  float outerEdge = halfRadius + halfRadius * 0.5;

  const float TWO_PI = 6.28318530718;
  vec2 scaledUV = vUv * ar * rot(-0.0054 * TWO_PI) * skew;
  vec2 scaledPos = vec2(0.5) * ar * rot(-0.0054 * TWO_PI) * skew;
  float radius = distance(scaledUV, scaledPos);

  float falloff = smoothstep(innerEdge, outerEdge, radius) * uIntensity;
  col.rgb *= 1.0 - falloff;
  fragColor = col;
}`;

// Simple blit (passthrough)
export const blitFrag = /* glsl */ `
precision mediump float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTexture;
void main() { fragColor = texture(uTexture, vUv); }`;

// GPU crossfade between two textures
export const crossfadeFrag = /* glsl */ `
precision mediump float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTextureA;
uniform sampler2D uTextureB;
uniform float uMix;
void main() {
  fragColor = mix(texture(uTextureA, vUv), texture(uTextureB, vUv), uMix);
}`;
