# Reddit Posts — glass-ripple Launch

Three separate posts for three subreddits. All copy-paste ready.

---

## r/webdev Post

**Title:** I built a GPU-accelerated glass ripple hero effect with 52 AI brand icons [Open Source]

**Body:**

Hey r/webdev,

I've been working on a side project and wanted to share it + get feedback.

**The problem:** I kept seeing the same hero section patterns on AI product pages — static gradients, floating particles, maybe a Lottie animation. They all look the same. I wanted something that felt genuinely interactive and had a distinct visual identity.

**What I built:** [glass-ripple](https://github.com/ZenAlexa/glass-ripple) — a WebGL2 visual effect that turns a `<canvas>` into a reactive glass surface with real-time wave physics and CRT retro aesthetics.

**Live demo:** https://zenalexa.github.io/glass-ripple/

**What makes it different:**
- 11-pass GPU shader pipeline (wave sim → normal map → blur → composite → halftone ×2 → chromatic aberration → CRT scanlines → vignette)
- 52 built-in icons covering the AI ecosystem (Claude, GPT, Gemini, DeepSeek, Cursor, Copilot, etc.)
- Real wave physics — mouse movements create actual wave propagation, not just visual tricks
- CRT aesthetic that nobody else is doing

**Setup is minimal:**

```bash
npm install glass-ripple three
```

```ts
import { GlassRipple } from 'glass-ripple';
import { claude } from 'glass-ripple/icons';

const ripple = new GlassRipple({
  canvas: document.getElementById('canvas') as HTMLCanvasElement,
  icon: claude.icon,
});
```

**Tech stack:** TypeScript, Three.js, WebGL2 (GLSL 300 ES). Framework-agnostic — works with React, Vue, Svelte, or vanilla JS. Tree-shakeable, `sideEffects: false`.

MIT licensed. Would love to hear what you think — especially about the visual direction and API design. What would you change?

GitHub: https://github.com/ZenAlexa/glass-ripple

---

## r/javascript Post

**Title:** glass-ripple — 11-pass WebGL2 shader pipeline for interactive hero sections, with 52 AI brand icon presets (TypeScript, tree-shakeable, MIT)

**Body:**

I just published [glass-ripple](https://github.com/ZenAlexa/glass-ripple) v2.1.0 and wanted to share the technical details with this community.

**What it is:** A TypeScript library that renders a GPU-accelerated glass ripple effect with CRT retro aesthetics. It runs an 11-pass shader pipeline per frame on a single `<canvas>` element.

**Demo:** https://zenalexa.github.io/glass-ripple/

### Architecture

The pipeline (all GLSL 300 ES):

1. **Wave simulation** — 2D wave equation on a ping-pong framebuffer at 1/4 resolution. Uses `HalfFloatType` render targets. Mouse interaction calculates distance to a line segment (not a point) for continuous wake trails.
2. **Normal map** — Generated from the heightfield using finite differences. Key decision: `z = +1.0` (not -1.0) to avoid shadow inversion.
3. **Gaussian blur** — Separable H+V passes on the normal map.
4. **Composite** — Refraction + specular lighting using the blurred normals against the base texture.
5-6. **Halftone** (two passes) — Different scales and angles for layered dot patterns.
7. **Chromatic aberration** — RGB channel offset.
8. **CRT** — Scanline simulation with phosphor glow.
9. **Vignette** — Edge darkening.

Post-effects ping-pong between two full-resolution render targets.

### Package design

```json
{
  "exports": {
    ".": { "import": "./dist/glass-ripple.js", "types": "./dist/glass-ripple.d.ts" },
    "./icons": { "import": "./dist/icons/index.js", "types": "./dist/icons/index.d.ts" }
  },
  "sideEffects": false,
  "peerDependencies": { "three": ">=0.150.0" }
}
```

Icons are tree-shakeable — `import { claude, openai } from 'glass-ripple/icons'` only bundles what you use. The `IconConfig` type is a discriminated union:

```ts
type IconConfig = SvgPathIcon | SvgStringIcon;
```

`SvgPathIcon` (sync): provide a single SVG `d` attribute + color.
`SvgStringIcon` (async): provide full SVG markup — decoded via `Image` element before rendering.

### API surface

```ts
const ripple = new GlassRipple({ canvas, icon: claude.icon });
await ripple.setIcon(openai.icon);  // crossfade transition
ripple.setTint('#ff6600');           // change halftone tint
ripple.dispose();                    // cleanup all GPU resources
```

Every effect can be disabled individually:

```ts
effects: {
  halftone: false,
  chromab: false,
  retroScreen: false,
  vignette: false,
}
```

52 icon presets across 4 categories: AI Models (22), Creative AI (8), Dev Tools (14), Cloud/GPU (8).

MIT licensed. Only peer dependency is `three >=0.150.0`.

Source: https://github.com/ZenAlexa/glass-ripple
npm: `npm install glass-ripple`

Happy to answer any questions about the shader pipeline or API design decisions.

---

## r/threejs Post

**Title:** 11-pass shader pipeline with wave physics simulation — glass-ripple (open source)

**Body:**

Hey r/threejs,

I built a visual effect library on top of Three.js that runs an 11-pass post-processing pipeline — thought this community would appreciate the technical deep-dive.

**Demo:** https://zenalexa.github.io/glass-ripple/
**Source:** https://github.com/ZenAlexa/glass-ripple

### The pipeline

Everything runs in GLSL 300 ES through `THREE.ShaderMaterial` with `glslVersion: THREE.GLSL3`.

**Wave simulation (pass 1):** A 2D wave equation running on a ping-pong framebuffer (`HalfFloatType` render targets) at quarter resolution (W/4 × H/4). The key optimization here is calculating mouse interaction via line-segment distance (from previous frame mouse position to current), not point distance. This gives you continuous wake trails instead of dotted patterns when the mouse moves fast.

The wave equation:

```
height += velocity
velocity += speed * (avg_neighbors - height) - damping * velocity
```

Where `avg_neighbors` is the average of the 4 cardinal neighbors (classic 2D wave equation discretization).

**Normal map (pass 2):** Finite differences on the heightfield. One important lesson: the z-component must be `+1.0`, not `-1.0`. Setting z=-1 inverts the lighting and darkens the entire scene — took me a while to debug that one.

**Blur (passes 3-4):** Separable Gaussian, horizontal then vertical, still at quarter resolution.

**Composite (pass 5):** This is where it comes together. The blurred normals drive refraction (UV offset into the base texture) and specular highlights. The `texelScale` is `mix(1.0, 8.0, 0.96) ≈ 7.72` — this controls how much the normals distort the base image.

**Post-effects (passes 6-11):** All at full resolution, ping-ponging between two render targets:
- Halftone pass 1 (dark dots, scale 0.42, angle -0.4833)
- Halftone pass 2 (warm tint, scale 0.8, angle -0.0081)
- Chromatic aberration (RGB channel offset)
- CRT scanlines + phosphor glow (cell scale 0.028, glow 0.5)
- Vignette (final pass renders to screen, no intermediate RT)

### Performance

- Wave sim at 1/4 resolution is the biggest win. Full-resolution wave sim was ~3x slower and visually indistinguishable after the blur pass.
- All render targets use `LinearFilter` — no mipmaps needed since we're always sampling at 1:1 or upscaling.
- The vignette pass (last in chain) renders directly to screen (`null` render target) to avoid one extra blit.
- Icon rendering happens on a 2D canvas, uploaded as `CanvasTexture`. Only regenerated on resize or icon change, not per-frame.

### The setup

Uses a single `OrthographicCamera(-1,1,1,-1,0,1)` with a `PlaneGeometry(2,2)` quad. Each pass swaps the quad's material and renders. Minimal Three.js overhead — no scene graph, no lights, no meshes beyond the fullscreen quad.

```ts
private pass(material: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null): void {
  this.quad.material = material;
  this.renderer.setRenderTarget(target);
  this.renderer.render(this.passScene, this.camera);
}
```

52 built-in AI brand icon presets (SVG path data from Simple Icons). The icon system supports both single-path sync rendering via `Path2D` and full SVG markup async rendering via `Image` element.

MIT licensed. Would love feedback on the shader pipeline — especially if you see optimization opportunities I missed.

---

## Posting Notes

- Post all three as **self-posts** (text), NOT link posts
- Post r/webdev first (biggest audience), then r/javascript (1-2 hours later), then r/threejs (another 1-2 hours)
- Engage with EVERY comment within the first 2 hours — this is critical for Reddit algorithm
- Do NOT cross-reference the other posts — Reddit penalizes that
- Upvote the post from your own account immediately after posting
