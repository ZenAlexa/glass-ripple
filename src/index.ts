import { GlassRipple } from './glass-ripple';
import { claude, allPresets, presetsByCategory } from './icons';
import { Pane } from 'tweakpane';

// ── Glass Ripple instance ─────────────────────────────────────────────────

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const gr = new GlassRipple({
  canvas,
  icon: claude.icon,
});

if (claude.color) gr.setTint(claude.color);

// ── State for tweakpane ───────────────────────────────────────────────────

const DEFAULTS = {
  damping: 0.8,
  speed: 1.0,
  radius: 0.025,
  intensity: 20.0,
  momentum: 0.4,
  tint: claude.color ?? '#D97757',
  background: '#050505',
};

const params = {
  damping: DEFAULTS.damping,
  speed: DEFAULTS.speed,
  radius: DEFAULTS.radius,
  intensity: DEFAULTS.intensity,
  momentum: DEFAULTS.momentum,
  tint: DEFAULTS.tint,
  background: DEFAULTS.background,
};

// ── Tweakpane setup ──────────────────────────────────────────────────────

const tpContainer = document.getElementById('tweakpane-container');

if (tpContainer) {
  const pane = new Pane({ container: tpContainer });

  const waveFolder = pane.addFolder({ title: 'Wave Physics' });
  waveFolder.addBinding(params, 'damping', { min: 0.5, max: 0.99, step: 0.01 });
  waveFolder.addBinding(params, 'speed', { min: 0.1, max: 3.0, step: 0.1 });
  waveFolder.addBinding(params, 'radius', { min: 0.01, max: 0.1, step: 0.005 });
  waveFolder.addBinding(params, 'intensity', { min: 1, max: 50, step: 1 });
  waveFolder.addBinding(params, 'momentum', { min: 0.1, max: 1.0, step: 0.05 });

  const appearFolder = pane.addFolder({ title: 'Appearance' });
  appearFolder.addBinding(params, 'tint', { label: 'tint color' });
  appearFolder.addBinding(params, 'background', { label: 'bg color' });

  // Listen for changes and update GlassRipple
  // Note: GlassRipple doesn't expose wave config setters publicly,
  // so tint and background are the realtime-updateable params.
  // Wave params would need a re-instantiation in a real app.
  pane.on('change', () => {
    gr.setTint(params.tint);
  });
}

// ── Copy install command ─────────────────────────────────────────────────

const copyBtn = document.getElementById('copy-btn');
const copyLabel = document.getElementById('copy-label');
if (copyBtn && copyLabel) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('npm install glass-ripple').then(() => {
      copyLabel.textContent = 'Copied!';
      setTimeout(() => { copyLabel.textContent = 'Copy'; }, 2000);
    });
  });
}

// ── Copy Config button ──────────────────────────────────────────────────

const copyConfigBtn = document.getElementById('copy-config-btn');
if (copyConfigBtn) {
  copyConfigBtn.addEventListener('click', () => {
    const snippet = `const ripple = new GlassRipple({
  canvas: document.getElementById('canvas'),
  wave: {
    damping: ${params.damping},
    speed: ${params.speed},
    radius: ${params.radius},
    intensity: ${params.intensity},
    momentum: ${params.momentum},
  },
  background: '${params.background}',
})
ripple.setTint('${params.tint}')`;
    navigator.clipboard.writeText(snippet).then(() => {
      copyConfigBtn.textContent = 'Copied!';
      setTimeout(() => { copyConfigBtn.textContent = 'Copy Config'; }, 2000);
    });
  });
}

// ── Reset button ─────────────────────────────────────────────────────────

const resetBtn = document.getElementById('reset-btn');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    Object.assign(params, { ...DEFAULTS });
    gr.setTint(DEFAULTS.tint);
    // Re-create pane to reflect reset values
    if (tpContainer) {
      tpContainer.innerHTML = '';
      const pane = new Pane({ container: tpContainer });
      const waveFolder = pane.addFolder({ title: 'Wave Physics' });
      waveFolder.addBinding(params, 'damping', { min: 0.5, max: 0.99, step: 0.01 });
      waveFolder.addBinding(params, 'speed', { min: 0.1, max: 3.0, step: 0.1 });
      waveFolder.addBinding(params, 'radius', { min: 0.01, max: 0.1, step: 0.005 });
      waveFolder.addBinding(params, 'intensity', { min: 1, max: 50, step: 1 });
      waveFolder.addBinding(params, 'momentum', { min: 0.1, max: 1.0, step: 0.05 });
      const appearFolder = pane.addFolder({ title: 'Appearance' });
      appearFolder.addBinding(params, 'tint', { label: 'tint color' });
      appearFolder.addBinding(params, 'background', { label: 'bg color' });
      pane.on('change', () => { gr.setTint(params.tint); });
    }
  });
}

// ── Icon Gallery ─────────────────────────────────────────────────────────

const galleryTabs = document.getElementById('gallery-tabs')!;
const galleryGrid = document.getElementById('gallery-grid')!;
let activeGalleryItem: HTMLElement | null = null;
let activeTab: HTMLElement | null = null;

const categories = Array.from(presetsByCategory.keys());

function renderSvgPreview(icon: typeof allPresets[0]['icon']): string {
  if ('svgPath' in icon) {
    const vb = icon.viewBox ?? 24;
    const fillRule = icon.fillRule ? ` fill-rule="${icon.fillRule}"` : '';
    return `<svg viewBox="0 0 ${vb} ${vb}" fill="${icon.color ?? '#fff'}"><path d="${icon.svgPath}"${fillRule}/></svg>`;
  }
  return icon.svg;
}

function showCategory(category: string | null) {
  galleryGrid.innerHTML = '';
  const presets = category ? (presetsByCategory.get(category) ?? []) : allPresets;

  for (const preset of presets) {
    const item = document.createElement('button');
    item.className = 'gallery-item';
    if (preset === claude) {
      item.classList.add('active');
      activeGalleryItem = item;
    }
    item.innerHTML = `${renderSvgPreview(preset.icon)}<span class="gallery-item-name">${preset.name}</span>`;

    item.addEventListener('click', () => {
      activeGalleryItem?.classList.remove('active');
      item.classList.add('active');
      activeGalleryItem = item;
      gr.setIcon(preset.icon);
      if (preset.color) {
        gr.setTint(preset.color);
        params.tint = preset.color;
      }
    });

    galleryGrid.appendChild(item);
  }
}

// Build "All" tab + category tabs
const allTab = document.createElement('button');
allTab.className = 'gallery-tab active';
allTab.textContent = 'All';
allTab.role = 'tab';
activeTab = allTab;
allTab.addEventListener('click', () => {
  activeTab?.classList.remove('active');
  allTab.classList.add('active');
  activeTab = allTab;
  showCategory(null);
});
galleryTabs.appendChild(allTab);

for (const cat of categories) {
  const tab = document.createElement('button');
  tab.className = 'gallery-tab';
  tab.textContent = cat;
  tab.role = 'tab';
  tab.addEventListener('click', () => {
    activeTab?.classList.remove('active');
    tab.classList.add('active');
    activeTab = tab;
    showCategory(cat);
  });
  galleryTabs.appendChild(tab);
}

showCategory(null);

// ── Code tabs ────────────────────────────────────────────────────────────

const codeTabs = document.querySelectorAll<HTMLButtonElement>('.code-tab');
const codePanels = document.querySelectorAll<HTMLElement>('.code-panel');

codeTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    codeTabs.forEach((t) => t.classList.remove('active'));
    codePanels.forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById(`panel-${tab.dataset.tab}`);
    panel?.classList.add('active');
  });
});

// ── Code copy buttons ────────────────────────────────────────────────────

document.querySelectorAll<HTMLButtonElement>('.code-copy-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const block = btn.closest('.code-block');
    const code = block?.querySelector('code')?.textContent ?? '';
    navigator.clipboard.writeText(code).then(() => {
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
  });
});
