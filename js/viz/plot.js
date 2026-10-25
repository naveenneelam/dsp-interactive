/**
 * plot.js — small Canvas 2D chart engine used by all labs.
 * No external chart library: predictable, offline, and easy to test.
 */

const FONT = '11px "Segoe UI", system-ui, sans-serif';
const FONT_SMALL = '10px "Segoe UI", system-ui, sans-serif';
const FONT_LABEL = '11px "Segoe UI", system-ui, sans-serif';

function cssVar(el, name, fallback) {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

export function niceTicks(min, max, count = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return { ticks: [min || 0], min: (min || 0) - 1, max: (max || 0) + 1 };
  }
  const span = max - min;
  const raw = span / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const start = Math.ceil(min / step) * step;
  const ticks = [];
  for (let v = start; v <= max + step * 1e-9; v += step) ticks.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  return { ticks, min, max, step };
}

export function logTicks(min, max, count = 5) {
  min = Math.max(1e-30, min); max = Math.max(min * 1.0001, max);
  const lo = Math.floor(Math.log10(min)), hi = Math.ceil(Math.log10(max));
  const step = Math.max(1, Math.ceil((hi - lo) / Math.max(2, count)));
  const ticks = [];
  for (let e = lo; e <= hi; e += step) ticks.push(10 ** e);
  return { ticks, min, max };
}

export function fmt(v, digits = 3) {
  if (!Number.isFinite(v)) return '—';
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1000 || a < 0.001) return v.toExponential(1);
  if (a >= 100) return v.toFixed(0);
  if (a >= 10) return v.toFixed(1);
  return v.toFixed(digits);
}

export class Plot {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = {
      xLabel: '', yLabel: '', title: '', xMin: null, xMax: null, yMin: null, yMax: null,
      xTicks: 6, yTicks: 5, padding: null, legend: true, grid: true,
      ...opts,
    };
    this.series = [];
    this.hlines = [];
    this.vlines = [];
    this.markers = [];
    this.hoverIndex = null;
    this.tooltip = null;
    this._destroyed = false;
    this._buildTooltip();
    this._resize = this._resize.bind(this);
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(canvas.parentElement || canvas);
    this._onMove = (ev) => this._handleMove(ev);
    this._onLeave = () => { this.hoverIndex = null; this._hideTooltip(); this.draw(); };
    canvas.addEventListener('pointermove', this._onMove);
    canvas.addEventListener('pointerleave', this._onLeave);
    this._themeHandler = () => this.draw();
    window.addEventListener('themechange', this._themeHandler);
    this._resize();
  }

  _buildTooltip() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
    const tip = document.createElement('div');
    tip.className = 'plot-tooltip';
    tip.setAttribute('aria-hidden', 'true');
    tip.hidden = true;
    parent.appendChild(tip);
    this.tooltip = tip;
  }

  destroy() {
    this._destroyed = true;
    this._ro.disconnect();
    window.removeEventListener('themechange', this._themeHandler);
    this.canvas.removeEventListener('pointermove', this._onMove);
    this.canvas.removeEventListener('pointerleave', this._onLeave);
    this.tooltip?.remove();
  }

  _resize() {
    if (this._destroyed) return;
    const box = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(120, box.width);
    const h = Math.max(80, box.height || 180);
    if (this.canvas.width !== Math.round(w * dpr) || this.canvas.height !== Math.round(h * dpr)) {
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
    }
    this.dpr = dpr;
    this.w = w;
    this.h = h;
    this.pad = this.opts.padding || { l: 48, r: 14, t: this.opts.title ? 24 : 10, b: 30 };
    this.draw();
  }

  setData(series, opts = {}) {
    this.series = series.filter(Boolean);
    Object.assign(this.opts, opts);
    if (!('xLabels' in opts)) this.opts.xLabels = null;
    if (this.opts.yMin == null || this.opts.yMax == null) this._autoRange();
    this.draw();
    return this;
  }

  setOverlays({ hlines = [], vlines = [], markers = [] } = {}) {
    this.hlines = hlines;
    this.vlines = vlines;
    this.markers = markers;
    this.draw();
  }

  _autoRange() {
    let lo = Infinity, hi = -Infinity;
    for (const s of this.series) {
      if (s.type === 'bars') {
        for (const y of s.y) { if (!Number.isFinite(y)) continue; lo = Math.min(lo, Math.min(0, y)); hi = Math.max(hi, Math.max(0, y)); }
      } else if (s.y) {
        for (const y of s.y) { if (!Number.isFinite(y)) continue; lo = Math.min(lo, y); hi = Math.max(hi, y); }
      }
    }
    for (const h of this.hlines) { lo = Math.min(lo, h.y); hi = Math.max(hi, h.y); }
    if (!Number.isFinite(lo)) { lo = -1; hi = 1; }
    if (lo === hi) { lo -= 1; hi += 1; }
    if (this.opts.yLog) {
      const pos = this.series.flatMap((s) => s.y || []).filter((v) => v > 0);
      if (pos.length) { lo = Math.min(...pos) / 5; hi = Math.max(...pos) * 5; }
      else { lo = 1e-6; hi = 1; }
      if (this.opts.yMin == null) this._lo = lo;
      if (this.opts.yMax == null) this._hi = hi;
      return;
    }
    const pad = (hi - lo) * 0.08;
    if (this.opts.yMin == null) this._lo = lo - pad;
    if (this.opts.yMax == null) this._hi = hi + pad;
  }

  get xMin() { return this.opts.xMin ?? this._xlo ?? 0; }
  get xMax() { return this.opts.xMax ?? this._xhi ?? 1; }
  get yMin() { return this.opts.yMin ?? this._lo ?? 0; }
  get yMax() { return this.opts.yMax ?? this._hi ?? 1; }

  _bounds() {
    return { l: this.pad.l, r: this.w - this.pad.r, t: this.pad.t, b: this.h - this.pad.b };
  }

  _sx(x) {
    const b = this._bounds();
    return b.l + ((x - this.xMin) / (this.xMax - this.xMin || 1)) * (b.r - b.l);
  }
  _sy(y) {
    const b = this._bounds();
    if (this.opts.yLog) {
      const lo = Math.log10(Math.max(1e-30, this.yMin));
      const hi = Math.log10(Math.max(1e-30, this.yMax));
      const v = Math.log10(Math.max(1e-30, y));
      return b.b - ((v - lo) / (hi - lo || 1)) * (b.b - b.t);
    }
    return b.b - ((y - this.yMin) / (this.yMax - this.yMin || 1)) * (b.b - b.t);
  }

  _color(name, fallback) {
    return cssVar(this.canvas, name, fallback);
  }

  _resolveColor(c, fallback) {
    if (!c) return this._color('--accent', fallback || '#0f766e');
    if (typeof c === 'string' && c.startsWith('var(')) {
      const m = c.match(/var\(\s*(--[^,)]+)/);
      if (m) return this._color(m[1], fallback || '#0f766e');
    }
    if (typeof c === 'string' && c.startsWith('color-mix')) return this._color('--accent', fallback || '#0f766e');
    return c;
  }

  draw() {
    if (!this.ctx || this._destroyed) return;
    const ctx = this.ctx;
    const dpr = this.dpr || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    const ink = this._color('--ink', '#1b2430');
    const muted = this._color('--muted', '#68717d');
    const grid = this._color('--grid', '#e5e0d6');
    const border = this._color('--border', '#d8d2c6');
    const b = this._bounds();

    // background
    ctx.fillStyle = this._color('--plot-bg', 'transparent');
    ctx.fillRect(0, 0, this.w, this.h);

    // auto-range if needed
    if (this.opts.yMin == null || this.opts.yMax == null) this._autoRange();

    const yT = this.opts.yLog ? logTicks(this.yMin, this.yMax, this.opts.yTicks) : niceTicks(this.yMin, this.yMax, this.opts.yTicks);
    const xT = niceTicks(this.xMin, this.xMax, this.opts.xTicks);

    // grid + y labels
    ctx.lineWidth = 1;
    ctx.font = FONT_SMALL;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (const t of yT.ticks) {
      const y = this._sy(t);
      if (y < b.t - 1 || y > b.b + 1) continue;
      if (this.opts.grid) {
        ctx.strokeStyle = grid;
        ctx.beginPath(); ctx.moveTo(b.l, y); ctx.lineTo(b.r, y); ctx.stroke();
      }
      ctx.fillStyle = muted;
      ctx.fillText(fmt(t), b.l - 6, y);
    }
    // x labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    if (this.opts.xLabels && this.opts.xLabels.length) {
      this.opts.xLabels.forEach((label, i) => {
        const x = this._sx(i);
        if (x < b.l - 1 || x > b.r + 1) return;
        ctx.fillStyle = muted;
        ctx.font = FONT_SMALL;
        ctx.fillText(label, x, b.b + 6);
      });
    } else {
      for (const t of xT.ticks) {
        const x = this._sx(t);
        if (x < b.l - 1 || x > b.r + 1) continue;
        if (this.opts.grid) {
          ctx.strokeStyle = grid;
          ctx.beginPath(); ctx.moveTo(x, b.t); ctx.lineTo(x, b.b); ctx.stroke();
        }
        ctx.fillStyle = muted;
        ctx.fillText(fmt(t), x, b.b + 6);
      }
    }

    // frame
    ctx.strokeStyle = border;
    ctx.strokeRect(b.l, b.t, b.r - b.l, b.b - b.t);

    // overlays
    for (const h of this.hlines) {
      const y = this._sy(h.y);
      ctx.strokeStyle = this._resolveColor(h.color, '#c2410c');
      ctx.setLineDash(h.dash || [5, 4]);
      ctx.beginPath(); ctx.moveTo(b.l, y); ctx.lineTo(b.r, y); ctx.stroke();
      ctx.setLineDash([]);
      if (h.label) {
        ctx.fillStyle = this._resolveColor(h.color, '#c2410c');
        ctx.font = FONT_SMALL;
        ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
        ctx.fillText(h.label, b.l + 4, y - 2);
      }
    }
    for (const v of this.vlines) {
      const x = this._sx(v.x);
      ctx.strokeStyle = this._resolveColor(v.color, '#c2410c');
      ctx.setLineDash(v.dash || [4, 4]);
      ctx.beginPath(); ctx.moveTo(x, b.t); ctx.lineTo(x, b.b); ctx.stroke();
      ctx.setLineDash([]);
      if (v.label) {
        ctx.fillStyle = this._resolveColor(v.color, '#c2410c');
        ctx.font = FONT_SMALL;
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(v.label, x + 3, b.t + 2);
      }
    }

    // series
    for (const s of this.series) {
      const color = this._resolveColor(s.color, '#0f766e');
      if (s.type === 'bars') {
        const n = s.x?.length || s.y.length;
        const bw = Math.max(1, ((b.r - b.l) / n) * 0.8);
        ctx.fillStyle = s.fill ? this._resolveColor(s.fill, color) : color;
        for (let i = 0; i < s.y.length; i++) {
          const x = this._sx(s.x ? s.x[i] : i);
          const y0 = this._sy(0), y1 = this._sy(s.y[i]);
          ctx.fillRect(x - bw / 2, Math.min(y0, y1), bw, Math.abs(y1 - y0));
        }
      } else if (s.type === 'stems') {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1.2;
        const n = s.y.length;
        const step = Math.max(1, Math.floor(n / 160));
        for (let i = 0; i < n; i += step) {
          const x = this._sx(s.x ? s.x[i] : i);
          const y = this._sy(s.y[i]);
          ctx.beginPath(); ctx.moveTo(x, this._sy(0)); ctx.lineTo(x, y); ctx.stroke();
          if (n <= 80) {
            ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
          }
        }
      } else if (s.type === 'points') {
        ctx.fillStyle = s.fill ? this._resolveColor(s.fill, color) : color;
        for (let i = 0; i < s.y.length; i++) {
          const x = this._sx(s.x ? s.x[i] : i);
          const y = this._sy(s.y[i]);
          ctx.beginPath(); ctx.arc(x, y, s.r || 2.5, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        // line / area
        const n = s.y.length;
        if (n < 2) continue;
        if (s.fill) {
          ctx.beginPath();
          ctx.moveTo(this._sx(s.x ? s.x[0] : 0), this._sy(0));
          for (let i = 0; i < n; i++) ctx.lineTo(this._sx(s.x ? s.x[i] : i), this._sy(s.y[i]));
          ctx.lineTo(this._sx(s.x ? s.x[n - 1] : n - 1), this._sy(0));
          ctx.closePath();
          ctx.globalAlpha = s.fillAlpha ?? 0.15;
          ctx.fillStyle = this._resolveColor(s.fill, color);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = s.width || 1.8;
        ctx.lineJoin = 'round';
        if (s.dash) ctx.setLineDash(s.dash);
        ctx.beginPath();
        const step = Math.max(1, Math.floor(n / 1200));
        for (let i = 0; i < n; i += step) {
          const x = this._sx(s.x ? s.x[i] : i);
          const y = this._sy(s.y[i]);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // markers
    for (const m of this.markers) {
      if (m.type === 'point') {
        const x = this._sx(m.x), y = this._sy(m.y);
        ctx.fillStyle = this._resolveColor(m.color, '#c2410c');
        ctx.beginPath(); ctx.arc(x, y, m.r || 4, 0, Math.PI * 2); ctx.fill();
        if (m.label) {
          ctx.font = FONT_SMALL; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
          ctx.fillText(m.label, x + 7, y - 5);
        }
      }
    }

    // hover crosshair
    if (this.hoverIndex != null && this.series.length) {
      const s = this.series.find((ss) => ss.y && ss.y.length);
      if (s) {
        const i = Math.min(this.hoverIndex, s.y.length - 1);
        const x = this._sx(s.x ? s.x[i] : i);
        ctx.strokeStyle = muted;
        ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(x, b.t); ctx.lineTo(x, b.b); ctx.stroke();
        ctx.setLineDash([]);
        for (const ss of this.series) {
          if (!ss.y || ss.type === 'bars' || ss.type === 'points') continue;
          const yy = ss.y[Math.min(i, ss.y.length - 1)];
          if (!Number.isFinite(yy)) continue;
          ctx.fillStyle = this._resolveColor(ss.color, '#0f766e');
          ctx.beginPath(); ctx.arc(x, this._sy(yy), 3.5, 0, Math.PI * 2); ctx.fill();
        }
      }
    }

    // axis labels
    ctx.fillStyle = muted;
    ctx.font = FONT_LABEL;
    if (this.opts.xLabel) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(this.opts.xLabel, (b.l + b.r) / 2, this.h - 2);
    }
    if (this.opts.yLabel) {
      ctx.save();
      ctx.translate(11, (b.t + b.b) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(this.opts.yLabel, 0, 0);
      ctx.restore();
    }
    if (this.opts.title) {
      ctx.fillStyle = ink;
      ctx.font = '600 11px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText(this.opts.title, b.l, 13);
    }

    // legend
    if (this.opts.legend) {
      const items = this.series.filter((s) => s.label);
      if (items.length) {
        ctx.font = FONT_SMALL;
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        let x = b.l + 6;
        const y = b.t + 10;
        for (const s of items) {
          ctx.strokeStyle = this._resolveColor(s.color, '#0f766e');
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 12, y); ctx.stroke();
          ctx.fillStyle = this._color('--muted', '#68717d');
          ctx.fillText(s.label, x + 16, y);
          x += 22 + ctx.measureText(s.label).width;
        }
      }
    }
    this.canvas.setAttribute('aria-label', this._summary());
  }

  _summary() {
    const parts = [this.opts.title || 'Signal plot'];
    if (this.opts.xLabel) parts.push(`x axis ${this.opts.xLabel}`);
    if (this.opts.yLabel) parts.push(`y axis ${this.opts.yLabel}`);
    for (const s of this.series.slice(0, 3)) {
      if (!s.y?.length) continue;
      const min = Math.min(...s.y), max = Math.max(...s.y);
      parts.push(`${s.label || 'series'}: ${fmt(min)} to ${fmt(max)}`);
    }
    return parts.join('. ');
  }

  _handleMove(ev) {
    if (!this.series.length) return;
    const rect = this.canvas.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    const b = this._bounds();
    if (px < b.l || px > b.r) { this._hideTooltip(); return; }
    const s = this.series.find((ss) => ss.y && ss.y.length);
    if (!s) return;
    const xv = this.xMin + ((px - b.l) / (b.r - b.l)) * (this.xMax - this.xMin);
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < s.y.length; i++) {
      const sx = s.x ? s.x[i] : i;
      const d = Math.abs(sx - xv);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    this.hoverIndex = best;
    const x = s.x ? s.x[best] : best;
    const rows = this.series
      .filter((ss) => ss.y && ss.y.length > best && ss.type !== 'bars')
      .map((ss) => `<span class="pt-swatch" style="background:${ss.color || 'var(--accent)'}"></span>${ss.label || 'y'}: <b>${fmt(ss.y[best])}</b>`)
      .join('<br>');
    if (this.tooltip) {
      this.tooltip.innerHTML = `<div class="pt-x">x = ${fmt(x)}</div>${rows}`;
      this.tooltip.hidden = false;
      const left = Math.min(this.w - 140, Math.max(4, px + 12));
      this.tooltip.style.left = `${left}px`;
      this.tooltip.style.top = `${Math.max(4, ev.clientY - rect.top - 10)}px`;
    }
    this.draw();
    this.opts.onHover?.(x, this.series.map((ss) => ss.y?.[best]));
  }

  _hideTooltip() {
    if (this.tooltip) this.tooltip.hidden = true;
    this.hoverIndex = null;
  }
}

/** Render an image (Float32Array 0..1 or 0..255) into a canvas with DPR. */
export class ImageView {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = { min: 0, max: 1, ...opts };
    this._ro = new ResizeObserver(() => this.draw());
    this._ro.observe(canvas.parentElement || canvas);
    this._theme = () => this.draw();
    window.addEventListener('themechange', this._theme);
    this.draw();
  }
  destroy() { this._ro.disconnect(); window.removeEventListener('themechange', this._theme); }
  setImage(img, opts = {}) {
    this.img = img; Object.assign(this.opts, opts); this.draw(); return this;
  }
  draw() {
    if (!this.img) return;
    const { w, h, data } = this.img;
    const parent = this.canvas.parentElement;
    const pw = parent?.clientWidth || 240;
    const aspect = h / w;
    const cssW = Math.min(pw, 360);
    const cssH = cssW * aspect;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.max(1, Math.round(cssW * dpr));
    this.canvas.height = Math.max(1, Math.round(cssH * dpr));
    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const octx = off.getContext('2d');
    const id = octx.createImageData(w, h);
    const lo = this.opts.min, hi = this.opts.max;
    for (let i = 0; i < w * h; i++) {
      const t = Math.max(0, Math.min(1, (data[i] - lo) / (hi - lo || 1)));
      const v = this.opts.gamma ? t ** (1 / this.opts.gamma) : t;
      const g = Math.round(v * 255);
      id.data[i * 4] = g; id.data[i * 4 + 1] = g; id.data[i * 4 + 2] = g; id.data[i * 4 + 3] = 255;
    }
    octx.putImageData(id, 0, 0);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(off, 0, 0, this.canvas.width, this.canvas.height);
    this.canvas.setAttribute('aria-label', this.opts.alt || 'Image result');
  }
}
