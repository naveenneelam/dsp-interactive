/** Shared scaffolding for interactive labs. */

import { Plot, ImageView, fmt } from './plot.js';

let uid = 0;
export const nextId = (prefix = 'lab') => `${prefix}-${++uid}`;

function rangeControl(c) {
  const id = c.id;
  const step = c.step ?? 1;
  return `<div class="control" data-control="${id}">
    <label for="${id}">${c.label}<output data-out="${id}">${c.format ? c.format(c.value) : c.value}${c.unit || ''}</output></label>
    <input id="${id}" type="range" min="${c.min}" max="${c.max}" step="${step}" value="${c.value}" />
    ${c.hint ? `<span class="hint">${c.hint}</span>` : ''}
  </div>`;
}
function selectControl(c) {
  return `<div class="control" data-control="${c.id}">
    <label for="${c.id}">${c.label}</label>
    <select id="${c.id}">${c.options.map((o) => `<option value="${o.value}" ${String(o.value) === String(c.value) ? 'selected' : ''}>${o.label}</option>`).join('')}</select>
    ${c.hint ? `<span class="hint">${c.hint}</span>` : ''}
  </div>`;
}
function segControl(c) {
  return `<div class="control" data-control="${c.id}" style="flex:0 1 auto;max-width:none">
    <label>${c.label}</label>
    <div class="seg" role="group" aria-label="${c.label}">${c.options.map((o) => `<button type="button" data-seg="${c.id}" data-value="${o.value}" class="${String(o.value) === String(c.value) ? 'active' : ''}">${o.label}</button>`).join('')}</div>
  </div>`;
}
function checkControl(c) {
  return `<div class="control" data-control="${c.id}" style="flex:0 1 auto;max-width:none;justify-content:flex-end">
    <label style="cursor:pointer"><input id="${c.id}" type="checkbox" ${c.value ? 'checked' : ''} style="accent-color:var(--accent);margin-right:5px"/> ${c.label}</label>
  </div>`;
}

export function controlHtml(c) {
  if (!c) return '';
  if (c.type === 'range') return rangeControl(c);
  if (c.type === 'select') return selectControl(c);
  if (c.type === 'seg') return segControl(c);
  if (c.type === 'check') return checkControl(c);
  if (c.type === 'html') return c.html;
  return '';
}

/**
 * Build a lab shell and return accessors.
 * @param {HTMLElement} el
 * @param {object} cfg {title,intro,controls,plots,tasks,note,readouts,wide}
 */
export function mountLabShell(el, cfg) {
  const id = nextId('lab');
  el.innerHTML = `<div class="lab-card" data-lab-root="${id}">
    <div class="lab-head">
      <div class="kicker">Interactive lab</div>
      <h2>${cfg.title}</h2>
      <p>${cfg.intro}</p>
    </div>
    <div class="lab-body">
      <div class="lab-controls">${(cfg.controls || []).map(controlHtml).join('')}</div>
      <div class="lab-plots ${cfg.plotCols === 3 ? 'three' : cfg.plotCols === 1 ? 'one' : ''}">
        ${(cfg.plots || []).map((p) => `<div class="plot-wrap ${p.tall ? 'tall' : ''} ${p.xtall ? 'xtall' : ''}">
          <canvas id="${id}-${p.id}" aria-label="${p.title || p.caption || 'plot'}"></canvas>
          ${p.caption ? `<div class="plot-cap"><span>${p.caption}</span><span>${p.unit || ''}</span></div>` : ''}
        </div>`).join('')}
      </div>
      ${cfg.readouts ? `<div class="readout">${cfg.readouts.map((r) => `<div class="readout-item"><div class="k">${r.label}</div><div class="v" data-readout="${r.id}">—</div></div>`).join('')}</div>` : ''}
      ${cfg.tasks ? `<div class="try-list"><h4>Try this</h4><ol>${cfg.tasks.map((t) => `<li>${t}</li>`).join('')}</ol></div>` : ''}
      ${cfg.note ? `<p class="lab-note">${cfg.note}</p>` : ''}
      ${cfg.custom ? cfg.custom : ''}
    </div>
  </div>`;

  const plots = new Map();
  const images = new Map();
  const cleanupFns = [];
  const q = (sel) => el.querySelector(sel);
  const byId = (x) => el.querySelector(`#${CSS.escape(x)}`);

  const lab = {
    el, id, q, byId,
    get(name) {
      const node = byId(name);
      if (!node) return undefined;
      if (node.type === 'checkbox') return node.checked;
      if (node.type === 'range' || node.type === 'number') return Number(node.value);
      return node.value;
    },
    set(name, value) {
      const node = byId(name);
      if (!node) return;
      if (node.type === 'checkbox') node.checked = !!value;
      else node.value = value;
      node.dispatchEvent(new Event('input', { bubbles: true }));
    },
    onInput(name, fn) {
      const node = byId(name);
      if (!node) return;
      const handler = () => {
        if (node.type === 'range') {
          const out = el.querySelector(`[data-out="${CSS.escape(name)}"]`);
          if (out) {
            const spec = (cfg.controls || []).find((c) => c.id === name);
            out.textContent = `${spec?.format ? spec.format(Number(node.value)) : node.value}${spec?.unit || ''}`;
          }
        }
        fn(Number(node.value), node);
      };
      node.addEventListener('input', handler);
      cleanupFns.push(() => node.removeEventListener('input', handler));
    },
    onChange(name, fn) {
      const node = byId(name);
      if (!node) return;
      const handler = () => fn(node.type === 'checkbox' ? node.checked : node.type === 'range' ? Number(node.value) : node.value, node);
      node.addEventListener('change', handler);
      cleanupFns.push(() => node.removeEventListener('change', handler));
    },
    onSeg(name, fn) {
      const buttons = el.querySelectorAll(`[data-seg="${CSS.escape(name)}"]`);
      const handlers = [];
      buttons.forEach((b) => {
        const h = () => {
          buttons.forEach((x) => x.classList.toggle('active', x === b));
          fn(b.dataset.value, b);
        };
        b.addEventListener('click', h);
        handlers.push([b, h]);
      });
      cleanupFns.push(() => handlers.forEach(([b, h]) => b.removeEventListener('click', h)));
    },
    segValue(name) {
      return el.querySelector(`[data-seg="${CSS.escape(name)}"].active`)?.dataset.value;
    },
    plot(name, opts = {}) {
      const canvas = byId(`${id}-${name}`);
      if (!canvas) return null;
      const p = new Plot(canvas, opts);
      plots.set(name, p);
      return p;
    },
    image(name, opts = {}) {
      const canvas = byId(`${id}-${name}`);
      if (!canvas) return null;
      const v = new ImageView(canvas, opts);
      images.set(name, v);
      return v;
    },
    readout(name, value) {
      const node = el.querySelector(`[data-readout="${CSS.escape(name)}"]`);
      if (node) node.textContent = value;
    },
    readouts(values) {
      for (const [k, v] of Object.entries(values)) this.readout(k, v);
    },
    cleanup(fn) { cleanupFns.push(fn); },
    destroy() {
      for (const fn of cleanupFns) { try { fn(); } catch { /* ignore */ } }
      for (const p of plots.values()) p.destroy();
      for (const v of images.values()) v.destroy();
      plots.clear(); images.clear(); cleanupFns.length = 0;
    },
  };
  cleanupFns.push(() => {
    for (const p of plots.values()) p.destroy();
    for (const v of images.values()) v.destroy();
  });
  return lab;
}

/* Signal generators used by several labs. */
export function sine({ n = 256, amp = 1, freq = 0.05, phase = 0, offset = 0 }) {
  return Array.from({ length: n }, (_, i) => offset + amp * Math.cos(2 * Math.PI * freq * i + phase));
}
export function stepSignal(n = 128, at = 32, lo = 0, hi = 1) {
  return Array.from({ length: n }, (_, i) => (i >= at ? hi : lo));
}
export function spikeSignal(n = 128) {
  return Array.from({ length: n }, (_, i) => (i === 40 ? 1 : 0));
}
export function noise(n = 256, sigma = 0.2, seed = 7) {
  let a = seed >>> 0;
  const rnd = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return Array.from({ length: n }, () => (rnd() * 2 - 1) * sigma);
}
export { fmt };
