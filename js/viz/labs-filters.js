/** Digital filter labs (chapters 14–21). */

import {
  windowedSinc, windowFunction, freqResponse, convolve, applyIir, impulseResponse,
  stepResponse, singlePole, cheby1Cutoff3, butterworth, poleZero, movingAverage,
  pad, nextPow2, fft, realDft, inverseRealDft, clamp, mean,
} from '../dsp.js';
import { mountLabShell, noise, fmt } from './lab-kit.js';
import { registerLab } from './lab-registry.js';

function normalized(h) {
  const s = h.reduce((a, b) => a + b, 0);
  return s ? h.map((v) => v / s) : h;
}
function designFIR(type, fc, bw, M, win = 'blackman') {
  const hLP = windowedSinc(M, fc, win);
  const c = Math.floor(hLP.length / 2);
  const delta = new Array(hLP.length).fill(0); delta[c] = 1;
  if (type === 'lowpass') return hLP;
  if (type === 'highpass') return delta.map((v, i) => v - hLP[i]);
  const f1 = Math.max(0.01, fc - bw / 2), f2 = Math.min(0.48, fc + bw / 2);
  const lp1 = windowedSinc(M, f1, win), lp2 = windowedSinc(M, f2, win);
  const bp = lp2.map((v, i) => v - lp1[i]);
  if (type === 'bandpass') return bp;
  return delta.map((v, i) => v - bp[i]);
}
function maxDb(h, lo, hi, n = 512) {
  const H = freqResponse(h, [1], n);
  let m = -Infinity;
  for (let i = 0; i < H.freq.length; i++) if (H.freq[i] >= lo && H.freq[i] <= hi) m = Math.max(m, H.db[i]);
  return m;
}
function overshoot(step) {
  return Math.max(0, Math.max(...step) - 1);
}
function groupDelayAt(b, a, f) {
  const df = 1e-4;
  const H1 = freqResponse(b, a, 2001);
  const idx = Math.round(f / 0.5 * 2000);
  const phase = H1.phase;
  const i0 = Math.max(1, idx - 1), i1 = Math.min(phase.length - 2, idx + 1);
  let d = phase[i1] - phase[i0];
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return -d / (2 * Math.PI * (H1.freq[i1] - H1.freq[i0]));
}

/* ------------------------------------------------------------------ */
/* 14. Filter introduction                                             */
/* ------------------------------------------------------------------ */

registerLab('filter-intro', (el) => {
  const lab = mountLabShell(el, {
    title: 'The filter design trade space',
    intro: 'Choose a response type, cutoff, bandwidth, and kernel length. Watch the magnitude, phase, and step response change together; there is no free lunch between sharpness, transient ringing, and delay.',
    plotCols: 3,
    controls: [
      { type: 'select', id: 'fi-type', label: 'Response', value: 'lowpass', options: [
        { value: 'lowpass', label: 'Low-pass' }, { value: 'highpass', label: 'High-pass' }, { value: 'bandpass', label: 'Band-pass' }, { value: 'bandreject', label: 'Band-reject' },
      ] },
      { type: 'range', id: 'fi-fc', label: 'Cutoff / center', min: 0.05, max: 0.45, step: 0.01, value: 0.2, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'fi-bw', label: 'Bandwidth (BP/BR)', min: 0.04, max: 0.2, step: 0.01, value: 0.1, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'fi-m', label: 'Kernel length M', min: 20, max: 300, step: 10, value: 100, format: (v) => String(v) },
      { type: 'select', id: 'fi-win', label: 'Window', value: 'blackman', options: [{ value: 'hamming', label: 'Hamming' }, { value: 'blackman', label: 'Blackman' }, { value: 'hann', label: 'Hann' }] },
    ],
    plots: [
      { id: 'mag', caption: 'Magnitude response (dB)', tall: true },
      { id: 'phase', caption: 'Phase and group delay', tall: true },
      { id: 'step', caption: 'Step response', tall: true },
    ],
    readouts: [
      { id: 'bw', label: 'Approx. transition' },
      { id: 'stop', label: 'Worst stopband' },
      { id: 'over', label: 'Step overshoot' },
      { id: 'gd', label: 'Group delay' },
    ],
    tasks: [
      'Increase M from 20 to 300. What happens to the transition, the ringing, and the delay?',
      'Switch from low-pass to high-pass. How does the step response change?',
      'Compare Hamming and Blackman at the same M. Which has a deeper stopband? Which rolls off faster?',
    ],
    note: 'FIR kernels are designed by windowed-sinc and spectral inversion. M is the kernel order; the group delay is approximately M/2 samples. The “worst stopband” is measured outside the transition region and is sensitive to the window and numerical precision.',
  });
  const magPlot = lab.plot('mag', { xLabel: 'frequency (cycles/sample)', yLabel: 'dB', legend: true, yMin: -120, yMax: 5 });
  const phasePlot = lab.plot('phase', { xLabel: 'frequency (cycles/sample)', yLabel: 'phase (rad)', legend: true });
  const stepPlot = lab.plot('step', { xLabel: 'sample', yLabel: 'amplitude', legend: true });

  function draw() {
    const type = lab.get('fi-type');
    const fc = lab.get('fi-fc');
    const bw = lab.get('fi-bw');
    const M = Math.round(lab.get('fi-m') / 2) * 2;
    const win = lab.get('fi-win');
    const h = designFIR(type, fc, bw, M, win);
    const H = freqResponse(h, [1], 800);
    const step = stepResponse(h, [1], 260);
    const idx = Math.min(H.freq.length - 1, Math.round(fc / 0.5 * (H.freq.length - 1)));
    const gd = groupDelayAt(h, [1], fc);
    let stopLo, stopHi;
    if (type === 'lowpass') { stopLo = fc + 4 / M; stopHi = 0.5; }
    else if (type === 'highpass') { stopLo = 0; stopHi = Math.max(0.01, fc - 4 / M); }
    else { stopLo = Math.max(0, fc + bw / 2 + 4 / M); stopHi = 0.5; }
    const stop = maxDb(h, stopLo, stopHi, 800);
    magPlot.setData([{ type: 'line', x: H.freq, y: H.db, color: 'var(--accent)', width: 1.8, label: type }], { xMin: 0, xMax: 0.5 });
    magPlot.setOverlays({ hlines: [{ y: -3.0103, label: '−3 dB', color: 'var(--coral)' }], vlines: [{ x: fc, label: 'cutoff', color: 'var(--coral)' }] });
    phasePlot.setData([{ type: 'line', x: H.freq, y: H.phase, color: 'var(--blue)', width: 1.6, label: 'phase' }], { xMin: 0, xMax: 0.5 });
    stepPlot.setData([
      { type: 'line', x: Array.from({ length: step.length }, (_, i) => i), y: step, color: 'var(--accent)', width: 2, label: 'step response' },
      { type: 'line', x: [0, step.length - 1], y: [0, 1], color: 'var(--muted)', width: 1, label: 'ideal', dash: [4, 3] },
    ], { xMin: 0, xMax: step.length - 1, yMin: -0.2, yMax: 1.4 });
    lab.readouts({ bw: `≈${(4 / M).toFixed(3)} fs`, stop: `${stop.toFixed(1)} dB`, over: `${(overshoot(step) * 100).toFixed(1)}%`, gd: `${gd.toFixed(1)} samples` });
  }
  ['fi-type', 'fi-win'].forEach((id) => lab.onChange(id, () => { if (id === 'fi-type') updateVisibility(); draw(); }));
  ['fi-fc', 'fi-bw', 'fi-m'].forEach((id) => lab.onInput(id, draw));
  function updateVisibility() {
    const type = lab.get('fi-type');
    const bw = lab.byId('fi-bw')?.closest('.control');
    if (bw) bw.style.display = ['bandpass', 'bandreject'].includes(type) ? '' : 'none';
  }
  updateVisibility();
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 15. Moving average                                                  */
/* ------------------------------------------------------------------ */

function maRecursive(x, M) {
  const y = new Array(x.length).fill(0);
  for (let n = 0; n < x.length; n++) {
    const prev = n > 0 ? y[n - 1] : 0;
    y[n] = prev + (x[n] - (n - M >= 0 ? x[n - M] : 0)) / M;
  }
  return y;
}

registerLab('moving-average', (el) => {
  const lab = mountLabShell(el, {
    title: 'Noise versus edge sharpness',
    intro: 'Add white noise to a pulse and filter it with one or more moving averages. Measure the output noise, the 0–100% rise time, and the sinc-shaped frequency response. The recursive mode is mathematically equivalent and O(1) per sample.',
    plotCols: 3,
    controls: [
      { type: 'range', id: 'ma-m', label: 'Window length M', min: 3, max: 101, step: 2, value: 21, format: (v) => String(v) },
      { type: 'range', id: 'ma-noise', label: 'Noise σ', min: 0, max: 0.5, step: 0.01, value: 0.2, format: (v) => fmt(v, 2) },
      { type: 'select', id: 'ma-signal', label: 'Signal', value: 'pulse', options: [{ value: 'pulse', label: 'Pulse' }, { value: 'ecg', label: 'ECG-like' }, { value: 'chirp', label: 'Chirp' }] },
      { type: 'range', id: 'ma-pass', label: 'Passes', min: 1, max: 4, step: 1, value: 1, format: (v) => String(v) },
      { type: 'check', id: 'ma-rec', label: 'Recursive implementation', value: false },
    ],
    plots: [
      { id: 'time', caption: 'Noisy input and filtered output', tall: true },
      { id: 'mag', caption: 'Frequency response (dB)', tall: true },
      { id: 'step', caption: 'Step response', tall: true },
    ],
    readouts: [
      { id: 'noise', label: 'Output noise σ' },
      { id: 'rise', label: 'Rise time' },
      { id: 'zero', label: 'First zero' },
      { id: 'diff', label: 'Recursive vs direct' },
    ],
    tasks: [
      'Double M. By what factor does the output noise fall? What happens to the edge width?',
      'Use two passes. Compare the kernel shape, step response, and stopband.',
      'Enable the recursive implementation. Verify that it matches direct convolution.',
    ],
    note: 'The recursive mode uses the causal running-sum form y[n]=y[n−1]+(x[n]−x[n−M])/M. The output noise is measured on a noise-only segment before the pulse. “Rise time” is the 0–100% width of the step response.',
  });
  const timePlot = lab.plot('time', { xLabel: 'sample', yLabel: 'amplitude', legend: true });
  const magPlot = lab.plot('mag', { xLabel: 'frequency (cycles/sample)', yLabel: 'dB', legend: true, yMin: -80, yMax: 5 });
  const stepPlot = lab.plot('step', { xLabel: 'sample', yLabel: 'amplitude', legend: true });
  const N = 300;

  function makeSignal() {
    const kind = lab.get('ma-signal');
    const base = Array.from({ length: N }, (_, i) => {
      if (kind === 'pulse') return i >= 120 && i < 160 ? 1 : 0;
      if (kind === 'ecg') {
        return 0.05 * Math.exp(-((i - 100) ** 2) / 4) - 0.25 * Math.exp(-((i - 108) ** 2) / 3) + 0.9 * Math.exp(-((i - 114) ** 2) / 8) - 0.35 * Math.exp(-((i - 122) ** 2) / 5) + 0.25 * Math.exp(-((i - 180) ** 2) / 35);
      }
      return Math.cos(2 * Math.PI * (0.02 + 0.0003 * i) * i);
    });
    const nz = noise(N, lab.get('ma-noise'), 23);
    return { base, x: base.map((v, i) => v + nz[i]) };
  }

  function draw() {
    const M = lab.get('ma-m');
    const passes = lab.get('ma-pass');
    const rec = lab.get('ma-rec');
    const { base, x } = makeSignal();
    let h = new Array(M).fill(1 / M);
    for (let p = 1; p < passes; p++) h = convolve(h, h);
    let y;
    let yDirect;
    if (rec) {
      y = x;
      for (let p = 0; p < passes; p++) y = maRecursive(y, M);
      yDirect = x;
      let hh = new Array(M).fill(1 / M);
      for (let p = 1; p < passes; p++) hh = convolve(hh, hh);
      yDirect = convolve(x, hh).slice(0, N);
    } else {
      y = convolve(x, h).slice(0, N);
      yDirect = y;
    }
    const yBase = convolve(base, h).slice(0, N);
    const diff = Math.max(...y.map((v, i) => Math.abs(v - yDirect[i])));
    timePlot.setData([
      { type: 'line', y: x, color: 'var(--muted)', width: 1, label: 'noisy input' },
      { type: 'line', y, color: 'var(--accent)', width: 2, label: 'filtered' },
    ], { xMin: 0, xMax: N - 1 });
    const H = freqResponse(h, [1], 600);
    magPlot.setData([{ type: 'line', x: H.freq, y: H.db, color: 'var(--accent)', width: 1.8, label: `${passes} pass${passes > 1 ? 'es' : ''}` }], { xMin: 0, xMax: 0.5 });
    const step = stepResponse(h, [1], 140);
    stepPlot.setData([{ type: 'line', x: Array.from({ length: step.length }, (_, i) => i), y: step, color: 'var(--accent)', width: 2, label: 'step' }], { xMin: 0, xMax: step.length - 1, yMin: 0, yMax: 1.2 });
    const noiseOnly = y.slice(10, 80).map((v, i) => v - yBase[i + 10]);
    const noiseOut = Math.sqrt(mean(noiseOnly.map((v) => v * v)));
    const riseIdx = step.findIndex((v) => v >= 0.99);
    const firstZero = 1 / h.length;
    lab.readouts({
      noise: noiseOut.toFixed(4),
      rise: `${riseIdx < 0 ? '—' : riseIdx} samples`,
      zero: `${firstZero.toFixed(3)} fs`,
      diff: rec ? diff.toExponential(1) : 'direct',
    });
  }
  ['ma-m', 'ma-noise', 'ma-pass'].forEach((id) => lab.onInput(id, draw));
  lab.onChange('ma-signal', draw);
  lab.onChange('ma-rec', draw);
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 16. Windowed-sinc                                                   */
/* ------------------------------------------------------------------ */

registerLab('windowed-sinc', (el) => {
  const lab = mountLabShell(el, {
    title: 'Design a windowed-sinc filter',
    intro: 'Set the cutoff and transition width. The kernel length follows M ≈ 4/BW; the window sets stopband depth. Inspect the kernel, the magnitude response in dB, and the step response.',
    plotCols: 3,
    controls: [
      { type: 'range', id: 'ws-fc', label: 'Cutoff fc', min: 0.03, max: 0.45, step: 0.01, value: 0.15, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'ws-bw', label: 'Transition BW', min: 0.01, max: 0.15, step: 0.005, value: 0.04, format: (v) => fmt(v, 3) },
      { type: 'select', id: 'ws-win', label: 'Window', value: 'blackman', options: [{ value: 'hamming', label: 'Hamming' }, { value: 'blackman', label: 'Blackman' }] },
      { type: 'check', id: 'ws-cascade', label: 'Cascade twice', value: false },
    ],
    plots: [
      { id: 'kernel', caption: 'Filter kernel h[i]', tall: true },
      { id: 'mag', caption: 'Magnitude response (dB)', tall: true },
      { id: 'step', caption: 'Step response', tall: true },
    ],
    readouts: [
      { id: 'm', label: 'Kernel length' },
      { id: 'stop', label: 'Stopband' },
      { id: 'ripple', label: 'Passband ripple' },
      { id: 'over', label: 'Overshoot' },
    ],
    tasks: [
      'Set BW=0.05. Verify the predicted M and measure the realized transition width.',
      'Compare Hamming and Blackman at the same M. Which is deeper? Which is sharper?',
      'Cascade the filter. How much does the stopband improve, and what happens to the transition?',
    ],
    note: 'M is rounded to an even integer and capped at 400. The cutoff is the 50% amplitude point. “Stopband” is the maximum response from fc+BW to Nyquist; passband ripple is the max−min dB below fc−BW/2.',
  });
  const kernelPlot = lab.plot('kernel', { xLabel: 'kernel index i', yLabel: 'h[i]' });
  const magPlot = lab.plot('mag', { xLabel: 'frequency (cycles/sample)', yLabel: 'dB', yMin: -140, yMax: 5 });
  const stepPlot = lab.plot('step', { xLabel: 'sample', yLabel: 'amplitude' });

  function draw() {
    const fc = lab.get('ws-fc');
    const bw = lab.get('ws-bw');
    const win = lab.get('ws-win');
    const cascade = lab.get('ws-cascade');
    const M = Math.min(400, Math.max(2, Math.round(4 / bw / 2) * 2));
    let h = windowedSinc(M, fc, win);
    if (cascade) h = convolve(h, h);
    const H = freqResponse(h, [1], 1200);
    const step = stepResponse(h, [1], 320);
    kernelPlot.setData([{ type: 'line', x: Array.from({ length: h.length }, (_, i) => i), y: h, color: 'var(--accent)', width: 1.5, label: 'h[i]' }], { xMin: 0, xMax: h.length - 1 });
    magPlot.setData([{ type: 'line', x: H.freq, y: H.db, color: 'var(--accent)', width: 1.8, label: '|H(f)|' }], { xMin: 0, xMax: 0.5 });
    magPlot.setOverlays({ hlines: [{ y: -6.0206, label: '50%', color: 'var(--coral)' }], vlines: [{ x: fc, label: 'fc', color: 'var(--coral)' }] });
    stepPlot.setData([{ type: 'line', x: Array.from({ length: step.length }, (_, i) => i), y: step, color: 'var(--accent)', width: 2, label: 'step' }], { xMin: 0, xMax: step.length - 1, yMin: -0.2, yMax: 1.4 });
    let stop = -Infinity;
    for (let i = 0; i < H.freq.length; i++) if (H.freq[i] >= fc + bw && H.freq[i] <= 0.5) stop = Math.max(stop, H.db[i]);
    let pmin = Infinity, pmax = -Infinity;
    for (let i = 0; i < H.freq.length; i++) if (H.freq[i] <= Math.max(0, fc - bw / 2)) { pmin = Math.min(pmin, H.db[i]); pmax = Math.max(pmax, H.db[i]); }
    lab.readouts({ m: `${M} (${h.length} taps)`, stop: `${stop.toFixed(1)} dB`, ripple: `${(pmax - pmin).toFixed(2)} dB`, over: `${(overshoot(step) * 100).toFixed(1)}%` });
  }
  ['ws-fc', 'ws-bw'].forEach((id) => lab.onInput(id, draw));
  ['ws-win', 'ws-cascade'].forEach((id) => lab.onChange(id, draw));
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 17. Custom filters + deconvolution                                  */
/* ------------------------------------------------------------------ */

registerLab('custom-filter', (el) => {
  const lab = mountLabShell(el, {
    title: 'Draw a response, get a filter—and try to invert a blur',
    intro: 'In design mode, sample a desired magnitude response, inverse-transform it, and window the kernel. In deconvolution mode, inverse-filter a known blur with regularization and watch noise amplification trade against restoration.',
    plotCols: 2,
    controls: [
      { type: 'seg', id: 'cf-mode', label: 'Mode', value: 'design', options: [{ value: 'design', label: 'Design' }, { value: 'deconv', label: 'Deconvolution' }] },
      { type: 'select', id: 'cf-desired', label: 'Desired response', value: 'lowpass', options: [{ value: 'lowpass', label: 'Low-pass' }, { value: 'bandpass', label: 'Band-pass' }, { value: 'twoband', label: 'Two bands' }] },
      { type: 'range', id: 'cf-f1', label: 'Edge 1', min: 0.04, max: 0.4, step: 0.01, value: 0.15, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'cf-f2', label: 'Edge 2', min: 0.1, max: 0.46, step: 0.01, value: 0.32, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'cf-m', label: 'Kernel length M', min: 17, max: 257, step: 8, value: 81, format: (v) => String(v) },
      { type: 'range', id: 'cf-lambda', label: 'Regularization λ', min: 0.0001, max: 0.1, step: 0.0001, value: 0.004, format: (v) => v.toExponential(1) },
    ],
    plots: [
      { id: 'p1', caption: 'Desired vs realized / signals', tall: true },
      { id: 'p2', caption: 'Kernel / inverse-filter gain', tall: true },
    ],
    readouts: [
      { id: 'm', label: 'Kernel length' },
      { id: 'err', label: 'Response error / MSE' },
      { id: 'stop', label: 'Stopband / noise gain' },
    ],
    tasks: [
      'Design a low-pass with a sharp edge. Increase M. What happens to the ringing?',
      'Switch to two bands and inspect the kernel. Why is it not sparse?',
      'In deconvolution mode, raise λ. Which improves: noise suppression or sharpness?',
    ],
    note: 'Design mode uses frequency sampling with a zero-phase desired response, then a causal shift and window. Deconvolution mode uses a Gaussian blur, additive noise, and the regularized inverse H=G*/(|G|²+λ). The MSE is computed against the known original.',
  });
  const p1 = lab.plot('p1', { xLabel: 'frequency / sample', yLabel: 'dB / amplitude', legend: true });
  const p2 = lab.plot('p2', { xLabel: 'index / frequency', yLabel: 'amplitude', legend: true });
  const N = 256;

  function desiredResponse() {
    const kind = lab.get('cf-desired');
    const f1 = lab.get('cf-f1'), f2 = Math.max(f1 + 0.02, lab.get('cf-f2'));
    const re = new Array(N / 2 + 1).fill(0);
    for (let k = 0; k < re.length; k++) {
      const f = k / N;
      if (kind === 'lowpass') re[k] = f <= f1 ? 1 : 0;
      else if (kind === 'bandpass') re[k] = f >= f1 && f <= f2 ? 1 : 0;
      else re[k] = (f >= 0.06 && f <= f1) || (f >= f2 && f <= 0.45) ? 1 : 0;
    }
    return re;
  }

  function designKernel() {
    const desired = desiredResponse();
    const fullRe = new Array(N).fill(0), fullIm = new Array(N).fill(0);
    for (let k = 0; k < desired.length; k++) { fullRe[k] = desired[k]; if (k > 0 && k < N / 2) fullRe[N - k] = desired[k]; }
    const x = realDftInverse(fullRe, fullIm, N);
    const M = Math.round(lab.get('cf-m') / 2) * 2 + 1;
    const h = new Array(M).fill(0);
    const c = Math.floor(M / 2);
    for (let i = 0; i < M; i++) {
      const idx = ((i - c) % N + N) % N;
      h[i] = x[idx] * (0.54 - 0.46 * Math.cos(2 * Math.PI * i / (M - 1)));
    }
    // normalize passband/DC gain
    const sum = h.reduce((a, b) => a + b, 0);
    const Hdes = desired[0];
    if (Math.abs(sum) > 1e-9) for (let i = 0; i < M; i++) h[i] *= Hdes / sum;
    return { h, desired, M };
  }
  function realDftInverse(re, im, n) {
    const X = { re, im };
    // use inverseRealDft for one-sided spectra; here re is full symmetric
    const out = new Array(n).fill(0);
    for (let k = 0; k < n; k++) {
      let s = 0;
      for (let m = 0; m < n; m++) s += re[m] * Math.cos(2 * Math.PI * k * m / n) - im[m] * Math.sin(2 * Math.PI * k * m / n);
      out[k] = s / n;
    }
    return out;
  }

  let orig = null, blurred = null;
  function makeDeconv() {
    const n = 256;
    const x = Array.from({ length: n }, (_, i) => (i > 40 && i < 52 ? 1 : 0) + (i > 120 && i < 124 ? 0.7 : 0) + 0.1 * Math.sin(i * 0.31));
    const sigma = 4;
    const g = Array.from({ length: 41 }, (_, i) => Math.exp(-((i - 20) ** 2) / (2 * sigma * sigma)));
    const gs = g.reduce((a, b) => a + b, 0);
    const gN = g.map((v) => v / gs);
    const y = convolve(x, gN).slice(0, n);
    const nz = noise(n, 0.03, 9);
    const yN = y.map((v, i) => v + nz[i]);
    return { x, y: yN, g: gN };
  }
  function dft1(x) { return realDftLocal(x); }
  function realDftLocal(x) {
    const N = x.length;
    const re = new Array(N).fill(0), im = new Array(N).fill(0);
    for (let k = 0; k < N; k++) {
      let sr = 0, si = 0;
      for (let n = 0; n < N; n++) { const a = -2 * Math.PI * k * n / N; sr += x[n] * Math.cos(a); si += x[n] * Math.sin(a); }
      re[k] = sr; im[k] = si;
    }
    return { re, im };
  }

  function draw() {
    const mode = lab.segValue('cf-mode');
    const lambda = lab.get('cf-lambda');
    if (mode === 'design') {
      const { h, desired, M } = designKernel();
      const H = freqResponse(h, [1], 600);
      p1.setData([
        { type: 'line', x: desired.map((_, k) => k / N), y: desired.map((v) => 20 * Math.log10(Math.max(1e-6, v))), color: 'var(--muted)', width: 1.2, label: 'desired', dash: [4, 3] },
        { type: 'line', x: H.freq, y: H.db, color: 'var(--accent)', width: 1.8, label: 'realized' },
      ], { xMin: 0, xMax: 0.5, yMin: -100, yMax: 5 });
      p2.setData([{ type: 'line', x: Array.from({ length: h.length }, (_, i) => i), y: h, color: 'var(--accent)', width: 1.5, label: 'kernel h[i]' }], { xMin: 0, xMax: h.length - 1 });
      const err = Math.sqrt(desired.reduce((s, v, k) => {
        const idx = Math.min(H.db.length - 1, Math.round((k / N) / 0.5 * (H.db.length - 1)));
        const target = v ? 0 : -80;
        return s + (Math.min(0, H.db[idx]) - target) ** 2;
      }, 0) / desired.length);
      const kind = lab.get('cf-desired');
      let stop = -Infinity;
      if (kind === 'lowpass') for (let i = 0; i < H.freq.length; i++) if (H.freq[i] > lab.get('cf-f1') + 0.05) stop = Math.max(stop, H.db[i]);
      lab.readouts({ m: `${M} taps`, err: err.toFixed(1), stop: Number.isFinite(stop) ? `${stop.toFixed(1)} dB` : '—' });
    } else {
      const { x, y, g } = makeDeconv();
      const N2 = 256;
      const Y = realDftLocal(y);
      const G = realDftLocal(pad(g, N2));
      const Hre = new Array(N2).fill(0), Him = new Array(N2).fill(0);
      for (let k = 0; k < N2; k++) {
        const den = G.re[k] ** 2 + G.im[k] ** 2 + lambda;
        Hre[k] = (G.re[k] * Y.re[k] + G.im[k] * Y.im[k]) / den;
        Him[k] = (G.re[k] * Y.im[k] - G.im[k] * Y.re[k]) / den;
      }
      // inverse DFT of H*Y
      const rec = new Array(N2).fill(0);
      for (let n = 0; n < N2; n++) {
        let s = 0;
        for (let k = 0; k < N2; k++) { const a = 2 * Math.PI * k * n / N2; s += Hre[k] * Math.cos(a) - Him[k] * Math.sin(a); }
        rec[n] = s / N2;
      }
      p1.setData([
        { type: 'line', y: x, color: 'var(--muted)', width: 1.1, label: 'original' },
        { type: 'line', y, color: 'var(--coral)', width: 1.2, label: 'blurred + noise' },
        { type: 'line', y: rec, color: 'var(--accent)', width: 1.7, label: 'recovered' },
      ], { xMin: 0, xMax: N2 - 1 });
      const gain = Array.from({ length: N2 / 2 + 1 }, (_, k) => {
        const den = G.re[k] ** 2 + G.im[k] ** 2 + lambda;
        return Math.hypot(G.re[k] / den, G.im[k] / den);
      });
      p2.setData([{ type: 'line', x: gain.map((_, k) => k / N2), y: gain, color: 'var(--blue)', width: 1.5, label: '|H_inv|' }], { xMin: 0, xMax: 0.5, yMin: 0 });
      const mse = x.reduce((s, v, i) => s + (v - rec[i]) ** 2, 0) / N2;
      const ng = Math.max(...gain);
      lab.readouts({ m: '—', err: mse.toExponential(2), stop: `${ng.toFixed(1)}× noise gain` });
    }
  }
  lab.onSeg('cf-mode', () => { updateVisibility(); draw(); });
  function updateVisibility() {
    const mode = lab.segValue('cf-mode');
    const desired = lab.get('cf-desired');
    const show = (id, on) => { const c = lab.byId(id)?.closest('.control'); if (c) c.style.display = on ? '' : 'none'; };
    show('cf-desired', mode === 'design');
    show('cf-f1', mode === 'design');
    show('cf-f2', mode === 'design' && desired !== 'lowpass');
    show('cf-m', mode === 'design');
    show('cf-lambda', mode === 'deconv');
  }
  ['cf-f1', 'cf-f2', 'cf-m', 'cf-lambda'].forEach((id) => lab.onInput(id, draw));
  lab.onChange('cf-desired', () => { updateVisibility(); draw(); });
  updateVisibility();
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 18. FFT convolution                                                 */
/* ------------------------------------------------------------------ */

registerLab('fft-convolution', (el) => {
  const lab = mountLabShell(el, {
    title: 'Overlap-add, block by block',
    intro: 'Partition a long signal, convolve each block with a kernel, and add the overlapping tails. Compare direct and FFT block processing; turn padding off to see circular wraparound corrupt the result.',
    plotCols: 2,
    controls: [
      { type: 'range', id: 'fc-block', label: 'Block size L', min: 16, max: 256, step: 16, value: 128, format: (v) => String(v) },
      { type: 'range', id: 'fc-m', label: 'Kernel length M', min: 8, max: 64, step: 8, value: 32, format: (v) => String(v) },
      { type: 'check', id: 'fc-fft', label: 'Use FFT per block', value: true },
      { type: 'check', id: 'fc-pad', label: 'Zero-pad to L+M−1', value: true },
    ],
    plots: [
      { id: 'time', caption: 'Reference vs block convolution', tall: true },
      { id: 'err', caption: 'Error (log scale)', tall: true },
    ],
    readouts: [
      { id: 'blocks', label: 'Blocks' },
      { id: 'fftlen', label: 'FFT length' },
      { id: 'err', label: 'Max error' },
      { id: 'ops', label: 'Approx. cost' },
    ],
    tasks: [
      'Set L=64, M=32, padding on. Compare the block result with direct convolution.',
      'Turn padding off. Where does the error appear, and why?',
      'Increase L. How does the number of blocks and the latency change?',
    ],
    note: 'The reference is full linear convolution. Each block is convolved with the fixed kernel and overlap-added. With padding off, the per-block FFT length is the next power of two ≥L, which may be shorter than L+M−1 and causes circular wraparound.',
  });
  const timePlot = lab.plot('time', { xLabel: 'sample', yLabel: 'amplitude', legend: true });
  const errPlot = lab.plot('err', { xLabel: 'sample', yLabel: '|error|', yLog: true });
  const N = 512;

  function draw() {
    const L = lab.get('fc-block');
    const M = lab.get('fc-m');
    const useFFT = lab.get('fc-fft');
    const doPad = lab.get('fc-pad');
    const x = Array.from({ length: N }, (_, i) => Math.sin(2 * Math.PI * 0.013 * i) + 0.6 * Math.cos(2 * Math.PI * 0.061 * i));
    const h = Array.from({ length: M }, (_, i) => Math.exp(-i / 8) * (0.7 + 0.3 * Math.sin(2 * Math.PI * i / M)));
    const ref = convolve(x, h);
    const blocks = [];
    let out = new Array(ref.length).fill(0);
    for (let start = 0; start < N; start += L) {
      const block = x.slice(start, start + L);
      let conv;
      if (!useFFT) conv = convolve(block, h);
      else {
        const minLen = doPad ? L + h.length - 1 : L;
        const Lfft = nextPow2(Math.max(2, minLen));
        const A = fft(pad(block, Lfft));
        const B = fft(pad(h, Lfft));
        const re = A.re.map((v, k) => v * B.re[k] - A.im[k] * B.im[k]);
        const im = A.re.map((v, k) => v * B.im[k] + A.im[k] * B.re[k]);
        conv = fft(re, im, true).re.slice(0, L + h.length - 1);
      }
      blocks.push({ start, conv });
      for (let i = 0; i < conv.length; i++) out[start + i] += conv[i];
    }
    out = out.slice(0, ref.length);
    const err = ref.map((v, i) => Math.abs(v - out[i]));
    const maxErr = Math.max(...err);
    const showN = Math.min(320, ref.length);
    timePlot.setData([
      { type: 'line', x: Array.from({ length: showN }, (_, i) => i), y: ref.slice(0, showN), color: 'var(--muted)', width: 1.2, label: 'direct linear' },
      { type: 'line', x: Array.from({ length: showN }, (_, i) => i), y: out.slice(0, showN), color: 'var(--accent)', width: 1.8, label: 'block result' },
    ], { xMin: 0, xMax: showN - 1 });
    timePlot.setOverlays({ markers: blocks.filter((b) => b.start < showN).map((b) => ({ type: 'point', x: b.start, y: ref[b.start] || 0, r: 3, color: 'var(--coral)', label: '' })) });
    errPlot.setData([{ type: 'line', x: Array.from({ length: showN }, (_, i) => i), y: err.slice(0, showN).map((v) => Math.max(1e-18, v)), color: 'var(--coral)', width: 1.4, label: '|error|' }], { xMin: 0, xMax: showN - 1, yLog: true, yMin: 1e-18, yMax: Math.max(1e-9, maxErr) });
    const Lfft = nextPow2(Math.max(2, doPad ? L + M - 1 : L));
    lab.readouts({
      blocks: String(blocks.length),
      fftlen: useFFT ? String(Lfft) : 'direct',
      err: maxErr.toExponential(1),
      ops: useFFT ? `≈${(blocks.length * 3 * Lfft * Math.log2(Lfft) / N).toFixed(0)}/sample` : `${M}/sample`,
    });
  }
  function realDftLocal(x) {
    const N = x.length, re = new Array(N).fill(0), im = new Array(N).fill(0);
    for (let k = 0; k < N; k++) { let sr = 0, si = 0; for (let n = 0; n < N; n++) { const a = -2 * Math.PI * k * n / N; sr += x[n] * Math.cos(a); si += x[n] * Math.sin(a); } re[k] = sr; im[k] = si; }
    return { re, im };
  }
  function inverseLocal(re, im, n) {
    const out = new Array(n).fill(0);
    for (let k = 0; k < n; k++) { let s = 0; for (let m = 0; m < n; m++) { const a = 2 * Math.PI * k * m / n; s += re[m] * Math.cos(a) - im[m] * Math.sin(a); } out[k] = s / n; }
    return out;
  }
  ['fc-block', 'fc-m'].forEach((id) => lab.onInput(id, draw));
  ['fc-fft', 'fc-pad'].forEach((id) => lab.onChange(id, draw));
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 19. Recursive filters                                               */
/* ------------------------------------------------------------------ */

registerLab('recursive', (el) => {
  const lab = mountLabShell(el, {
    title: 'Single-pole filters and stability',
    intro: 'Design a single-pole low-pass or high-pass, or take manual control of the pole. Inspect the impulse response, frequency response, and step response. Move the pole outside the unit circle to see instability.',
    plotCols: 3,
    controls: [
      { type: 'select', id: 'rec-type', label: 'Filter', value: 'lowpass', options: [{ value: 'lowpass', label: 'Single-pole low-pass' }, { value: 'highpass', label: 'Single-pole high-pass' }] },
      { type: 'range', id: 'rec-fc', label: 'Cutoff fc', min: 0.005, max: 0.3, step: 0.005, value: 0.05, format: (v) => v.toFixed(3) },
      { type: 'check', id: 'rec-manual', label: 'Manual pole', value: false },
      { type: 'range', id: 'rec-r', label: 'Pole radius |p|', min: 0.5, max: 1.05, step: 0.005, value: 0.9, format: (v) => v.toFixed(3) },
    ],
    plots: [
      { id: 'imp', caption: 'Impulse response (first 100 samples)', tall: true },
      { id: 'mag', caption: 'Magnitude response (dB)', tall: true },
      { id: 'step', caption: 'Step response', tall: true },
    ],
    readouts: [
      { id: 'x', label: 'Decay x / pole' },
      { id: 'tau', label: 'Time constant' },
      { id: 'cut', label: 'Measured −3 dB' },
      { id: 'stable', label: 'Stability' },
    ],
    tasks: [
      'At fc=0.05, measure the time constant from the impulse response and compare with −1/ln x.',
      'Enable manual pole and raise the radius past 1. What happens to the impulse response?',
      'Compare the low-pass and high-pass step responses. Why does the high-pass decay to zero?',
    ],
    note: 'Designed mode uses x=e^{−2πfc}. Manual mode sets a real pole at radius r with a normalized feedforward coefficient. The measured −3 dB point is found by scanning the frequency response; the theoretical formula is approximate.',
  });
  const impPlot = lab.plot('imp', { xLabel: 'sample', yLabel: 'h[n]' });
  const magPlot = lab.plot('mag', { xLabel: 'frequency (cycles/sample)', yLabel: 'dB', yMin: -60, yMax: 10 });
  const stepPlot = lab.plot('step', { xLabel: 'sample', yLabel: 'amplitude' });
  const n = 100;

  function draw() {
    const type = lab.get('rec-type');
    const fc = lab.get('rec-fc');
    const manual = lab.get('rec-manual');
    const r = lab.get('rec-r');
    let b, a, x, pole;
    if (manual) {
      pole = { re: r, im: 0 };
      x = clamp(r, 0, 1.2);
      if (type === 'lowpass') { b = [1 - r]; a = [1, -r]; }
      else { b = [(1 + r) / 2, -(1 + r) / 2]; a = [1, -r]; }
    } else {
      ({ b, a, x } = singlePole(fc, type));
      pole = { re: x, im: 0 };
    }
    const imp = applyIir([1, ...new Array(n - 1).fill(0)], b, a).map((v) => (Number.isFinite(v) ? v : 0));
    const step = applyIir(new Array(n).fill(1), b, a).map((v) => (Number.isFinite(v) ? v : 0));
    const H = freqResponse(b, a, 800);
    const lim = Math.max(1e-6, Math.min(1e6, Math.max(1, ...imp.map(Math.abs))));
    impPlot.setData([{ type: 'line', x: Array.from({ length: n }, (_, i) => i), y: imp.map((v) => clamp(v, -lim, lim)), color: 'var(--accent)', width: 1.8, label: 'h[n]' }], { xMin: 0, xMax: n - 1 });
    magPlot.setData([{ type: 'line', x: H.freq, y: H.db, color: 'var(--accent)', width: 1.8, label: '|H|' }], { xMin: 0, xMax: 0.5 });
    stepPlot.setData([{ type: 'line', x: Array.from({ length: n }, (_, i) => i), y: step.map((v) => clamp(v, -lim, lim)), color: 'var(--accent)', width: 1.8, label: 'step' }], { xMin: 0, xMax: n - 1 });
    const tau = x > 0 && x < 1 ? -1 / Math.log(x) : Infinity;
    const stable = Math.abs(pole.re) < 1;
    let cut = '—';
    for (let i = 1; i < H.db.length; i++) if (H.db[i] <= -3.0103 && H.db[i - 1] > -3.0103) { cut = H.freq[i].toFixed(3); break; }
    lab.readouts({ x: `${x.toFixed(3)} (p=${pole.re.toFixed(3)})`, tau: Number.isFinite(tau) ? `${tau.toFixed(1)} samples` : '—', cut: cut === '—' ? '—' : `${cut} fs`, stable: stable ? 'stable' : 'UNSTABLE' });
  }
  lab.onChange('rec-type', draw);
  lab.onChange('rec-manual', () => {
    const man = lab.get('rec-manual');
    const fc = lab.byId('rec-fc')?.closest('.control');
    const rr = lab.byId('rec-r')?.closest('.control');
    if (fc) fc.style.display = man ? 'none' : '';
    if (rr) rr.style.display = man ? '' : 'none';
    draw();
  });
  ['rec-fc', 'rec-r'].forEach((id) => lab.onInput(id, draw));
  lab.byId('rec-r')?.closest('.control') && (lab.byId('rec-r').closest('.control').style.display = 'none');
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 20. Chebyshev                                                       */
/* ------------------------------------------------------------------ */

registerLab('chebyshev', (el) => {
  const lab = mountLabShell(el, {
    title: 'Ripple, order, and overshoot',
    intro: 'Design a Chebyshev type-I filter with adjustable order, ripple, and cutoff. Compare it with Butterworth, inspect the poles inside the unit circle, and measure the step-response overshoot.',
    plotCols: 3,
    controls: [
      { type: 'seg', id: 'cheb-type', label: 'Response', value: 'lp', options: [{ value: 'lp', label: 'Low-pass' }, { value: 'hp', label: 'High-pass' }] },
      { type: 'range', id: 'cheb-order', label: 'Order (even)', min: 2, max: 10, step: 2, value: 4, format: (v) => String(v) },
      { type: 'range', id: 'cheb-ripple', label: 'Passband ripple', min: 0.1, max: 3, step: 0.1, value: 0.5, format: (v) => `${v.toFixed(1)} dB` },
      { type: 'range', id: 'cheb-fc', label: 'Cutoff (−3 dB)', min: 0.05, max: 0.4, step: 0.01, value: 0.2, format: (v) => fmt(v, 2) },
      { type: 'check', id: 'cheb-compare', label: 'Overlay Butterworth', value: true },
    ],
    plots: [
      { id: 'mag', caption: 'Magnitude response (dB)', tall: true },
      { id: 'step', caption: 'Step response', tall: true },
      { id: 'pz', caption: 'Pole-zero plot (unit circle)', tall: true },
    ],
    readouts: [
      { id: 'dc', label: 'DC / Nyquist gain' },
      { id: 'over', label: 'Step overshoot' },
      { id: 'pole', label: 'Max |pole|' },
      { id: 'order', label: 'Asymptotic roll-off' },
    ],
    tasks: [
      'Lower the ripple toward 0.1 dB and compare with Butterworth. What do you lose in roll-off?',
      'Increase order at fixed cutoff. What happens to overshoot and pole radius?',
      'Push order to 10 at fc=0.05. Do the poles stay inside the unit circle?',
    ],
    note: 'Filters are designed at the −3 dB cutoff (Smith’s convention). Even-order Chebyshev filters have DC gain −ripple after max-passband normalization. The pole-zero plot is computed numerically; coefficient precision is double.',
  });
  const magPlot = lab.plot('mag', { xLabel: 'frequency (cycles/sample)', yLabel: 'dB', legend: true, yMin: -100, yMax: 5 });
  const stepPlot = lab.plot('step', { xLabel: 'sample', yLabel: 'amplitude', legend: true });
  const pzCanvas = lab.byId(`${lab.id}-pz`);

  function hpFromLp(b, a) {
    return { b: b.map((v, k) => v * (-1) ** k), a: a.map((v, k) => v * (-1) ** k) };
  }

  function drawPZ(b, a) {
    if (!pzCanvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = pzCanvas.clientWidth || 260, h = pzCanvas.clientHeight || 190;
    pzCanvas.width = Math.round(w * dpr); pzCanvas.height = Math.round(h * dpr);
    const ctx = pzCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = (v, f) => getComputedStyle(pzCanvas).getPropertyValue(v).trim() || f;
    const ink = css('--ink', '#1b2430'), border = css('--border', '#ddd5c6'), accent = css('--accent', '#0e6b62'), coral = css('--coral', '#c2410c'), muted = css('--muted', '#66717d');
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.38;
    ctx.strokeStyle = border; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(12, cy); ctx.lineTo(w - 12, cy); ctx.moveTo(cx, 10); ctx.lineTo(cx, h - 10); ctx.stroke();
    ctx.strokeStyle = muted; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    const { poles, zeros } = poleZero(b, a);
    const plot = (p, color, isPole) => {
      const x = cx + p.re * R, y = cy - p.im * R;
      ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2;
      if (isPole) { ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.stroke(); }
    };
    zeros.forEach((p) => plot(p, accent, false));
    poles.forEach((p) => plot(p, coral, true));
    ctx.fillStyle = ink; ctx.font = '10px "Segoe UI", system-ui, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('× pole', 8, 14); ctx.fillStyle = accent; ctx.fillText('○ zero', 8, 27);
    ctx.fillStyle = muted; ctx.textAlign = 'center'; ctx.fillText('Re', w - 20, cy + 12); ctx.fillText('Im', cx + 12, 12);
    pzCanvas.setAttribute('aria-label', `Pole-zero plot. Poles: ${poles.map((p) => `${p.re.toFixed(2)} plus j ${p.im.toFixed(2)}`).join('; ')}. Zeros: ${zeros.map((p) => `${p.re.toFixed(2)} plus j ${p.im.toFixed(2)}`).join('; ')}`);
  }

  function draw() {
    const type = lab.segValue('cheb-type');
    const n = lab.get('cheb-order');
    const ripple = lab.get('cheb-ripple');
    const fc = lab.get('cheb-fc');
    const compare = lab.get('cheb-compare');
    let { b, a } = cheby1Cutoff3(n, ripple, type === 'hp' ? 0.5 - fc : fc);
    if (type === 'hp') ({ b, a } = hpFromLp(b, a));
    const H = freqResponse(b, a, 1000);
    const step = applyIir(new Array(160).fill(1), b, a).map((v) => (Number.isFinite(v) ? v : 0));
    const series = [{ type: 'line', x: H.freq, y: H.db, color: 'var(--accent)', width: 1.8, label: `Chebyshev (n=${n})` }];
    if (compare) {
      let bw = butterworth(n, type === 'hp' ? 0.5 - fc : fc);
      if (type === 'hp') bw = hpFromLp(bw.b, bw.a);
      const HB = freqResponse(bw.b, bw.a, 1000);
      series.push({ type: 'line', x: HB.freq, y: HB.db, color: 'var(--muted)', width: 1.2, label: 'Butterworth', dash: [4, 3] });
    }
    magPlot.setData(series, { xMin: 0, xMax: 0.5 });
    stepPlot.setData([{ type: 'line', x: Array.from({ length: step.length }, (_, i) => i), y: step, color: 'var(--accent)', width: 2, label: 'step' }], { xMin: 0, xMax: step.length - 1 });
    drawPZ(b, a);
    const { poles } = poleZero(b, a);
    const maxPole = Math.max(...poles.map((p) => Math.hypot(p.re, p.im)));
    const gain = type === 'lp' ? H.db[0] : H.db[H.db.length - 1];
    lab.readouts({
      dc: `${gain.toFixed(2)} dB`,
      over: `${(overshoot(step) * 100).toFixed(1)}%`,
      pole: maxPole.toFixed(3),
      order: `≈${6 * n} dB/octave`,
    });
  }
  lab.onSeg('cheb-type', draw);
  ['cheb-order', 'cheb-ripple', 'cheb-fc'].forEach((id) => lab.onInput(id, draw));
  lab.onChange('cheb-compare', draw);
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 21. Filter comparison                                               */
/* ------------------------------------------------------------------ */

registerLab('filter-compare', (el) => {
  const lab = mountLabShell(el, {
    title: 'Four filters, one specification',
    intro: 'Apply a moving average, single-pole, windowed-sinc, and Chebyshev filter at the same cutoff. Compare magnitude, step response, phase, and cost. There is no universal winner—only a best fit.',
    plotCols: 2,
    controls: [
      { type: 'range', id: 'cmp-fc', label: 'Cutoff', min: 0.05, max: 0.3, step: 0.01, value: 0.12, format: (v) => fmt(v, 2) },
      { type: 'select', id: 'cmp-highlight', label: 'Highlight', value: 'sinc', options: [
        { value: 'ma', label: 'Moving average' }, { value: 'pole', label: 'Single pole' }, { value: 'sinc', label: 'Windowed-sinc' }, { value: 'cheb', label: 'Chebyshev' },
      ] },
    ],
    plots: [
      { id: 'mag', caption: 'Magnitude response (dB)', tall: true },
      { id: 'step', caption: 'Step response', tall: true },
    ],
    readouts: [
      { id: 'filter', label: 'Highlighted filter' },
      { id: 'trans', label: 'Transition (−3 → −40 dB)' },
      { id: 'over', label: 'Overshoot' },
      { id: 'cost', label: 'Cost / sample' },
    ],
    tasks: [
      'At the same cutoff, which filter has the sharpest transition? Which has the least overshoot?',
      'Which filter is linear phase? How can you tell from the step response?',
      'Which would you choose for a battery-powered sensor with a 1 Hz update rate?',
    ],
    note: 'The filters are deliberately matched only at the −3 dB cutoff, not at stopband or transition. The moving average length is M≈0.443/fc; the windowed-sinc uses BW=0.3fc; the Chebyshev is order 6. Costs are rough operations per sample.',
  });
  const magPlot = lab.plot('mag', { xLabel: 'frequency (cycles/sample)', yLabel: 'dB', legend: true, yMin: -100, yMax: 5 });
  const stepPlot = lab.plot('step', { xLabel: 'sample', yLabel: 'amplitude', legend: true });

  function makeFilters(fc) {
    const maM = Math.max(3, Math.round(0.443 / fc) | 1);
    const hMA = new Array(maM).fill(1 / maM);
    const pole = singlePole(fc, 'lowpass');
    const sincM = Math.min(300, Math.max(20, Math.round(4 / (0.3 * fc) / 2) * 2));
    const hSinc = windowedSinc(sincM, fc, 'blackman');
    const cheb = cheby1Cutoff3(6, 0.5, fc);
    return [
      { id: 'ma', name: 'Moving average', h: hMA },
      { id: 'pole', name: 'Single pole', b: pole.b, a: pole.a },
      { id: 'sinc', name: 'Windowed-sinc', h: hSinc },
      { id: 'cheb', name: 'Chebyshev order 6', b: cheb.b, a: cheb.a },
    ];
  }

  function draw() {
    const fc = lab.get('cmp-fc');
    const highlight = lab.get('cmp-highlight');
    const filters = makeFilters(fc);
    const series = [], steps = [];
    const colors = { ma: 'var(--muted)', pole: 'var(--blue)', sinc: 'var(--accent)', cheb: 'var(--coral)' };
    for (const f of filters) {
      const H = f.h ? freqResponse(f.h, [1], 800) : freqResponse(f.b, f.a, 800);
      const step = f.h ? stepResponse(f.h, [1], 180) : applyIir(new Array(180).fill(1), f.b, f.a);
      series.push({ type: 'line', x: H.freq, y: H.db, color: colors[f.id], width: f.id === highlight ? 2.6 : 1.2, label: f.name, dash: f.id === highlight ? null : [4, 3] });
      steps.push({ type: 'line', x: Array.from({ length: step.length }, (_, i) => i), y: step, color: colors[f.id], width: f.id === highlight ? 2.4 : 1.2, label: f.name, dash: f.id === highlight ? null : [4, 3] });
    }
    magPlot.setData(series, { xMin: 0, xMax: 0.5 });
    stepPlot.setData(steps, { xMin: 0, xMax: 179, yMin: -0.2, yMax: 1.5 });
    const sel = filters.find((f) => f.id === highlight);
    const H = sel.h ? freqResponse(sel.h, [1], 800) : freqResponse(sel.b, sel.a, 800);
    let f3 = null, f40 = null;
    for (let i = 1; i < H.db.length; i++) {
      if (f3 === null && H.db[i] <= -3.01) f3 = H.freq[i];
      if (f40 === null && H.db[i] <= -40) f40 = H.freq[i];
    }
    const step = sel.h ? stepResponse(sel.h, [1], 180) : applyIir(new Array(180).fill(1), sel.b, sel.a);
    const cost = sel.id === 'ma' ? '2 adds' : sel.id === 'pole' ? '1 mul, 2 adds' : sel.id === 'sinc' ? `${sel.h.length} MACs` : '~12 MACs';
    lab.readouts({ filter: sel.name, trans: f3 && f40 ? `${(f40 - f3).toFixed(3)} fs` : '—', over: `${(overshoot(step) * 100).toFixed(1)}%`, cost });
  }
  lab.onInput('cmp-fc', draw);
  lab.onChange('cmp-highlight', draw);
  draw();
  return () => lab.destroy();
});
