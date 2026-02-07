import { GlassRipple } from './glass-ripple';
import { claude, presetsByCategory } from './icons';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const gr = new GlassRipple({
  canvas,
  icon: claude.icon,
});

if (claude.color) gr.setTint(claude.color);

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

// ── Icon picker ──────────────────────────────────────────────────────────

const picker = document.getElementById('icon-picker')!;
const titleEl = document.getElementById('title')!;
let activeBtn: HTMLButtonElement | null = null;

let isFirst = true;
for (const [category, presets] of presetsByCategory) {
  if (!isFirst) {
    const sep = document.createElement('div');
    sep.className = 'picker-separator';
    picker.appendChild(sep);
  }
  isFirst = false;

  const label = document.createElement('span');
  label.className = 'picker-category';
  label.textContent = category;
  picker.appendChild(label);

  for (const preset of presets) {
    const btn = document.createElement('button');
    btn.title = preset.name;
    btn.setAttribute('aria-label', preset.name);

    const icon = preset.icon;
    if ('svgPath' in icon) {
      const vb = icon.viewBox ?? 24;
      const fillRule = icon.fillRule ? ` fill-rule="${icon.fillRule}"` : '';
      btn.innerHTML = `<svg viewBox="0 0 ${vb} ${vb}" fill="${icon.color ?? '#fff'}"><path d="${icon.svgPath}"${fillRule}/></svg>`;
    } else {
      btn.innerHTML = icon.svg;
    }

    btn.addEventListener('click', async () => {
      activeBtn?.classList.remove('active');
      btn.classList.add('active');
      activeBtn = btn;
      await gr.setIcon(preset.icon);
      if (preset.color) gr.setTint(preset.color);

      titleEl.classList.add('fade-out');
      setTimeout(() => {
        titleEl.textContent = preset.name;
        titleEl.classList.remove('fade-out');
      }, 200);

      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });

    if (preset === claude) {
      btn.classList.add('active');
      activeBtn = btn;
    }

    picker.appendChild(btn);
  }
}
