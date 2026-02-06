# Twitter/X Thread — glass-ripple Launch

Copy-paste ready. Post as a thread. Attach `demo.gif` to Tweet 1.

---

## Tweet 1 (Hook — attach demo.gif)

I built a GPU-accelerated glass ripple effect for AI product landing pages.

3 lines of code. 52 AI brand icons. 11-pass WebGL2 shader pipeline. CRT retro aesthetics.

Open source, MIT licensed.

Demo: https://zenalexa.github.io/glass-ripple/
GitHub: https://github.com/ZenAlexa/glass-ripple

#webdev #threejs #opensource

---

## Tweet 2 (Technical flex)

The pipeline runs 11 shader passes per frame:

1. Wave simulation (2D wave equation, 1/4 resolution)
2. Normal map from heightfield
3-4. Gaussian blur (H + V)
5. Composite (refraction + specular lighting)
6-7. Halftone (two passes, different scales)
8. Chromatic aberration
9. CRT scanlines + phosphor glow
10. Vignette

All GLSL 300 ES. All on the GPU.

---

## Tweet 3 (Icon ecosystem)

52 AI brand icons ship out of the box.

AI Models: Claude, GPT, Gemini, DeepSeek, Grok, Mistral, Qwen, and 15 more
Creative AI: Midjourney, Runway, Suno, DALL-E, Flux
Dev Tools: Cursor, Copilot, Windsurf, Cline, Dify, Ollama
Cloud/GPU: NVIDIA, AWS, Azure, Cloudflare

Tree-shakeable. Import only what you need.

New model dropped? Adding an icon is one file + one line.

---

## Tweet 4 (Code example)

Here's the entire setup:

```
npm install glass-ripple three
```

```ts
import { GlassRipple } from 'glass-ripple';
import { claude } from 'glass-ripple/icons';

const ripple = new GlassRipple({
  canvas: document.getElementById('canvas'),
  icon: claude.icon,
});
```

That's it. Full-page interactive hero section. Zero config.

Swap icons at runtime: `ripple.setIcon(openai.icon)`

---

## Tweet 5 (CRT aesthetic angle)

I was tired of seeing the same particle effects and gradient blobs on every AI landing page.

glass-ripple goes a different direction: CRT phosphor glow, halftone dot patterns, chromatic aberration, scanlines. It looks like the future imagined through retro hardware.

Every AI company is doing "clean and minimal." This is the opposite — and it works.

---

## Tweet 6 (Call to action)

If you're building an AI product, agent dashboard, or model comparison page:

```
npm install glass-ripple three
```

- MIT licensed
- TypeScript-first, framework-agnostic
- Works in all modern browsers (WebGL2)
- Full config API — toggle any effect on/off

Star it: https://github.com/ZenAlexa/glass-ripple
Try it: https://zenalexa.github.io/glass-ripple/

PRs welcome — especially new icon presets.

#webdev #webgl #threejs #ai #opensource #javascript

---

## Posting Notes

- Attach `demo.gif` (from repo root) to Tweet 1
- Pin the thread after posting
- Quote-tweet Tweet 1 with the demo GIF a few hours later for extra reach
- Tag @threaboratory (Three.js community) if they have an active account
- Consider tagging AI dev tool accounts (Cursor, Vercel, etc.) in a reply
