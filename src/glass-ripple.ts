import * as THREE from 'three';
import {
  quadVert,
  waveSimFrag,
  normalMapFrag,
  blurFrag,
  compositeFrag,
  halftoneFrag,
  chromabFrag,
  retroScreenFrag,
  vignetteFrag,
  blitFrag,
  crossfadeFrag,
} from './shaders';
import type {
  GlassRippleConfig,
  IconConfig,
  SvgPathIcon,
  SvgStringIcon,
  WaveConfig,
  EffectsConfig,
  HalftoneConfig,
} from './types';

export type {
  GlassRippleConfig,
  IconConfig,
  SvgPathIcon,
  SvgStringIcon,
  IconPreset,
  WaveConfig,
  EffectsConfig,
  HalftoneConfig,
} from './types';

function isSvgPath(icon: IconConfig): icon is SvgPathIcon {
  return 'svgPath' in icon;
}

// ── Defaults ──────────────────────────────────────────────────────────────

const DEFAULT_WAVE: Required<WaveConfig> = {
  damping: 0.8,
  speed: 1.0,
  radius: 0.025,
  intensity: 20.0,
  momentum: 0.4,
  steps: 1,
};

const DEFAULT_ICON_OPTS = {
  color: '#D97757',
  scale: 0.55,
  position: { x: 0.5, y: 0.408 },
};

const DEFAULT_HT1: Required<HalftoneConfig> = {
  tint: [0, 0, 0],
  mix: 0.29,
  scale: 0.42,
  angle: -0.4833,
};

const DEFAULT_HT2: Required<HalftoneConfig> = {
  tint: [0.702, 0.459, 0],
  mix: 0.38,
  scale: 0.8,
  angle: -0.0081,
};

// ── Helpers ───────────────────────────────────────────────────────────────

function makeRT(w: number, h: number, float = false): THREE.WebGLRenderTarget {
  return new THREE.WebGLRenderTarget(w, h, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    type: float ? THREE.HalfFloatType : THREE.UnsignedByteType,
    format: THREE.RGBAFormat,
  });
}

function makeMat(
  frag: string,
  uniforms: Record<string, THREE.IUniform> = {},
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: quadVert,
    fragmentShader: frag,
    uniforms,
    depthTest: false,
    depthWrite: false,
  });
}

// ── Main Class ────────────────────────────────────────────────────────────

export class GlassRipple {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.OrthographicCamera;
  private passScene: THREE.Scene;
  private quad: THREE.Mesh;

  // Render targets
  private wavePing!: THREE.WebGLRenderTarget;
  private wavePong!: THREE.WebGLRenderTarget;
  private normalRT!: THREE.WebGLRenderTarget;
  private blurHRT!: THREE.WebGLRenderTarget;
  private blurVRT!: THREE.WebGLRenderTarget;
  private baseRT!: THREE.WebGLRenderTarget;
  private prevFinalRT!: THREE.WebGLRenderTarget;
  private postA!: THREE.WebGLRenderTarget;
  private postB!: THREE.WebGLRenderTarget;

  // Core materials
  private waveSimMat: THREE.ShaderMaterial;
  private normalMat: THREE.ShaderMaterial;
  private blurMat: THREE.ShaderMaterial;
  private compositeMat: THREE.ShaderMaterial;
  private blitMat: THREE.ShaderMaterial;
  private crossfadeMat: THREE.ShaderMaterial;

  // Effect materials (null = disabled)
  private halftone1Mat: THREE.ShaderMaterial | null = null;
  private halftone2Mat: THREE.ShaderMaterial | null = null;
  private chromabMat: THREE.ShaderMaterial | null = null;
  private retroMat: THREE.ShaderMaterial | null = null;
  private vignetteMat: THREE.ShaderMaterial | null = null;

  // Mouse state
  private mouse = new THREE.Vector2(0.5, 0.5);
  private smoothMouse = new THREE.Vector2(0.5, 0.5);
  private prevSmooth = new THREE.Vector2(0.5, 0.5);

  // Icon cache (for svg string mode)
  private cachedIconImage: HTMLImageElement | null = null;

  // Crossfade state
  private isTransitioning = false;
  private crossfadeStartTime = 0;
  private static readonly CROSSFADE_DURATION = 400;

  // Rendering state
  private baseTex: THREE.CanvasTexture | null = null;
  private W = 0;
  private H = 0;
  private QW = 0;
  private QH = 0;
  private animationId = 0;
  private res = new THREE.Vector2();

  // Config
  private iconConfig: IconConfig;
  private waveConfig: Required<WaveConfig>;
  private background: string;

  // Bound handlers
  private handlePointerMove: (e: PointerEvent) => void;
  private handleResize: () => void;

  constructor(config: GlassRippleConfig) {
    this.iconConfig = config.icon
      ? isSvgPath(config.icon)
        ? { ...DEFAULT_ICON_OPTS, ...config.icon }
        : { scale: DEFAULT_ICON_OPTS.scale, position: DEFAULT_ICON_OPTS.position, ...config.icon }
      : { ...DEFAULT_ICON_OPTS, svgPath: '', color: '#D97757' };
    this.waveConfig = { ...DEFAULT_WAVE, ...config.wave };
    this.background = config.background ?? '#050505';

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: config.canvas,
      antialias: false,
      alpha: false,
    });
    this.renderer.setPixelRatio(
      config.pixelRatio ?? Math.min(window.devicePixelRatio, 2),
    );
    this.renderer.setClearColor(0x020202);

    // Scene
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.passScene = new THREE.Scene();
    this.passScene.add(this.quad);

    // Core materials
    this.waveSimMat = makeMat(waveSimFrag, {
      uState: { value: null },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uPrevMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2() },
      uSpeed: { value: this.waveConfig.speed },
      uDamping: { value: this.waveConfig.damping },
      uRadius: { value: this.waveConfig.radius },
      uIntensity: { value: this.waveConfig.intensity },
    });

    this.normalMat = makeMat(normalMapFrag, {
      uHeightMap: { value: null },
    });

    this.blurMat = makeMat(blurFrag, {
      uTexture: { value: null },
      uDirection: { value: new THREE.Vector2() },
    });

    this.compositeMat = makeMat(compositeFrag, {
      uNormals: { value: null },
      uBase: { value: null },
    });

    this.blitMat = makeMat(blitFrag, { uTexture: { value: null } });

    this.crossfadeMat = makeMat(crossfadeFrag, {
      uTextureA: { value: null },
      uTextureB: { value: null },
      uMix: { value: 0 },
    });

    // Effect materials
    this.createEffectMaterials(config.effects);

    // Events
    this.handlePointerMove = (e: PointerEvent) => {
      this.mouse.set(
        e.clientX / window.innerWidth,
        1.0 - e.clientY / window.innerHeight,
      );
    };
    this.handleResize = () => this.resize();

    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('resize', this.handleResize);

    // Boot
    this.resize();
    this.animationId = requestAnimationFrame((t) => this.animate(t));
  }

  // ── Public API ────────────────────────────────────────────────────────

  setWave(opts: Partial<WaveConfig>): void {
    Object.assign(this.waveConfig, opts);
    if (opts.speed !== undefined) this.waveSimMat.uniforms.uSpeed.value = opts.speed;
    if (opts.damping !== undefined) this.waveSimMat.uniforms.uDamping.value = opts.damping;
    if (opts.radius !== undefined) this.waveSimMat.uniforms.uRadius.value = opts.radius;
    if (opts.intensity !== undefined) this.waveSimMat.uniforms.uIntensity.value = opts.intensity;
  }

  setTint(hex: string): void {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    if (this.halftone2Mat) {
      this.halftone2Mat.uniforms.uTint.value.set(r, g, b);
    }
  }

  async setIcon(icon: IconConfig): Promise<void> {
    if (isSvgPath(icon)) {
      this.iconConfig = { ...DEFAULT_ICON_OPTS, ...icon };
      this.cachedIconImage = null;
    } else {
      this.iconConfig = { scale: DEFAULT_ICON_OPTS.scale, position: DEFAULT_ICON_OPTS.position, ...icon };
      const blob = new Blob([icon.svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => { URL.revokeObjectURL(url); resolve(); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load SVG icon')); };
        img.src = url;
      });
      this.cachedIconImage = img;
    }
    this.updateBaseTexture();

    // Start crossfade transition
    this.isTransitioning = true;
    this.crossfadeStartTime = performance.now();
  }

  dispose(): void {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('resize', this.handleResize);

    const rts = [
      this.wavePing,
      this.wavePong,
      this.normalRT,
      this.blurHRT,
      this.blurVRT,
      this.baseRT,
      this.prevFinalRT,
      this.postA,
      this.postB,
    ];
    rts.forEach((rt) => rt?.dispose());

    const mats = [
      this.waveSimMat,
      this.normalMat,
      this.blurMat,
      this.compositeMat,
      this.blitMat,
      this.crossfadeMat,
      this.halftone1Mat,
      this.halftone2Mat,
      this.chromabMat,
      this.retroMat,
      this.vignetteMat,
    ];
    mats.forEach((m) => m?.dispose());

    this.baseTex?.dispose();
    this.cachedIconImage = null;
    this.renderer.dispose();
  }

  // ── Internals ─────────────────────────────────────────────────────────

  private createEffectMaterials(effects?: EffectsConfig): void {
    const eff: EffectsConfig = effects ?? {
      halftone: [DEFAULT_HT1, DEFAULT_HT2],
      chromab: { amount: 0.2 },
      retroScreen: { cellScale: 0.028, glow: 0.5 },
      vignette: { intensity: 1.0 },
    };

    if (eff.halftone !== false) {
      const [h1, h2] = eff.halftone ?? [DEFAULT_HT1, DEFAULT_HT2];
      const c1 = { ...DEFAULT_HT1, ...h1 };
      const c2 = { ...DEFAULT_HT2, ...h2 };

      this.halftone1Mat = makeMat(halftoneFrag, {
        uTexture: { value: null },
        uBase: { value: null },
        uResolution: { value: new THREE.Vector2() },
        uTint: { value: new THREE.Vector3(...c1.tint) },
        uMix: { value: c1.mix },
        uScale: { value: c1.scale },
        uAngle: { value: c1.angle },
      });
      this.halftone2Mat = makeMat(halftoneFrag, {
        uTexture: { value: null },
        uBase: { value: null },
        uResolution: { value: new THREE.Vector2() },
        uTint: { value: new THREE.Vector3(...c2.tint) },
        uMix: { value: c2.mix },
        uScale: { value: c2.scale },
        uAngle: { value: c2.angle },
      });
    }

    if (eff.chromab !== false) {
      const c = {
        amount: 0.2,
        ...(typeof eff.chromab === 'object' ? eff.chromab : {}),
      };
      this.chromabMat = makeMat(chromabFrag, {
        uTexture: { value: null },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2() },
        uAmount: { value: c.amount },
      });
    }

    if (eff.retroScreen !== false) {
      const c = {
        cellScale: 0.028,
        glow: 0.5,
        ...(typeof eff.retroScreen === 'object' ? eff.retroScreen : {}),
      };
      this.retroMat = makeMat(retroScreenFrag, {
        uTexture: { value: null },
        uBase: { value: null },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2() },
        uCellScale: { value: c.cellScale },
        uGlow: { value: c.glow },
      });
    }

    if (eff.vignette !== false) {
      const c = {
        intensity: 1.0,
        ...(typeof eff.vignette === 'object' ? eff.vignette : {}),
      };
      this.vignetteMat = makeMat(vignetteFrag, {
        uTexture: { value: null },
        uResolution: { value: new THREE.Vector2() },
        uIntensity: { value: c.intensity },
      });
    }
  }

  private resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    const dpr = this.renderer.getPixelRatio();
    this.W = Math.floor(w * dpr);
    this.H = Math.floor(h * dpr);
    this.QW = Math.max(1, Math.floor(this.W / 4));
    this.QH = Math.max(1, Math.floor(this.H / 4));
    this.initRenderTargets();
    this.updateBaseTexture();
  }

  private initRenderTargets(): void {
    [
      this.wavePing,
      this.wavePong,
      this.normalRT,
      this.blurHRT,
      this.blurVRT,
      this.baseRT,
      this.prevFinalRT,
      this.postA,
      this.postB,
    ].forEach((rt) => rt?.dispose());

    this.wavePing = makeRT(this.QW, this.QH, true);
    this.wavePong = makeRT(this.QW, this.QH, true);
    this.normalRT = makeRT(this.QW, this.QH, true);
    this.blurHRT = makeRT(this.QW, this.QH, true);
    this.blurVRT = makeRT(this.QW, this.QH, true);
    this.baseRT = makeRT(this.W, this.H);
    this.prevFinalRT = makeRT(this.W, this.H);
    this.postA = makeRT(this.W, this.H);
    this.postB = makeRT(this.W, this.H);
  }

  private createIconCanvas(size: number): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d')!;

    if (this.cachedIconImage) {
      ctx.drawImage(this.cachedIconImage, 0, 0, size, size);
    } else if (isSvgPath(this.iconConfig)) {
      const path = new Path2D(this.iconConfig.svgPath);
      const viewBox = this.iconConfig.viewBox ?? 24;
      const scale = size / viewBox;
      ctx.save();
      ctx.scale(scale, scale);
      ctx.fillStyle = this.iconConfig.color ?? '#D97757';
      ctx.fill(path, this.iconConfig.fillRule ?? 'nonzero');
      ctx.restore();
    }

    return c;
  }

  private updateBaseTexture(): void {
    const c = document.createElement('canvas');
    c.width = this.W;
    c.height = this.H;
    const ctx = c.getContext('2d')!;

    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, this.W, this.H);

    const iconCanvas = this.createIconCanvas(1024);
    const scale = this.iconConfig.scale ?? DEFAULT_ICON_OPTS.scale;
    const pos = this.iconConfig.position ?? DEFAULT_ICON_OPTS.position;
    const iconSize = Math.min(this.W, this.H) * scale;
    const iconX = this.W * pos.x - iconSize / 2;
    const iconY = this.H * pos.y - iconSize / 2;
    ctx.drawImage(iconCanvas, iconX, iconY, iconSize, iconSize);

    this.baseTex?.dispose();
    this.baseTex = new THREE.CanvasTexture(c);
    this.baseTex.minFilter = THREE.LinearFilter;
  }

  private pass(
    material: THREE.ShaderMaterial,
    target: THREE.WebGLRenderTarget | null,
  ): void {
    this.quad.material = material;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.passScene, this.camera);
  }

  private animate(time: number): void {
    this.animationId = requestAnimationFrame((t) => this.animate(t));
    const t = time * 0.001;
    this.res.set(this.W, this.H);

    // Mouse smoothing
    this.prevSmooth.copy(this.smoothMouse);
    this.smoothMouse.lerp(this.mouse, this.waveConfig.momentum);

    // 1. Blit base texture → baseRT (always, crossfade happens at the end)
    this.blitMat.uniforms.uTexture.value = this.baseTex;
    this.pass(this.blitMat, this.baseRT);

    // 2. Wave simulation
    for (let i = 0; i < this.waveConfig.steps; i++) {
      this.waveSimMat.uniforms.uState.value = this.wavePing.texture;
      this.waveSimMat.uniforms.uMouse.value.copy(this.smoothMouse);
      this.waveSimMat.uniforms.uPrevMouse.value.copy(this.prevSmooth);
      this.waveSimMat.uniforms.uResolution.value.copy(this.res);
      this.pass(this.waveSimMat, this.wavePong);
      [this.wavePing, this.wavePong] = [this.wavePong, this.wavePing];
    }

    // 3. Normal map
    this.normalMat.uniforms.uHeightMap.value = this.wavePing.texture;
    this.pass(this.normalMat, this.normalRT);

    // 4-5. Gaussian blur (H then V)
    this.blurMat.uniforms.uTexture.value = this.normalRT.texture;
    this.blurMat.uniforms.uDirection.value.set(1, 0);
    this.pass(this.blurMat, this.blurHRT);

    this.blurMat.uniforms.uTexture.value = this.blurHRT.texture;
    this.blurMat.uniforms.uDirection.value.set(0, 1);
    this.pass(this.blurMat, this.blurVRT);

    // 6. Composite (refraction + lighting)
    this.compositeMat.uniforms.uNormals.value = this.blurVRT.texture;
    this.compositeMat.uniforms.uBase.value = this.baseRT.texture;
    this.pass(this.compositeMat, this.postA);

    // 7+. Post-processing chain (ping-pong postA ↔ postB)
    let src = this.postA;
    let dst = this.postB;
    const swap = () => {
      [src, dst] = [dst, src];
    };

    if (this.halftone1Mat) {
      this.halftone1Mat.uniforms.uTexture.value = src.texture;
      this.halftone1Mat.uniforms.uBase.value = this.baseRT.texture;
      this.halftone1Mat.uniforms.uResolution.value.copy(this.res);
      this.pass(this.halftone1Mat, dst);
      swap();
    }

    if (this.halftone2Mat) {
      this.halftone2Mat.uniforms.uTexture.value = src.texture;
      this.halftone2Mat.uniforms.uBase.value = this.baseRT.texture;
      this.halftone2Mat.uniforms.uResolution.value.copy(this.res);
      this.pass(this.halftone2Mat, dst);
      swap();
    }

    if (this.chromabMat) {
      this.chromabMat.uniforms.uTexture.value = src.texture;
      this.chromabMat.uniforms.uTime.value = t;
      this.chromabMat.uniforms.uResolution.value.copy(this.res);
      this.pass(this.chromabMat, dst);
      swap();
    }

    if (this.retroMat) {
      this.retroMat.uniforms.uTexture.value = src.texture;
      this.retroMat.uniforms.uBase.value = this.baseRT.texture;
      this.retroMat.uniforms.uTime.value = t;
      this.retroMat.uniforms.uResolution.value.copy(this.res);
      this.pass(this.retroMat, dst);
      swap();
    }

    // Apply vignette to RT (not directly to screen)
    if (this.vignetteMat) {
      this.vignetteMat.uniforms.uTexture.value = src.texture;
      this.vignetteMat.uniforms.uResolution.value.copy(this.res);
      this.pass(this.vignetteMat, dst);
      swap();
    }

    // Output to screen: post-pipeline crossfade eliminates CRT ghost amplification
    if (this.isTransitioning) {
      const elapsed = time - this.crossfadeStartTime;
      const raw = Math.min(elapsed / GlassRipple.CROSSFADE_DURATION, 1);
      const eased = 1 - (1 - raw) ** 3; // cubic ease-out

      this.crossfadeMat.uniforms.uTextureA.value = this.prevFinalRT.texture;
      this.crossfadeMat.uniforms.uTextureB.value = src.texture;
      this.crossfadeMat.uniforms.uMix.value = eased;
      this.pass(this.crossfadeMat, null);

      if (raw >= 1) this.isTransitioning = false;
    } else {
      // Output to screen and save for future crossfade
      this.blitMat.uniforms.uTexture.value = src.texture;
      this.pass(this.blitMat, null);
      this.pass(this.blitMat, this.prevFinalRT);
    }
  }
}
