/** Fourier properties, pairs, FFT structure, and continuous-time labs. */

import {
  realDft, spectrum, convolve, pad, nextPow2, clamp, sinc, fft, dft, mean,
} from '../dsp.js';
import { mountLabShell, fmt } from './lab-kit.js';
import { registerLab } from './lab-registry.js';

/* ------------------------------------------------------------------ */
/* Fourier properties                                                  */
/* ------------------------------------------------------------------ */

registerLab('fourier-properties', (el) => {
  const lab = mountLabShell(el, {
    title: 'Shift, scale, modulate, and check Parseval',
    intro: 'Apply a time shift, a time-scale change, or multiplication by a carrier to the same test signal. The spectrum follows predictable rules: magnitude is preserved by a shift, stretched by decimation, and copied to the carrier by modulation.',
    plotCols: 2,
    controls: [
      { type: 'seg', id: 'fp-mode', label: 'Operation', value: 'shift', options: [
        { value: 'shift', label: 'Time shift' }, { value: 'scale', label: 'Time scale' }, { value: 'mod', label: 'Modulate' }, { value: 'parseval', label: 'Parseval' },
      ] },
      { type: 'range', id: 'fp-param', label: 'Delay', min: 0, max: 40, step: 1, value: 12, format: (v) => `${v} samples` },
      { type: 'range', id: 'fp-amp', label: 'Amplitude', min: 0.1, max: 1, step: 0.05, value: 1, format: (v) => fmt(v, 2) },
    ],
    plots: [
      { id: 'time', caption: 'Original and transformed signal', tall: true },
      { id: 'spec', caption: 'Magnitude spectra', tall: true },
    ],
    readouts: [
      { id: 'param', label: 'Parameter' },
      { id: 'mag', label: 'Magnitude change' },
      { id: 'energy', label: 'Energy ratio' },
    ],
    tasks: [
      'Shift the signal. Does the magnitude spectrum change? What happens to the phase?',
      'Set time scale to 2. Which way does the spectrum stretch, and where does aliasing appear?',
      'Modulate at 0.2 cycles/sample. Identify the two sidebands and their spacing.',
    ],
    note: 'The test signal is a windowed two-tone pulse. Time scaling here is simple decimation (keep every M-th sample) without an anti-alias filter, so it deliberately demonstrates aliasing. Parseval energy uses the one-sided real-DFT scaling.',
  });
  const timePlot = lab.plot('time', { xLabel: 'sample', yLabel: 'amplitude', legend: true });
  const specPlot = lab.plot('spec', { xLabel: 'frequency (cycles/sample)', yLabel: '|X|', legend: true });
  const N = 256;
  const base = Array.from({ length: N }, (_, n) => {
    const env = Math.exp(-0.5 * ((n - 128) / 55) ** 2);
    return env * (Math.cos(2 * Math.PI * 0.08 * n) + 0.55 * Math.cos(2 * Math.PI * 0.16 * n + 0.4));
  });

  function setupControls(mode) {
    const p = lab.byId('fp-param');
    if (!p) return;
    const wrap = p.closest('.control');
    if (wrap) wrap.style.display = mode === 'parseval' ? 'none' : '';
    if (mode === 'shift') { p.min = 0; p.max = 60; p.step = 1; p.value = 12; }
    if (mode === 'scale') { p.min = 1; p.max = 4; p.step = 1; p.value = 2; }
    if (mode === 'mod') { p.min = 0.05; p.max = 0.4; p.step = 0.01; p.value = 0.2; }
    if (mode === 'parseval') { p.min = 0.1; p.max = 1; p.step = 0.05; p.value = 1; }
    const out = lab.q('[data-out="fp-param"]');
    if (out) out.textContent = mode === 'scale' ? `×${p.value}` : mode === 'mod' ? `${Number(p.value).toFixed(2)} fs` : `${p.value}`;
    const label = p.closest('.control')?.querySelector('label');
    if (label) label.childNodes[0].textContent = mode === 'shift' ? 'Delay ' : mode === 'scale' ? 'Decimation factor ' : mode === 'mod' ? 'Carrier ' : 'Gain ';
    p.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function draw() {
    const mode = lab.segValue('fp-mode');
    const param = lab.get('fp-param');
    const amp = lab.get('fp-amp');
    let y = base.slice();
    if (mode === 'shift') y = base.map((_, n) => (n - param >= 0 ? base[n - param] * amp : 0));
    else if (mode === 'scale') {
      const M = Math.max(1, Math.round(param));
      y = Array.from({ length: N }, (_, n) => (n * M < N ? base[n * M] * amp : 0));
    } else if (mode === 'mod') {
      y = base.map((v, n) => v * amp * Math.cos(2 * Math.PI * param * n));
    } else {
      y = base.map((v) => v * amp);
    }
    const S1 = spectrum(base), S2 = spectrum(y);
    timePlot.setData([
      { type: 'line', y: base, color: 'var(--muted)', width: 1.2, label: 'original' },
      { type: 'line', y, color: 'var(--accent)', width: 1.9, label: 'transformed' },
    ], { xMin: 0, xMax: N - 1 });
    specPlot.setData([
      { type: 'line', x: S1.freqs, y: S1.mag.map((v) => v / N), color: 'var(--muted)', width: 1.2, label: 'original' },
      { type: 'line', x: S2.freqs, y: S2.mag.map((v) => v / N), color: 'var(--accent)', width: 1.8, label: 'transformed' },
    ], { xMin: 0, xMax: 0.5, yMin: 0 });
    const e1 = base.reduce((s, v) => s + v * v, 0);
    const e2 = y.reduce((s, v) => s + v * v, 0);
    const mag1 = Math.max(...S1.mag), mag2 = Math.max(...S2.mag);
    lab.readouts({
      param: mode === 'scale' ? `decimate ×${Math.round(param)}` : mode === 'mod' ? `carrier ${Number(param).toFixed(2)}` : `${param}`,
      mag: `${(100 * mag2 / (mag1 || 1)).toFixed(1)}% of original peak`,
      energy: `${(e2 / (e1 || 1)).toFixed(3)}`,
    });
  }
  lab.onSeg('fp-mode', (mode) => { setupControls(mode); draw(); });
  lab.onInput('fp-param', draw);
  lab.onInput('fp-amp', draw);
  setupControls('shift');
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* Transform pairs                                                     */
/* ------------------------------------------------------------------ */

registerLab('pairs', (el) => {
  const lab = mountLabShell(el, {
    title: 'Shapes and their spectra',
    intro: 'Switch among delta, rectangle, triangle, Gaussian, square-wave harmonics, and chirp signals. Adjust width and observe reciprocal changes in the spectrum; add harmonics to a square wave and watch Gibbs ringing narrow but not disappear.',
    plotCols: 2,
    controls: [
      { type: 'select', id: 'pairs-shape', label: 'Signal shape', value: 'rect', options: [
        { value: 'delta', label: 'Delta' }, { value: 'rect', label: 'Rectangle' }, { value: 'triangle', label: 'Triangle' }, { value: 'gaussian', label: 'Gaussian' }, { value: 'square', label: 'Square wave' }, { value: 'chirp', label: 'Chirp' },
      ] },
      { type: 'range', id: 'pairs-width', label: 'Width / σ', min: 2, max: 40, step: 1, value: 12, format: (v) => String(v) },
      { type: 'range', id: 'pairs-harm', label: 'Harmonics', min: 1, max: 31, step: 2, value: 9, format: (v) => String(v) },
      { type: 'range', id: 'pairs-rate', label: 'Chirp rate', min: 0, max: 2, step: 0.05, value: 0.6, format: (v) => fmt(v, 2) },
    ],
    plots: [
      { id: 'time', caption: 'Time-domain waveform', tall: true },
      { id: 'spec', caption: 'One-sided magnitude spectrum', tall: true },
    ],
    readouts: [
      { id: 'zero', label: 'First spectral feature' },
      { id: 'over', label: 'Gibbs overshoot' },
      { id: 'band', label: 'Occupied band' },
    ],
    tasks: [
      'Double the rectangle width. What happens to the main lobe of the sinc?',
      'Increase the square-wave harmonics from 3 to 31. Does the overshoot disappear?',
      'Change the chirp rate. How does the spectrum change, and why is a single spectrum an incomplete description?',
    ],
    note: 'The square wave is synthesized with odd harmonics and normalized to ±1; the overshoot is measured above the flat top. The chirp is a linear sweep; its instantaneous frequency is not visible in a single magnitude spectrum.',
  });
  const timePlot = lab.plot('time', { xLabel: 'sample', yLabel: 'amplitude' });
  const specPlot = lab.plot('spec', { xLabel: 'frequency (cycles/sample)', yLabel: '|X|' });
  const N = 256;
  const c = N / 2;

  function make() {
    const shape = lab.get('pairs-shape');
    const w = lab.get('pairs-width');
    const H = lab.get('pairs-harm');
    const rate = lab.get('pairs-rate');
    const n = Array.from({ length: N }, (_, i) => i);
    if (shape === 'delta') return n.map((i) => (i === c ? 1 : 0));
    if (shape === 'rect') return n.map((i) => (Math.abs(i - c) <= w ? 1 : 0));
    if (shape === 'triangle') return n.map((i) => Math.max(0, 1 - Math.abs(i - c) / w));
    if (shape === 'gaussian') return n.map((i) => Math.exp(-0.5 * ((i - c) / w) ** 2));
    if (shape === 'chirp') {
      return n.map((i) => {
        const t = i / N;
        return Math.cos(2 * Math.PI * (0.03 * i + 0.5 * rate * (i * i) / N));
      });
    }
    // square wave, period 32, odd harmonics
    const period = 32;
    let x = n.map((i) => (i % period < period / 2 ? 1 : -1));
    const peak = 1;
    let y = n.map(() => 0);
    for (let h = 1; h <= H; h += 2) {
      y = y.map((v, i) => v + (4 / (Math.PI * h)) * Math.sin(2 * Math.PI * h * i / period));
    }
    return y;
  }

  function draw() {
    const shape = lab.get('pairs-shape');
    const x = make();
    const S = spectrum(x);
    timePlot.setData([{ type: 'line', y: x, color: 'var(--accent)', width: shape === 'delta' ? 2 : 1.6, label: shape }], { xMin: 0, xMax: N - 1, yMin: Math.min(-1.3, ...x), yMax: Math.max(1.4, ...x) });
    specPlot.setData([{ type: 'line', x: S.freqs, y: S.mag.map((v) => v / N), color: 'var(--accent)', width: 1.6, label: '|X|/N' }], { xMin: 0, xMax: 0.5, yMin: 0 });
    const mag = S.mag.map((v) => v / Math.max(1e-12, Math.max(...S.mag)));
    let first = null;
    if (shape === 'rect' || shape === 'triangle') {
      for (let k = 2; k < mag.length - 1; k++) if (mag[k] < 0.02 && mag[k - 1] > mag[k] && mag[k + 1] > mag[k]) { first = k; break; }
    }
    let over = null;
    if (shape === 'square') over = Math.max(...x) - 1;
    let band = '—';
    if (shape === 'chirp') {
      const threshold = 0.1;
      const idx = mag.map((v, k) => ({ k, v })).filter((e) => e.v > threshold);
      if (idx.length) band = `${(idx[0].k / N).toFixed(2)}–${(idx[idx.length - 1].k / N).toFixed(2)} fs`;
    }
    lab.readouts({
      zero: first ? `bin ${first} · ${(first / N).toFixed(3)} fs` : shape === 'gaussian' || shape === 'delta' ? 'no zeros' : '—',
      over: over === null ? '—' : `${(over * 100).toFixed(1)}%`,
      band,
    });
  }

  lab.onChange('pairs-shape', () => {
    updatePairsVisibility();
    draw();
  });
  function updatePairsVisibility() {
    const shape = lab.get('pairs-shape');
    const width = lab.byId('pairs-width')?.closest('.control');
    const harm = lab.byId('pairs-harm')?.closest('.control');
    const rate = lab.byId('pairs-rate')?.closest('.control');
    if (width) width.style.display = ['rect', 'triangle', 'gaussian'].includes(shape) ? '' : 'none';
    if (harm) harm.style.display = shape === 'square' ? '' : 'none';
    if (rate) rate.style.display = shape === 'chirp' ? '' : 'none';
  }
  ['pairs-width', 'pairs-harm', 'pairs-rate'].forEach((id) => lab.onInput(id, draw));
  updatePairsVisibility();
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* FFT butterfly                                                       */
/* ------------------------------------------------------------------ */

registerLab('fft', (el) => {
  const lab = mountLabShell(el, {
    title: 'Inside the butterfly',
    intro: 'Step through an 8-point radix-2 FFT. The left panel shows the bit-reversed inputs, each butterfly stage, and the final spectrum; the right panel compares the operation count with a direct DFT.',
    plotCols: 2,
    controls: [
      { type: 'select', id: 'fft-input', label: 'Input signal', value: 'impulse', options: [
        { value: 'impulse', label: 'Impulse' }, { value: 'cos1', label: 'Cosine, bin 1' }, { value: 'cos2', label: 'Cosine, bin 2' }, { value: 'mixed', label: 'Two cosines' },
      ] },
      { type: 'range', id: 'fft-stage', label: 'Stage', min: 0, max: 3, step: 1, value: 0, format: (v) => `stage ${v}` },
      { type: 'range', id: 'fft-speed', label: 'Playback speed', min: 300, max: 1400, step: 100, value: 800, format: (v) => `${(v / 1000).toFixed(1)} s` },
      { type: 'html', html: `<div class="control" style="flex:0 1 auto;max-width:none"><label>&nbsp;</label><div class="row"><button class="btn btn-sm" data-lab-play>Play</button><button class="btn btn-sm" data-lab-reset>Reset</button></div></div>` },
    ],
    plots: [
      { id: 'flow', caption: 'Butterfly signal flow (complex values)', xtall: true },
      { id: 'ops', caption: 'Complex multiplications: DFT vs FFT', tall: true },
    ],
    readouts: [
      { id: 'opsfft', label: 'FFT butterflies' },
      { id: 'opsdft', label: 'DFT products' },
      { id: 'speedup', label: 'Speedup' },
    ],
    tasks: [
      'Step through the impulse input. Why does the spectrum become flat?',
      'At stage 1, which pairs of samples are combined?',
      'Compare the operation counts. At what N does the FFT save an order of magnitude?',
    ],
    note: 'The flow diagram is an 8-point decimation-in-time FFT with bit-reversed input. Node labels show real + j·imaginary. The operation-count comparison ignores additions and memory access, so real speedups differ.',
  });
  const flowCanvas = lab.byId(`${lab.id}-flow`);
  const opsPlot = lab.plot('ops', { xLabel: 'N', yLabel: 'complex multiplies', legend: true, padding: { l: 64, r: 14, t: 24, b: 30 } });
  let timer = 0;

  function bitrev(n, bits) {
    let r = 0;
    for (let i = 0; i < bits; i++) { r = (r << 1) | (n & 1); n >>= 1; }
    return r;
  }

  function computeStages() {
    const input = lab.get('fft-input');
    const N = 8;
    let x = new Array(N).fill(0);
    if (input === 'impulse') x[0] = 1;
    else if (input === 'cos1') x = x.map((_, n) => Math.cos(2 * Math.PI * n / N));
    else if (input === 'cos2') x = x.map((_, n) => Math.cos(2 * Math.PI * 2 * n / N));
    else x = x.map((_, n) => Math.cos(2 * Math.PI * n / N) + 0.5 * Math.cos(2 * Math.PI * 3 * n / N));
    const order = Array.from({ length: N }, (_, i) => bitrev(i, 3));
    const re0 = order.map((i) => x[i]);
    const im0 = new Array(N).fill(0);
    const stages = [{ re: re0.slice(), im: im0.slice(), label: 'bit-reversed input' }];
    let re = re0.slice(), im = im0.slice();
    for (let len = 2; len <= N; len <<= 1) {
      const half = len / 2;
      for (let start = 0; start < N; start += len) {
        for (let j = 0; j < half; j++) {
          const ang = -2 * Math.PI * j / len;
          const wr = Math.cos(ang), wi = Math.sin(ang);
          const a = start + j, b = a + half;
          const tr = re[b] * wr - im[b] * wi;
          const ti = re[b] * wi + im[b] * wr;
          const ur = re[a], ui = im[a];
          re[a] = ur + tr; im[a] = ui + ti;
          re[b] = ur - tr; im[b] = ui - ti;
        }
      }
      stages.push({ re: re.slice(), im: im.slice(), label: `stage ${Math.log2(len)}` });
    }
    return { stages, order, x };
  }

  function drawFlow() {
    if (!flowCanvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = flowCanvas.clientWidth || 560, h = flowCanvas.clientHeight || 330;
    flowCanvas.width = Math.round(w * dpr); flowCanvas.height = Math.round(h * dpr);
    const ctx = flowCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = (v, f) => getComputedStyle(flowCanvas).getPropertyValue(v).trim() || f;
    const ink = css('--ink', '#1b2430'), muted = css('--muted', '#66717d'), border = css('--border', '#ddd5c6'), accent = css('--accent', '#0e6b62'), coral = css('--coral', '#c2410c');
    ctx.clearRect(0, 0, w, h);
    const { stages } = computeStages();
    const stage = Math.min(3, lab.get('fft-stage'));
    const left = 66, right = w - 18, top = 34, bottom = h - 28;
    const colW = (right - left) / stages.length;
    const rowH = (bottom - top) / 7;
    const nodeY = (i) => top + i * rowH;
    ctx.font = '10px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    stages.forEach((st, c) => {
      const x = left + c * colW;
      ctx.fillStyle = c === stage ? accent : muted;
      ctx.font = '600 10px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(st.label, x, 8);
      ctx.font = '9px "Cascadia Code", monospace';
      st.re.forEach((r, i) => {
        const y = nodeY(i);
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = c === stage ? accent : border; ctx.fill();
        if (c === stage || c === 0 || c === stages.length - 1) {
          ctx.fillStyle = ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          const im = st.im[i];
          const label = `${r.toFixed(2)}${im >= 0 ? '+' : '−'}j${Math.abs(im).toFixed(2)}`;
          ctx.fillText(label, x + 7, y);
        }
      });
    });
    // butterfly connections
    for (let c = 1; c < stages.length; c++) {
      const len = 2 ** c;
      const half = len / 2;
      for (let start = 0; start < 8; start += len) {
        for (let j = 0; j < half; j++) {
          const a = start + j, b = a + half;
          const x1 = left + (c - 1) * colW + 4, x2 = left + c * colW - 4;
          ctx.strokeStyle = c === stage ? accent : border;
          ctx.globalAlpha = c === stage ? 0.9 : 0.35;
          ctx.lineWidth = c === stage ? 1.6 : 1;
          ctx.beginPath(); ctx.moveTo(x1, nodeY(a)); ctx.bezierCurveTo((x1 + x2) / 2, nodeY(a), (x1 + x2) / 2, nodeY(a), x2, nodeY(a)); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x1, nodeY(b)); ctx.bezierCurveTo((x1 + x2) / 2, nodeY(b), (x1 + x2) / 2, nodeY(a), x2, nodeY(a)); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x1, nodeY(a)); ctx.bezierCurveTo((x1 + x2) / 2, nodeY(a), (x1 + x2) / 2, nodeY(b), x2, nodeY(b)); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x1, nodeY(b)); ctx.bezierCurveTo((x1 + x2) / 2, nodeY(b), (x1 + x2) / 2, nodeY(b), x2, nodeY(b)); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = muted; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('node = Re + j·Im · lines show butterfly pairings · twiddles omitted for clarity', 8, h - 4);
    flowCanvas.setAttribute('aria-label', `8-point FFT flow diagram at ${stages[stage].label}. Values: ${stages[stage].re.map((r, i) => `${r.toFixed(2)} plus j ${stages[stage].im[i].toFixed(2)}`).join('; ')}`);
  }

  function drawOps() {
    const Ns = [8, 16, 32, 64, 128, 256, 512, 1024];
    opsPlot.setData([
      { type: 'line', x: Ns, y: Ns.map((n) => n * n), color: 'var(--coral)', width: 2, label: 'direct DFT ~N²' },
      { type: 'line', x: Ns, y: Ns.map((n) => n / 2 * Math.log2(n)), color: 'var(--accent)', width: 2, label: 'FFT ~N/2 log₂N' },
    ], { xMin: 8, xMax: 1024, yMin: 0, yMax: 1000000 });
    const n = 8;
    const dftOps = n * n, fftOps = n / 2 * Math.log2(n);
    lab.readouts({ opsfft: `${fftOps} butterflies`, opsdft: `${dftOps} products`, speedup: `${(dftOps / fftOps).toFixed(1)}×` });
  }

  function draw() { drawFlow(); drawOps(); }
  function stop() { clearInterval(timer); timer = 0; const b = lab.q('[data-lab-play]'); if (b) b.textContent = 'Play'; }
  lab.q('[data-lab-play]')?.addEventListener('click', (e) => {
    if (timer) { stop(); return; }
    e.target.textContent = 'Pause';
    timer = setInterval(() => {
      let s = lab.get('fft-stage'); s = (s + 1) % 4; lab.set('fft-stage', s); draw();
    }, lab.get('fft-speed'));
  });
  lab.q('[data-lab-reset]')?.addEventListener('click', () => { stop(); lab.set('fft-stage', 0); draw(); });
  lab.onChange('fft-input', draw);
  lab.onInput('fft-stage', draw);
  const ro = new ResizeObserver(() => drawFlow());
  ro.observe(flowCanvas?.parentElement || flowCanvas);
  draw();
  return () => { stop(); ro.disconnect(); lab.destroy(); };
});

/* ------------------------------------------------------------------ */
/* Continuous signal processing                                        */
/* ------------------------------------------------------------------ */

registerLab('continuous', (el) => {
  const lab = mountLabShell(el, {
    title: 'Continuous convolution and Fourier series',
    intro: 'Explore the continuous-time counterparts. In convolution mode, a rectangular pulse drives an RC-like exponential system; in Fourier-series mode, a square wave is rebuilt from harmonics and Gibbs ringing appears.',
    plotCols: 2,
    controls: [
      { type: 'seg', id: 'cont-mode', label: 'Mode', value: 'conv', options: [{ value: 'conv', label: 'Convolution' }, { value: 'series', label: 'Fourier series' }] },
      { type: 'range', id: 'cont-width', label: 'Pulse width', min: 0.05, max: 0.8, step: 0.01, value: 0.35, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'cont-tau', label: 'Time constant τ', min: 0.02, max: 0.5, step: 0.01, value: 0.15, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'cont-harm', label: 'Harmonics', min: 1, max: 31, step: 2, value: 9, format: (v) => String(v) },
    ],
    plots: [
      { id: 'time', caption: 'Time-domain response', tall: true },
      { id: 'spec', caption: 'Impulse response (conv) / error (series)', tall: true },
    ],
    readouts: [
      { id: 'peak', label: 'Peak / overshoot' },
      { id: 'rms', label: 'RMS error' },
      { id: 'note', label: 'Mode' },
    ],
    tasks: [
      'In convolution mode, widen the pulse. How does the output peak change?',
      'Shorten τ. Does the system track the pulse faster?',
      'In Fourier-series mode, increase harmonics. Does the Gibbs overshoot shrink?',
    ],
    note: 'Convolution mode uses the analytic RC step response. Fourier mode synthesizes a square wave; the overshoot is measured above the flat top. Continuous curves are sampled for display only.',
  });
  const timePlot = lab.plot('time', { xLabel: 'time (arbitrary units)', yLabel: 'amplitude', legend: true });
  const specPlot = lab.plot('spec', { xLabel: 'time / harmonic', yLabel: 'error / amplitude', legend: true });
  const N = 512;

  function draw() {
    const mode = lab.segValue('cont-mode');
    const width = lab.get('cont-width');
    const tau = lab.get('cont-tau');
    const H = lab.get('cont-harm');
    const t = Array.from({ length: N }, (_, i) => i / N);
    if (mode === 'conv') {
      const x = t.map((v) => (v >= 0 && v <= width ? 1 : 0));
      const y = t.map((v) => {
        if (v < 0) return 0;
        if (v <= width) return tau * (1 - Math.exp(-v / tau));
        return tau * Math.exp(-v / tau) * (Math.exp(width / tau) - 1);
      });
      timePlot.setData([
        { type: 'line', x: t, y: x, color: 'var(--muted)', width: 1.2, label: 'input pulse' },
        { type: 'line', x: t, y: y, color: 'var(--accent)', width: 2, label: 'RC response' },
      ], { xMin: 0, xMax: 1, yMin: 0, yMax: Math.max(...y, ...x) * 1.15 });
      specPlot.setData([{ type: 'line', x: t, y: t.map((v) => Math.exp(-v / tau)), color: 'var(--coral)', width: 1.5, label: 'impulse response h(t)' }], { xMin: 0, xMax: 1, yMin: 0, yMax: 1.1 });
      const peak = Math.max(...y);
      const ideal = tau * (1 - Math.exp(-width / tau));
      lab.readouts({ peak: `${peak.toFixed(3)} (ideal ${ideal.toFixed(3)})`, rms: '—', note: 'RC convolution' });
    } else {
      const duty = Math.max(0.05, Math.min(0.95, width));
      const square = t.map((v) => (v % 1 < duty ? 1 : -1));
      let partial = t.map(() => 2 * duty - 1);
      for (let h = 1; h <= H; h++) {
        // c_h = 2(1 - e^{-j2πhd})/(j2πh); add 2 Re(c_h e^{j2πht})
        const den = Math.PI * h;
        const cRe = Math.sin(2 * Math.PI * h * duty) / den;
        const cIm = -(1 - Math.cos(2 * Math.PI * h * duty)) / den;
        partial = partial.map((v, i) => v + 2 * (cRe * Math.cos(2 * Math.PI * h * t[i]) - cIm * Math.sin(2 * Math.PI * h * t[i])));
      }
      const err = square.map((v, i) => v - partial[i]);
      timePlot.setData([
        { type: 'line', x: t, y: square, color: 'var(--muted)', width: 1.2, label: 'ideal square' },
        { type: 'line', x: t, y: partial, color: 'var(--accent)', width: 1.8, label: `${H} harmonics` },
      ], { xMin: 0, xMax: 1, yMin: -1.5, yMax: 1.5 });
      specPlot.setData([{ type: 'line', x: t, y: err, color: 'var(--coral)', width: 1.2, label: 'error' }], { xMin: 0, xMax: 1, yMin: -0.6, yMax: 0.6 });
      const over = Math.max(...partial) - 1;
      const rms = Math.sqrt(err.reduce((s, v) => s + v * v, 0) / err.length);
      lab.readouts({ peak: `${(over * 100).toFixed(1)}%`, rms: rms.toFixed(4), note: 'Fourier series' });
    }
  }
  lab.onSeg('cont-mode', () => {
    updateContVisibility();
    draw();
  });
  function updateContVisibility() {
    const mode = lab.segValue('cont-mode');
    const tau = lab.byId('cont-tau')?.closest('.control');
    const harm = lab.byId('cont-harm')?.closest('.control');
    if (tau) tau.style.display = mode === 'conv' ? '' : 'none';
    if (harm) harm.style.display = mode === 'series' ? '' : 'none';
    const widthLabel = lab.byId('cont-width')?.closest('.control')?.querySelector('label');
    if (widthLabel) widthLabel.childNodes[0].textContent = mode === 'conv' ? 'Pulse width ' : 'Duty cycle ';
  }
  ['cont-width', 'cont-tau', 'cont-harm'].forEach((id) => lab.onInput(id, draw));
  updateContVisibility();
  draw();
  return () => lab.destroy();
});
