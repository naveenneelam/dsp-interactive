/** Fourier and convolution labs. */

import {
  convolve, correlate, realDft, inverseRealDft, spectrum, pad, nextPow2,
  movingAverage, windowFunction, sinc, fft, dft, mean, clamp,
} from '../dsp.js';
import { mountLabShell, sine, noise, fmt } from './lab-kit.js';
import { registerLab } from './lab-registry.js';

function signalByName(name, n = 64) {
  if (name === 'pulse') return Array.from({ length: n }, (_, i) => (i >= 20 && i < 30 ? 1 : 0));
  if (name === 'two') return Array.from({ length: n }, (_, i) => (i >= 12 && i < 17 ? 0.8 : 0) + (i >= 38 && i < 46 ? -0.6 : 0));
  if (name === 'ramp') return Array.from({ length: n }, (_, i) => i / (n - 1));
  if (name === 'noisy') return Array.from({ length: n }, (_, i) => Math.sin(2 * Math.PI * 5 * i / n) + 0.25 * (Math.sin(i * 12.9898) * 43758.5453 % 1));
  return Array.from({ length: n }, (_, i) => Math.exp(-((i - 32) ** 2) / 60));
}

function kernelByName(name, M = 11) {
  if (name === 'average') return new Array(M).fill(1 / M);
  if (name === 'diff') {
    const h = new Array(M).fill(0); h[Math.floor(M / 2)] = 1; h[Math.floor(M / 2) - 1] = -1; return h;
  }
  if (name === 'delta') { const h = new Array(M).fill(0); h[Math.floor(M / 2)] = 1; return h; }
  if (name === 'echo') { const h = new Array(M).fill(0); h[1] = 0.7; h[Math.min(M - 1, 7)] = 0.35; return h; }
  if (name === 'sinc') {
    const h = Array.from({ length: M }, (_, i) => {
      const t = i - Math.floor(M / 2);
      return 2 * 0.18 * (t === 0 ? 1 : Math.sin(2 * Math.PI * 0.18 * t) / (2 * Math.PI * 0.18 * t));
    });
    const s = h.reduce((a, b) => a + b, 0);
    return h.map((v) => v / s);
  }
  return new Array(M).fill(1 / M);
}

/* ------------------------------------------------------------------ */
/* Convolution                                                         */
/* ------------------------------------------------------------------ */

registerLab('convolution', (el) => {
  const lab = mountLabShell(el, {
    title: 'Convolution, step by step',
    intro: 'Scrub through the convolution one output sample at a time. The left plot shows the input samples and the reversed, shifted kernel; the right plot shows the output being assembled from the overlapping products.',
    plotCols: 2,
    controls: [
      { type: 'select', id: 'conv-signal', label: 'Input signal', value: 'pulse', options: [
        { value: 'pulse', label: 'Rectangular pulse' }, { value: 'two', label: 'Two pulses' }, { value: 'ramp', label: 'Ramp' }, { value: 'gauss', label: 'Gaussian pulse' },
      ] },
      { type: 'select', id: 'conv-kernel', label: 'Impulse response', value: 'average', options: [
        { value: 'average', label: '11-point average' }, { value: 'diff', label: 'First difference' }, { value: 'delta', label: 'Delta (identity)' }, { value: 'echo', label: 'Echo' }, { value: 'sinc', label: 'Sinc low-pass' },
      ] },
      { type: 'range', id: 'conv-n', label: 'Output sample n', min: 0, max: 73, step: 1, value: 20, format: (v) => String(v) },
      { type: 'range', id: 'conv-speed', label: 'Playback speed', min: 30, max: 300, step: 10, value: 120, format: (v) => `${v} ms` },
      { type: 'html', html: `<div class="control" style="flex:0 1 auto;max-width:none"><label>&nbsp;</label><div class="row"><button class="btn btn-sm" data-lab-play>Play</button><button class="btn btn-sm" data-lab-reset>Reset</button></div></div>` },
    ],
    plots: [
      { id: 'overlay', caption: 'Input x[k] and reversed kernel h[n−k]', tall: true },
      { id: 'output', caption: 'Full output; the marker is the current sample', tall: true },
    ],
    readouts: [
      { id: 'y', label: 'y[n]' },
      { id: 'len', label: 'Full length' },
      { id: 'sum', label: 'Σ products' },
    ],
    tasks: [
      'Convolve a pulse with the delta kernel. Explain why the output equals the input.',
      'Use the first-difference kernel. Where does the output go negative, and why?',
      'Scrub to the first output sample. Which input samples contribute? Now scrub to the last.',
    ],
    note: 'The kernel is reversed and shifted for the display. The output is computed by full linear convolution, then cropped to the input length for the marker; the left plot shows the actual overlap at sample n.',
  });
  const overlay = lab.plot('overlay', { xLabel: 'input index k', yLabel: 'amplitude', legend: true });
  const outPlot = lab.plot('output', { xLabel: 'output index n', yLabel: 'amplitude' });
  let timer = 0;

  const signal = () => signalByName(lab.get('conv-signal'), 64);
  const kernel = () => kernelByName(lab.get('conv-kernel'), 11);

  function draw() {
    const x = signal(), h = kernel();
    const y = convolve(x, h);
    const n = Math.min(lab.get('conv-n'), y.length - 1);
    const k = Array.from({ length: x.length }, (_, i) => i);
    const hrev = k.map((kk) => (n - kk >= 0 && n - kk < h.length ? h[n - kk] : 0));
    const prod = x.map((v, i) => v * hrev[i]);
    overlay.setData([
      { type: 'stems', x: k, y: x, color: 'var(--muted)', label: 'input x[k]' },
      { type: 'line', x: k, y: hrev, color: 'var(--coral)', width: 2, label: `h[${n}−k]` },
      { type: 'line', x: k, y: prod, color: 'var(--accent)', width: 1.2, label: 'products' },
    ], { xMin: 0, xMax: 63, yMin: Math.min(-0.6, ...hrev, ...prod) - 0.1, yMax: Math.max(1.2, ...hrev, ...prod) + 0.1 });
    outPlot.setData([{ type: 'stems', x: Array.from({ length: y.length }, (_, i) => i), y, color: 'var(--accent)', label: 'y[n]' }],
      { xMin: 0, xMax: y.length - 1, yMin: Math.min(-0.5, ...y) - 0.1, yMax: Math.max(1.2, ...y) + 0.1 });
    outPlot.setOverlays({ markers: [{ type: 'point', x: n, y: y[n], color: 'var(--coral)', r: 5, label: 'current' }] });
    lab.readouts({ y: y[n].toFixed(4), len: String(y.length), sum: prod.reduce((s, v) => s + v, 0).toFixed(4) });
    const slider = lab.byId('conv-n');
    if (slider && Number(slider.value) !== n) slider.value = n;
  }

  function stop() { clearInterval(timer); timer = 0; const b = lab.q('[data-lab-play]'); if (b) b.textContent = 'Play'; }
  lab.q('[data-lab-play]')?.addEventListener('click', (e) => {
    if (timer) { stop(); return; }
    e.target.textContent = 'Pause';
    let n = lab.get('conv-n');
    timer = setInterval(() => {
      n++;
      if (n > 73) { n = 0; }
      lab.set('conv-n', n);
      draw();
    }, 310 - lab.get('conv-speed'));
  });
  lab.q('[data-lab-reset]')?.addEventListener('click', () => { stop(); lab.set('conv-n', 20); draw(); });
  lab.onChange('conv-signal', () => { stop(); draw(); });
  lab.onChange('conv-kernel', () => { stop(); draw(); });
  lab.onInput('conv-n', draw);
  draw();
  return () => { stop(); lab.destroy(); };
});

/* ------------------------------------------------------------------ */
/* Convolution properties and correlation                              */
/* ------------------------------------------------------------------ */

registerLab('convolution-properties', (el) => {
  const lab = mountLabShell(el, {
    title: 'Kernels and correlation',
    intro: 'Apply identity, gain, echo, smoothing, differencing, and sinc kernels to the same signal. Then switch to correlation mode and locate a hidden echo delay.',
    plotCols: 2,
    controls: [
      { type: 'seg', id: 'cp-mode', label: 'Mode', value: 'filter', options: [{ value: 'filter', label: 'Filter' }, { value: 'corr', label: 'Correlation' }] },
      { type: 'select', id: 'cp-kernel', label: 'Kernel', value: 'average', options: [
        { value: 'delta', label: 'Identity (delta)' }, { value: 'echo', label: 'Echo' }, { value: 'average', label: 'Moving average' }, { value: 'diff', label: 'First difference' }, { value: 'sinc', label: 'Sinc low-pass' }, { value: 'gain', label: 'Gain ×1.8' },
      ] },
      { type: 'range', id: 'cp-delay', label: 'Echo delay', min: 2, max: 20, step: 1, value: 9, format: (v) => `${v} samples` },
      { type: 'range', id: 'cp-noise', label: 'Noise', min: 0, max: 0.4, step: 0.01, value: 0.05, format: (v) => fmt(v, 2) },
    ],
    plots: [
      { id: 'time', caption: 'Input and processed output', tall: true },
      { id: 'spec', caption: 'Magnitude response / correlation', tall: true },
    ],
    readouts: [
      { id: 'peak', label: 'Correlation peak' },
      { id: 'lag', label: 'Estimated lag' },
      { id: 'gain', label: 'DC gain' },
    ],
    tasks: [
      'Apply the delta kernel. Is the output exactly the input?',
      'Use the echo kernel and change the delay. Does convolution shift the echo?',
      'Switch to correlation and raise the noise. How robust is the peak-lag estimate?',
    ],
    note: 'Correlation mode transmits a known pulse, adds an echo and noise, then correlates the received signal with the pulse. The lag of the maximum estimates the echo delay.',
  });
  const timePlot = lab.plot('time', { xLabel: 'sample', yLabel: 'amplitude', legend: true });
  const specPlot = lab.plot('spec', { xLabel: 'frequency (cycles/sample) / lag', yLabel: 'magnitude', legend: true });
  const N = 96;

  function kernel() {
    const kind = lab.get('cp-kernel');
    const delay = lab.get('cp-delay');
    if (kind === 'delta') { const h = new Array(25).fill(0); h[12] = 1; return h; }
    if (kind === 'gain') { const h = new Array(25).fill(0); h[12] = 1.8; return h; }
    if (kind === 'echo') { const h = new Array(25).fill(0); h[0] = 1; h[Math.min(24, delay)] = 0.55; return h; }
    if (kind === 'average') return new Array(9).fill(1 / 9);
    if (kind === 'diff') { const h = new Array(9).fill(0); h[4] = 1; h[3] = -1; return h; }
    return kernelByName('sinc', 17);
  }
  function baseSignal() {
    return Array.from({ length: N }, (_, i) => {
      const pulse = i >= 28 && i < 38 ? 1 : 0;
      const tone = 0.25 * Math.sin(2 * Math.PI * 9 * i / N);
      const rnd = 0.2 * Math.sin(i * 91.7) * Math.sin(i * 3.3);
      return pulse + tone + rnd * lab.get('cp-noise') * 5;
    });
  }

  function draw() {
    const mode = lab.segValue('cp-mode');
    const x = mode === 'filter' ? baseSignal() : Array.from({ length: N }, (_, i) => (i >= 10 && i < 18 ? 1 : 0));
    if (mode === 'filter') {
      const h = kernel();
      const y = convolve(x, h);
      timePlot.setData([
        { type: 'line', y: x, color: 'var(--muted)', width: 1.1, label: 'input' },
        { type: 'line', y: y.slice(0, N), color: 'var(--accent)', width: 2, label: 'output' },
      ], { xMin: 0, xMax: N - 1 });
      const H = realDft(pad(h, nextPow2(Math.max(64, h.length * 4))));
      specPlot.setData([{ type: 'line', x: H.freqs, y: H.mag, color: 'var(--accent)', width: 1.6, label: '|H(f)|' }], { xMin: 0, xMax: 0.5, yMin: 0 });
      const dc = h.reduce((s, v) => s + v, 0);
      lab.readouts({ peak: '—', lag: '—', gain: dc.toFixed(3) });
    } else {
      const delay = lab.get('cp-delay');
      const received = x.map((v, i) => (i >= delay ? 0.8 * x[i - delay] : 0) + 0.08 * Math.sin(i * 17.3) * (lab.get('cp-noise') * 10));
      const r = correlate(received, x);
      // correlate returns full; find peak away from zero lag by scanning positive lags
      let peak = -Infinity, lag = 0;
      for (let i = 0; i < r.length; i++) if (r[i] > peak) { peak = r[i]; lag = i - (x.length - 1); }
      timePlot.setData([
        { type: 'line', y: received, color: 'var(--muted)', width: 1.2, label: 'received' },
        { type: 'line', y: x, color: 'var(--coral)', width: 1.2, label: 'known pulse' },
      ], { xMin: 0, xMax: N - 1 });
      specPlot.setData([{ type: 'line', x: Array.from({ length: r.length }, (_, i) => i - (x.length - 1)), y: r, color: 'var(--accent)', width: 2, label: 'correlation' }], { xMin: -(x.length - 1), xMax: x.length - 1 });
      specPlot.setOverlays({ markers: [{ type: 'point', x: lag, y: peak, color: 'var(--coral)', r: 5, label: `lag ${lag}` }] });
      lab.readouts({ peak: peak.toFixed(2), lag: String(lag), gain: '—' });
    }
  }
  lab.onSeg('cp-mode', () => { updateVisibility(); draw(); });
  function updateVisibility() {
    const mode = lab.segValue('cp-mode');
    const kind = lab.get('cp-kernel');
    const delay = lab.byId('cp-delay')?.closest('.control');
    if (delay) delay.style.display = mode === 'corr' || kind === 'echo' ? '' : 'none';
  }
  lab.onChange('cp-kernel', () => { updateVisibility(); draw(); });
  ['cp-delay', 'cp-noise'].forEach((id) => lab.onInput(id, draw));
  updateVisibility();
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* DFT synthesis / analysis                                            */
/* ------------------------------------------------------------------ */

registerLab('dft', (el) => {
  const lab = mountLabShell(el, {
    title: 'Build a signal from DFT basis functions',
    intro: 'Construct a signal from one or two cosine components, then analyze it. The spectrum should show exactly the bins you used; reconstruction with a limited number of bins shows what “band-limiting” means.',
    plotCols: 2,
    controls: [
      { type: 'range', id: 'dft-k1', label: 'Component 1 bin', min: 0, max: 16, step: 1, value: 3, format: (v) => `k=${v}` },
      { type: 'range', id: 'dft-a1', label: 'Component 1 amplitude', min: 0, max: 1, step: 0.05, value: 1, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'dft-k2', label: 'Component 2 bin', min: 0, max: 16, step: 1, value: 7, format: (v) => `k=${v}` },
      { type: 'range', id: 'dft-a2', label: 'Component 2 amplitude', min: 0, max: 1, step: 0.05, value: 0.5, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'dft-phase', label: 'Component 2 phase', min: 0, max: 6.28, step: 0.1, value: 1.0, format: (v) => `${v.toFixed(1)} rad` },
      { type: 'range', id: 'dft-keep', label: 'Bins kept for synthesis', min: 1, max: 17, step: 1, value: 17, format: (v) => String(v) },
    ],
    plots: [
      { id: 'time', caption: 'Signal and truncated reconstruction', tall: true },
      { id: 'spec', caption: 'One-sided magnitude spectrum', tall: true },
    ],
    readouts: [
      { id: 'peaks', label: 'Strongest bins' },
      { id: 'err', label: 'Reconstruction RMS error' },
      { id: 'energy', label: 'Kept energy' },
    ],
    tasks: [
      'Set only component 1. How many nonzero bins do you expect, and why?',
      'Move component 1 to a non-integer bin by using a longer signal. What happens to the spectrum?',
      'Keep only the first few bins. Describe the reconstruction and relate it to an ideal low-pass filter.',
    ],
    note: 'The signal is N=32 samples; bins 0…16 are independent. The “bins kept” control zeroes bins above the limit before inverse transforming. The DFT is exact; reconstruction error comes only from discarding bins.',
  });
  const timePlot = lab.plot('time', { xLabel: 'sample n', yLabel: 'amplitude', legend: true });
  const specPlot = lab.plot('spec', { xLabel: 'frequency (cycles/sample)', yLabel: '|X|', legend: true });
  const N = 64;

  function draw() {
    const k1 = lab.get('dft-k1'), a1 = lab.get('dft-a1');
    const k2 = lab.get('dft-k2'), a2 = lab.get('dft-a2');
    const phase = lab.get('dft-phase');
    const keep = Math.min(33, lab.get('dft-keep'));
    const x = Array.from({ length: N }, (_, n) => a1 * Math.cos(2 * Math.PI * k1 * n / N) + a2 * Math.cos(2 * Math.PI * k2 * n / N + phase));
    const S = realDft(x);
    const re = S.re.map((v, k) => (k <= keep ? v : 0));
    const im = S.im.map((v, k) => (k <= keep ? v : 0));
    const y = inverseRealDft(re, im, N);
    const err = Math.sqrt(x.reduce((s, v, i) => s + (v - y[i]) ** 2, 0) / N);
    const peaks = S.mag.map((v, k) => ({ k, v })).sort((a, b) => b.v - a.v).slice(0, 3).filter((p) => p.v > 0.05).map((p) => `k=${p.k} (${(p.v / N * (p.k === 0 || p.k === N / 2 ? 1 : 2)).toFixed(2)})`).join(', ');
    const keptEnergy = re.reduce((s, v, k) => s + (v * v + im[k] * im[k]), 0);
    const totalEnergy = S.re.reduce((s, v, k) => s + (v * v + S.im[k] * S.im[k]), 0);
    timePlot.setData([
      { type: 'line', y: x, color: 'var(--muted)', width: 1.4, label: 'original' },
      { type: 'line', y: y, color: 'var(--accent)', width: 2, label: 'reconstruction', dash: [5, 3] },
    ], { xMin: 0, xMax: N - 1, yMin: Math.min(...x, ...y) - 0.15, yMax: Math.max(...x, ...y) + 0.15 });
    specPlot.setData([{ type: 'bars', x: S.freqs, y: S.mag.map((v) => v / N), color: 'var(--accent)', fill: 'var(--accent-soft)', label: '|X|/N' }], { xMin: 0, xMax: 0.5, yMin: 0 });
    lab.readouts({ peaks: peaks || '—', err: err.toFixed(4), energy: `${(100 * keptEnergy / (totalEnergy || 1)).toFixed(1)}%` });
  }
  ['dft-k1', 'dft-a1', 'dft-k2', 'dft-a2', 'dft-phase', 'dft-keep'].forEach((id) => lab.onInput(id, draw));
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* Spectral analysis and windows                                       */
/* ------------------------------------------------------------------ */

registerLab('spectrum', (el) => {
  const lab = mountLabShell(el, {
    title: 'Windows, leakage, and circular convolution',
    intro: 'Analyze a two-tone signal with different windows and record lengths. A bin-centered tone stays sharp; an off-bin tone leaks. Switch to fast-convolution mode and see why zero padding is mandatory.',
    plotCols: 2,
    controls: [
      { type: 'seg', id: 'spec-mode', label: 'Mode', value: 'spectrum', options: [{ value: 'spectrum', label: 'Spectrum' }, { value: 'conv', label: 'Fast convolution' }] },
      { type: 'select', id: 'spec-window', label: 'Window', value: 'rect', options: [{ value: 'rect', label: 'Rectangular' }, { value: 'hamming', label: 'Hamming' }, { value: 'hann', label: 'Hann' }, { value: 'blackman', label: 'Blackman' }] },
      { type: 'range', id: 'spec-n', label: 'Record length N', min: 32, max: 512, step: 32, value: 256, format: (v) => String(v) },
      { type: 'range', id: 'spec-f2', label: 'Second tone frequency', min: 0.05, max: 0.45, step: 0.001, value: 0.132, format: (v) => v.toFixed(3) },
      { type: 'check', id: 'spec-pad', label: 'Zero-pad before DFT', value: false },
    ],
    plots: [
      { id: 'time', caption: 'Windowed record', tall: true },
      { id: 'spec', caption: 'Magnitude spectrum (dB)', tall: true },
    ],
    readouts: [
      { id: 'res', label: 'Bin spacing' },
      { id: 'leak', label: 'Leakage at −20 bins' },
      { id: 'wrap', label: 'Convolution error' },
    ],
    tasks: [
      'Set the second tone to 0.132 with N=256. Is it exactly on a bin? Compare rectangular and Blackman windows.',
      'Increase N. Does the main lobe narrow? Does zero padding alone narrow it?',
      'Switch to fast convolution and turn padding off. Find the wraparound error at the start of the output.',
    ],
    note: 'Spectrum mode uses a single-tone-plus-leakage test; the second tone is deliberately off-bin. Convolution mode compares direct linear convolution with DFT circular convolution using a length-32 pulse and an 8-tap kernel.',
  });
  const timePlot = lab.plot('time', { xLabel: 'sample', yLabel: 'amplitude', legend: true });
  const specPlot = lab.plot('spec', { xLabel: 'frequency (cycles/sample)', yLabel: 'dB', legend: true });

  function draw() {
    const mode = lab.segValue('spec-mode');
    const winName = lab.get('spec-window');
    const N = lab.get('spec-n');
    const f2 = lab.get('spec-f2');
    const doPad = lab.get('spec-pad');
    if (mode === 'spectrum') {
      const x = Array.from({ length: N }, (_, n) => Math.cos(2 * Math.PI * 0.17 * n) + 0.7 * Math.cos(2 * Math.PI * f2 * n));
      const w = winName === 'rect' ? new Array(N).fill(1) : windowFunction(winName === 'hann' ? 'hann' : winName, N - 1).slice(0, N);
      const xw = x.map((v, i) => v * (w[i] || 1));
      const L = doPad ? nextPow2(N * 4) : N;
      const S = spectrum(pad(xw, L));
      const N2 = L;
      timePlot.setData([
        { type: 'line', y: x, color: 'var(--muted)', width: 1.1, label: 'signal' },
        { type: 'line', y: xw, color: 'var(--accent)', width: 1.7, label: 'windowed' },
      ], { xMin: 0, xMax: N - 1 });
      const db = S.mag.map((v) => 20 * Math.log10(Math.max(1e-9, v / Math.max(1e-9, Math.max(...S.mag)))));
      specPlot.setData([{ type: 'line', x: S.freqs, y: db, color: 'var(--accent)', width: 1.5, label: 'windowed spectrum' }], { xMin: 0, xMax: 0.5, yMin: -100, yMax: 5 });
      // leakage at about 20 bins away from the strong tone
      const bin = Math.round(0.17 * N2);
      const far = Math.min(db.length - 1, bin + 20);
      lab.readouts({ res: `${(1 / N).toFixed(5)} cycles/sample`, leak: `${db[far].toFixed(1)} dB`, wrap: '—' });
    } else {
      const x = Array.from({ length: 32 }, (_, i) => (i < 10 ? 1 : 0));
      const h = Array.from({ length: 8 }, (_, i) => Math.exp(-i / 3));
      const direct = convolve(x, h);
      const L = doPad ? nextPow2(x.length + h.length - 1) : 32;
      const X = realDft(pad(x, L)), H = realDft(pad(h, L));
      const re = X.re.map((v, k) => v * H.re[k] - X.im[k] * H.im[k]);
      const im = X.re.map((v, k) => v * H.im[k] + X.im[k] * H.re[k]);
      const circ = inverseRealDft(re, im, L);
      const err = direct.map((v, i) => v - (circ[i] || 0));
      timePlot.setData([
        { type: 'line', y: direct, color: 'var(--accent)', width: 2, label: 'direct linear' },
        { type: 'line', y: circ.slice(0, direct.length), color: 'var(--coral)', width: 1.5, label: 'DFT result', dash: [5, 3] },
      ], { xMin: 0, xMax: direct.length - 1, yMin: Math.min(-0.2, ...direct, ...circ) - 0.1, yMax: Math.max(1.2, ...direct, ...circ) + 0.1 });
      specPlot.setData([{ type: 'line', x: Array.from({ length: err.length }, (_, i) => i), y: err, color: 'var(--coral)', width: 1.5, label: 'error' }], { xMin: 0, xMax: err.length - 1 });
      lab.readouts({ res: `${L}-point DFT`, leak: '—', wrap: Math.max(...err.map(Math.abs)).toExponential(1) });
    }
  }
  lab.onSeg('spec-mode', () => { updateVisibility(); draw(); });
  function updateVisibility() {
    const spectrumMode = lab.segValue('spec-mode') === 'spectrum';
    const show = (id, on) => { const c = lab.byId(id)?.closest('.control'); if (c) c.style.display = on ? '' : 'none'; };
    show('spec-window', spectrumMode);
    show('spec-n', spectrumMode);
    show('spec-f2', spectrumMode);
    show('spec-pad', true);
  }
  ['spec-window', 'spec-n'].forEach((id) => lab.onChange(id, draw));
  ['spec-f2'].forEach((id) => lab.onInput(id, draw));
  lab.onChange('spec-pad', draw);
  updateVisibility();
  draw();
  return () => lab.destroy();
});
