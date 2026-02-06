# Hacker News — Show HN Post

Copy-paste ready. Submit at https://news.ycombinator.com/submit

---

**Title:** Show HN: Glass Ripple – 11-pass WebGL2 hero effect with 52 AI brand icons

**URL:** https://github.com/ZenAlexa/glass-ripple

**Text (if self-post — use this if the link post doesn't gain traction):**

Glass Ripple is an MIT-licensed TypeScript library that renders an interactive ripple effect using an 11-pass WebGL2 shader pipeline. It ships with 52 built-in AI brand icon presets (Claude, GPT, Gemini, DeepSeek, Cursor, etc.).

Live demo: https://zenalexa.github.io/glass-ripple/

The engineering:

- Wave simulation: 2D wave equation on a ping-pong framebuffer at quarter resolution (HalfFloat render targets). Mouse interaction uses line-segment distance for continuous wake trails.

- Normal mapping: Generated from the heightfield via finite differences. The normals drive UV-space refraction and specular lighting in the composite pass.

- Post-processing: Halftone (two passes at different scales/angles), chromatic aberration, CRT scanline simulation with phosphor glow, and vignette. All passes chain through two full-resolution render targets.

- Icon system: Discriminated union type — SvgPathIcon (sync, single path via Path2D) or SvgStringIcon (async, full SVG via Image decode). 52 presets across 4 categories. Tree-shakeable.

The whole pipeline runs per-frame in GLSL 300 ES on a single fullscreen quad. Only dependency is Three.js (>=0.150.0).

Setup:

    npm install glass-ripple three

    import { GlassRipple } from 'glass-ripple';
    import { claude } from 'glass-ripple/icons';

    new GlassRipple({
      canvas: document.getElementById('canvas'),
      icon: claude.icon,
    });

Source: https://github.com/ZenAlexa/glass-ripple

---

## HN-Specific Notes

- Submit the **URL** version first (pointing to GitHub). Only use the text version if the URL version doesn't get traction and you want to resubmit as a text post.
- Best time: Tuesday-Thursday, 8-10am US Eastern
- DO NOT use superlatives or marketing language in the title — HN will flag it
- Respond to every technical question quickly and in depth
- If asked "why not just use post-processing in Three.js directly?" — answer honestly: this wraps that pattern into a reusable component with a clean API and pre-built icon presets
- If asked about bundle size — the core library is small, Three.js is the main weight and it's a peer dependency (users likely already have it)
- Do NOT ask for upvotes anywhere
