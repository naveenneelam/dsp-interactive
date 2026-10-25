/** Foundations labs: pipeline, statistics, sampling, precision, linearity. */

import {
  mean, std, histogram, gaussianNoise, uniformNoise, quantize, quantizationSnrDb,
  realDft, spectrum, convolve, movingAverage, nextPow2, pad, clamp, sinc, dft,
} from '../dsp.js';
import { mountLabShell, sine, noise, fmt } from './lab-kit.js';
import { registerLab } from './lab-registry.js';

/* ------------------------------------------------------------------ */
/* 1. Signal chain                                                     */
/* ------------------------------------------------------------------ */

registerLab('pipeline', (el) => {
  const lab = mountLabShell(el, {
    title: 'The signal chain, end to end',
    intro: 'A synthetic sensor signal passes through an anti-alias filter, a sampler, a digital smoother, and a reconstruction stage. Switch applications, inject noise, and break the sampling rule on purpose.',
    plotCols: 2,
    controls: [
      { type: 'select', id: 'pipe-app', label: 'Application', value: 'audio', options: [
        { value: 'audio', label: 'Audio (tones)' },
        { value: 'radar', label: 'Radar (echo pulse)' },
        { value: 'medical', label: 'Medical (ECG-like)' },
      ] },
      { type: 'range', id: 'pipe-noise', label: 'Sensor noise', min: 0, max: 0.5, step: 0.01, value: 0.12, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'pipe-cut', label: 'Digital smoother cutoff', min: 0.02, max: 0.4, step: 0.01, value: 0.14, format: (v) => fmt(v, 2), hint: 'fraction of sample rate' },
      { type: 'check', id: 'pipe-aa', label: 'Anti-alias filter on', value: true },
      { type: 'check', id: 'pipe-interferer', label: 'Add 0.72 fs interferer', value: true },
    ],
    plots: [
      { id: 'time', caption: 'Sensor signal vs. filtered digital output', tall: true },
      { id: 'spec', caption: 'Magnitude spectrum before / after smoothing', tall: true },
    ],
    readouts: [
      { id: 'alias', label: 'Interferer alias' },
      { id: 'noise', label: 'Output noise σ' },
      { id: 'latency', label: 'Group delay' },
    ],
    tasks: [
      'Choose audio. Raise the interferer and turn the anti-alias filter off. Where does the 0.72 fs tone appear?',
      'Increase the smoother cutoff. Does the output follow the signal faster or slower? What happens to noise?',
      'Switch to radar. The echo delay encodes range; does smoothing preserve the delay?',
    ],
    note: 'The anti-alias switch removes a synthetic out-of-band interferer before sampling; the smoother is a causal moving average. The display is illustrative but the alias mapping and noise averaging are computed quantitatively.',
  });

  const timePlot = lab.plot('time', { xLabel: 'sample', yLabel: 'amplitude', legend: true });
  const specPlot = lab.plot('spec', { xLabel: 'frequency (cycles/sample)', yLabel: '|X|', legend: true });
  let raf = 0;

  function makeSignal(type, n = 320) {
    const t = Array.from({ length: n }, (_, i) => i / n);
    if (type === 'audio') return t.map((x) => 0.55 * Math.sin(2 * Math.PI * 7 * x) + 0.28 * Math.sin(2 * Math.PI * 19 * x) + 0.15 * Math.sin(2 * Math.PI * 43 * x));
    if (type === 'radar') return t.map((x) => {
      const pulse = (c, w) => Math.exp(-((x - c) ** 2) / (2 * w * w));
      return 0.2 * Math.sin(2 * Math.PI * 80 * x) * (x < 0.1 ? 1 : 0) + 0.8 * pulse(0.56, 0.012) - 0.3 * pulse(0.78, 0.02);
    });
    return t.map((x) => {
      const beat = Math.exp(-((x - 0.28) ** 2) / 0.0006) - 0.35 * Math.exp(-((x - 0.31) ** 2) / 0.0003) + 0.5 * Math.exp(-((x - 0.36) ** 2) / 0.001);
      return 0.65 * beat + 0.08 * Math.sin(2 * Math.PI * 5 * x) + 0.02 * Math.sin(2 * Math.PI * 47 * x);
    });
  }

  function draw() {
    const app = lab.get('pipe-app');
    const noiseLevel = lab.get('pipe-noise');
    const cutoff = lab.get('pipe-cut');
    const aa = lab.get('pipe-aa');
    const interferer = lab.get('pipe-interferer');
    const n = 320;
    const t = Array.from({ length: n }, (_, i) => i);
    let base = makeSignal(app, n);
    const rnd = noise(n, noiseLevel, 11);
    base = base.map((v, i) => v + rnd[i]);
    if (interferer) base = base.map((v, i) => v + 0.35 * Math.cos(2 * Math.PI * 0.72 * i));
    // Anti-alias: remove the out-of-band interferer and very high noise by a simple ideal low-pass in frequency.
    let sampled = base;
    if (aa) {
      const S = realDft(base);
      const keep = S.re.map((_, k) => (k / n <= 0.42 ? 1 : 0));
      const fullRe = keep.map((g, k) => S.re[k] * g);
      const fullIm = keep.map((g, k) => S.im[k] * g);
      const re = new Array(n).fill(0), im = new Array(n).fill(0);
      for (let k = 0; k < fullRe.length; k++) { re[k] = fullRe[k]; im[k] = fullIm[k]; if (k > 0 && k < n / 2) { re[n - k] = fullRe[k]; im[n - k] = -fullIm[k]; } }
      const inv = dft(re, im, true);
      sampled = inv.re;
    }
    const M = Math.max(2, Math.round(0.443 / cutoff));
    const { y: filtered } = movingAverage(sampled, Math.min(M, 80));
    const y = pad(filtered, n);
    const err = base.map((v, i) => v - y[i]);
    const outNoise = std(err.slice(60));
    timePlot.setData([
      { type: 'line', x: t, y: base, color: 'var(--coral)', width: 1.1, label: 'sensor', dash: [4, 3] },
      { type: 'line', x: t, y: y, color: 'var(--accent)', width: 2, label: 'digital output' },
    ], { xMin: 0, xMax: n - 1, yMin: Math.min(...y, ...base) - 0.1, yMax: Math.max(...y, ...base) + 0.1 });
    const inSpec = spectrum(base), outSpec = spectrum(y);
    const xf = inSpec.freqs;
    specPlot.setData([
      { type: 'line', x: xf, y: inSpec.mag.map((v) => v / n), color: 'var(--coral)', width: 1.2, label: 'sensor' },
      { type: 'line', x: xf, y: outSpec.mag.map((v) => v / n), color: 'var(--accent)', width: 2, label: 'output' },
    ], { xMin: 0, xMax: 0.5, yMin: 0, yMax: Math.max(0.05, ...inSpec.mag.map((v) => v / n)) * 1.1 });
    const alias = Math.abs(0.72 - 1) < 0.5 ? 0.28 : 0.72;
    lab.readouts({
      alias: aa ? 'blocked' : `${alias.toFixed(2)} fs`,
      noise: `${outNoise.toFixed(3)}`,
      latency: `${((Math.min(M, 80) - 1) / 2).toFixed(1)} samples`,
    });
  }

  ['pipe-app', 'pipe-noise', 'pipe-cut'].forEach((id) => lab.onInput(id, draw));
  ['pipe-aa', 'pipe-interferer'].forEach((id) => lab.onChange(id, draw));
  draw();
  return () => { cancelAnimationFrame(raf); lab.destroy(); };
});

/* ------------------------------------------------------------------ */
/* 2. Statistics                                                       */
/* ------------------------------------------------------------------ */

registerLab('statistics', (el) => {
  const lab = mountLabShell(el, {
    title: 'Noise, histograms, and the process behind the signal',
    intro: 'Generate a random process, change its distribution and record length, and compare the sample statistics with the underlying probability density. Add a sinusoid to see how a deterministic signal shifts the mean and RMS.',
    plotCols: 2,
    controls: [
      { type: 'seg', id: 'stat-dist', label: 'Distribution', value: 'gaussian', options: [{ value: 'gaussian', label: 'Gaussian' }, { value: 'uniform', label: 'Uniform' }] },
      { type: 'range', id: 'stat-sigma', label: 'Noise σ', min: 0.02, max: 1, step: 0.01, value: 0.22, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'stat-sine', label: 'Sine amplitude', min: 0, max: 1, step: 0.01, value: 0, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'stat-n', label: 'Record length N', min: 16, max: 2048, step: 16, value: 512, format: (v) => String(v) },
      { type: 'range', id: 'stat-seed', label: 'Noise seed', min: 1, max: 40, step: 1, value: 7, format: (v) => String(v) },
    ],
    plots: [
      { id: 'time', caption: 'One realization of the process', tall: true },
      { id: 'hist', caption: 'Sample histogram vs. theoretical pdf', tall: true },
    ],
    readouts: [
      { id: 'mean', label: 'Sample mean' },
      { id: 'std', label: 'Sample σ' },
      { id: 'rms', label: 'RMS' },
      { id: 'theory', label: 'Process σ' },
    ],
    tasks: [
      'Set N=32. How much does the sample σ move when you change the seed? Now try N=2048.',
      'Switch to uniform noise. Why is the histogram flat, and what are the theoretical mean and σ?',
      'Add a sine. Compare the signal mean with the process mean and explain the difference.',
    ],
    note: 'The Gaussian samples use a Box–Muller transform; the uniform source is deterministic PRNG. Histogram bins scale with the data range. Sample statistics describe this record, not the process exactly.',
  });
  const timePlot = lab.plot('time', { xLabel: 'sample', yLabel: 'amplitude' });
  const histPlot = lab.plot('hist', { xLabel: 'amplitude', yLabel: 'count / density', legend: true });

  function draw() {
    const dist = lab.segValue('stat-dist');
    const sigma = lab.get('stat-sigma');
    const amp = lab.get('stat-sine');
    const N = Math.min(2048, lab.get('stat-n'));
    const seed = lab.get('stat-seed');
    const noiseArr = dist === 'gaussian' ? gaussianNoise(N, sigma, seed) : uniformNoise(N, sigma * Math.sqrt(3), seed);
    const sig = noiseArr.map((v, i) => v + amp * Math.sin(2 * Math.PI * 7 * i / N));
    const m = mean(sig), sd = std(sig), r = Math.sqrt(m * m + sd * sd);
    const sigmaTheory = dist === 'gaussian' ? sigma : sigma;
    const h = histogram(sig, 44, Math.min(...sig) - 0.02, Math.max(...sig) + 0.02);
    const pdf = h.centers.map((x) => {
      const denom = sigmaTheory * Math.sqrt(2 * Math.PI);
      return dist === 'gaussian' ? (Math.exp(-((x - mean(noiseArr)) ** 2) / (2 * sigmaTheory ** 2)) / denom) * sig.length * h.width : (Math.abs(x - mean(noiseArr)) <= sigmaTheory * Math.sqrt(3) ? (1 / (2 * sigmaTheory * Math.sqrt(3))) * sig.length * h.width : 0);
    });
    timePlot.setData([{ type: 'line', y: sig, color: 'var(--accent)', width: 1.2, label: 'x[n]' }], { xMin: 0, xMax: N - 1 });
    histPlot.setData([
      { type: 'bars', x: h.centers, y: h.counts, color: 'var(--accent)', fill: 'color-mix(in srgb, var(--accent) 45%, transparent)', label: 'histogram' },
      { type: 'line', x: h.centers, y: pdf, color: 'var(--coral)', width: 2, label: 'theory' },
    ], { xMin: h.lo, xMax: h.hi, yMin: 0 });
    lab.readouts({ mean: m.toFixed(3), std: sd.toFixed(3), rms: r.toFixed(3), theory: sigmaTheory.toFixed(3) });
  }
  lab.onSeg('stat-dist', draw);
  ['stat-sigma', 'stat-sine', 'stat-n', 'stat-seed'].forEach((id) => lab.onInput(id, draw));
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 3. Sampling and quantization                                         */
/* ------------------------------------------------------------------ */

registerLab('sampling', (el) => {
  const lab = mountLabShell(el, {
    title: 'Sampling, aliasing, and quantization',
    intro: 'Sample a continuous sinusoid, reconstruct it with a finite sinc sum, and quantize the samples. Push the input above Nyquist to see an alias; reduce the bit depth to see the staircase and the noise floor.',
    plotCols: 2,
    controls: [
      { type: 'range', id: 'samp-f', label: 'Input frequency', min: 0.2, max: 14, step: 0.1, value: 3.2, unit: ' cycles/unit', format: (v) => v.toFixed(1) },
      { type: 'range', id: 'samp-fs', label: 'Sampling rate', min: 4, max: 32, step: 1, value: 12, unit: ' Sa/unit', format: (v) => String(v) },
      { type: 'range', id: 'samp-bits', label: 'Quantization bits', min: 1, max: 12, step: 1, value: 6, format: (v) => `${v} bit` },
      { type: 'check', id: 'samp-recon', label: 'Sinc reconstruction', value: true },
      { type: 'check', id: 'samp-quant', label: 'Show quantized samples', value: true },
    ],
    plots: [
      { id: 'time', caption: 'Continuous input, samples, and reconstruction', tall: true },
      { id: 'spec', caption: 'Sampled spectrum (one-sided magnitude)', tall: true },
    ],
    readouts: [
      { id: 'nyq', label: 'Nyquist' },
      { id: 'alias', label: 'Apparent frequency' },
      { id: 'snr', label: 'Ideal SNR' },
      { id: 'err', label: 'RMS quant. error' },
    ],
    tasks: [
      'Set f=3, fs=12. Is the input above or below Nyquist? Does the reconstruction match?',
      'Set f=9, fs=12. What frequency appears in the samples? Where does the spectrum peak?',
      'Reduce bits to 2. Estimate the SNR from the error, then compare with 6.02N+1.76 dB.',
    ],
    note: 'Reconstruction uses a finite sinc sum (illustrative, with edge truncation). Quantization is mid-tread over the sample range; the SNR formula assumes a full-scale sine and uniform error.',
  });
  const timePlot = lab.plot('time', { xLabel: 'time (samples)', yLabel: 'amplitude', legend: true });
  const specPlot = lab.plot('spec', { xLabel: 'frequency (cycles/sample)', yLabel: '|X|', legend: true });

  function draw() {
    const f = lab.get('samp-f');
    const fs = lab.get('samp-fs');
    const bits = lab.get('samp-bits');
    const showRecon = lab.get('samp-recon');
    const showQuant = lab.get('samp-quant');
    const duration = 1;
    const fineN = 1200;
    const tCont = Array.from({ length: fineN }, (_, i) => (i / fineN) * duration);
    const cont = tCont.map((t) => Math.cos(2 * Math.PI * f * t));
    const nSamp = Math.floor(duration * fs) + 1;
    const tSamp = Array.from({ length: nSamp }, (_, n) => n / fs);
    const raw = tSamp.map((t) => Math.cos(2 * Math.PI * f * t));
    const { q, err, step } = quantize(raw, bits, -1, 1);
    const sampVals = showQuant ? q : raw;
    // sinc reconstruction
    let recon = null;
    if (showRecon) {
      recon = tCont.map((t) => {
        let s = 0;
        for (let n = 0; n < nSamp; n++) {
          const x = (t - n / fs) * fs;
          if (Math.abs(x) > 40) continue;
          s += sampVals[n] * sinc(x);
        }
        return s;
      });
    }
    const sampSeries = { type: 'stems', x: tSamp, y: sampVals, color: 'var(--coral)', label: showQuant ? 'quantized samples' : 'samples' };
    const series = [
      { type: 'line', x: tCont, y: cont, color: 'var(--muted)', width: 1.2, label: 'continuous input', dash: [4, 3] },
      sampSeries,
    ];
    if (recon) series.push({ type: 'line', x: tCont, y: recon, color: 'var(--accent)', width: 1.8, label: 'sinc reconstruction' });
    timePlot.setData(series, { xMin: 0, xMax: 1, yMin: -1.5, yMax: 1.5 });

    const padded = pad(sampVals, nextPow2(Math.max(256, nSamp * 8)));
    const S = realDft(padded);
    const xf = S.freqs;
    specPlot.setData([{ type: 'line', x: xf, y: S.mag.map((v) => v / padded.length), color: 'var(--accent)', width: 1.5, label: 'sampled spectrum' }], { xMin: 0, xMax: 0.5, yMin: 0 });
    const nyq = fs / 2;
    const alias = Math.abs(f - fs * Math.round(f / fs));
    const rmsErr = Math.sqrt(err.reduce((s, e) => s + e * e, 0) / err.length);
    lab.readouts({
      nyq: `${nyq.toFixed(2)} /unit`,
      alias: f > nyq ? `${alias.toFixed(2)} (aliased)` : `${f.toFixed(2)} (clean)`,
      snr: `${quantizationSnrDb(bits).toFixed(1)} dB`,
      err: `${rmsErr.toFixed(4)} (${step.toFixed(4)} LSB)`,
    });
  }
  ['samp-f', 'samp-fs', 'samp-bits'].forEach((id) => lab.onInput(id, draw));
  ['samp-recon', 'samp-quant'].forEach((id) => lab.onChange(id, draw));
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 4. Precision                                                        */
/* ------------------------------------------------------------------ */

registerLab('precision', (el) => {
  const lab = mountLabShell(el, {
    title: 'When arithmetic quietly drifts',
    intro: 'Repeat the book’s add-and-subtract experiment in simulated number formats. Random rounding wanders as √N; biased rounding drifts as N. A compensated sum can recover much of the lost accuracy.',
    plotCols: 2,
    controls: [
      { type: 'select', id: 'prec-fmt', label: 'Number format', value: 'f32', options: [
        { value: 'f32', label: '32-bit float' },
        { value: 'f64', label: '64-bit double' },
        { value: 'q15', label: '16-bit Q15 fixed' },
      ] },
      { type: 'range', id: 'prec-n', label: 'Iterations', min: 100, max: 5000, step: 100, value: 2000, format: (v) => String(v) },
      { type: 'range', id: 'prec-scale', label: 'Perturbation scale', min: 0.1, max: 2, step: 0.1, value: 1, format: (v) => fmt(v, 1) },
      { type: 'check', id: 'prec-kahan', label: 'Kahan compensated sum', value: false },
    ],
    plots: [
      { id: 'value', caption: 'Tracked value vs. iteration', tall: true },
      { id: 'error', caption: 'Absolute error on a log scale', tall: true },
    ],
    readouts: [
      { id: 'final', label: 'Final value' },
      { id: 'err', label: 'Final |error|' },
      { id: 'growth', label: 'Error growth' },
    ],
    tasks: [
      'Run 32-bit float for 2,000 iterations. Does the error grow like √N or N?',
      'Switch to Q15. Which dominates now: rounding or quantization?',
      'Enable Kahan summation. How much does the final error improve?',
    ],
    note: 'Float32 is simulated with Math.fround after each operation; Q15 rounds to a 1/32768 grid. The loop adds two pseudo-random values and subtracts them, matching the book’s demonstration. The growth exponent is a least-squares fit to log|error| vs log N.',
  });
  const valuePlot = lab.plot('value', { xLabel: 'iteration', yLabel: 'value', legend: true });
  const errPlot = lab.plot('error', { xLabel: 'iteration', yLabel: '|error|', yLog: true });

  function roundTo(fmt, v) {
    if (fmt === 'f32') return Math.fround(v);
    if (fmt === 'q15') return Math.round(clamp(v, -1, 0.999969) * 32768) / 32768;
    return v;
  }

  function draw() {
    const fmt = lab.get('prec-fmt');
    const N = lab.get('prec-n');
    const scale = lab.get('prec-scale');
    const kahan = lab.get('prec-kahan');
    let x = 1, comp = 0;
    const vals = [x], errs = [0];
    let seed = 1234567;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 1; i <= N; i++) {
      const a = roundTo(fmt, rnd() * scale);
      const b = roundTo(fmt, rnd() * scale);
      if (kahan) {
        let y = roundTo(fmt, a - comp); let t = roundTo(fmt, x + y); comp = roundTo(fmt, (t - x) - y); x = t;
        y = roundTo(fmt, b - comp); t = roundTo(fmt, x + y); comp = roundTo(fmt, (t - x) - y); x = t;
        y = roundTo(fmt, -a - comp); t = roundTo(fmt, x + y); comp = roundTo(fmt, (t - x) - y); x = t;
        y = roundTo(fmt, -b - comp); t = roundTo(fmt, x + y); comp = roundTo(fmt, (t - x) - y); x = t;
      } else {
        x = roundTo(fmt, roundTo(fmt, roundTo(fmt, x + a) + b) - a);
        x = roundTo(fmt, x - b);
      }
      vals.push(x); errs.push(Math.abs(x - 1));
    }
    const step = Math.max(1, Math.floor(N / 500));
    const xs = [], vs = [], es = [];
    for (let i = 0; i < vals.length; i += step) { xs.push(i); vs.push(vals[i]); es.push(Math.max(1e-16, errs[i])); }
    valuePlot.setData([{ type: 'line', x: xs, y: vs, color: 'var(--accent)', width: 1.8, label: 'tracked value' }], { xMin: 0, xMax: N, yMin: Math.min(0.999, ...vs) - 0.0005, yMax: Math.max(1.001, ...vs) + 0.0005 });
    errPlot.setData([{ type: 'line', x: xs, y: es, color: 'var(--coral)', width: 1.8, label: '|error|' }], { xMin: 0, xMax: N, yLog: true, yMin: 1e-16, yMax: Math.max(1e-6, ...es) * 2 });
    const finalErr = errs[errs.length - 1];
    // growth exponent fit on nonzero errors
    const pts = errs.map((e, i) => [i + 1, e]).filter(([i, e]) => i > 5 && e > 0);
    let expo = 0;
    if (pts.length > 10) {
      const lx = pts.map(([i]) => Math.log(i)), ly = pts.map(([, e]) => Math.log(e));
      const mx = mean(lx), my = mean(ly);
      expo = lx.reduce((s, v, i) => s + (v - mx) * (ly[i] - my), 0) / lx.reduce((s, v) => s + (v - mx) ** 2, 0);
    }
    lab.readouts({ final: vals[vals.length - 1].toFixed(9), err: finalErr.toExponential(2), growth: `N^${expo.toFixed(2)}` });
  }
  lab.onChange('prec-fmt', draw);
  ['prec-n', 'prec-scale'].forEach((id) => lab.onInput(id, draw));
  lab.onChange('prec-kahan', draw);
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 5. Linearity                                                        */
/* ------------------------------------------------------------------ */

registerLab('linearity', (el) => {
  const lab = mountLabShell(el, {
    title: 'Test a system for linearity',
    intro: 'Drive a gain, a clipper, a squarer, and an absolute-value system with two tones. Compare the response to the sum with the sum of the responses, and inspect the output spectrum for new frequencies.',
    plotCols: 2,
    controls: [
      { type: 'seg', id: 'lin-sys', label: 'System', value: 'gain', options: [
        { value: 'gain', label: 'Gain 1.5' },
        { value: 'clip', label: 'Clipper' },
        { value: 'square', label: 'Squarer' },
        { value: 'abs', label: 'Absolute' },
        { value: 'median', label: 'Median 5' },
      ] },
      { type: 'range', id: 'lin-a1', label: 'Tone 1 amplitude', min: 0, max: 1, step: 0.01, value: 0.8, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'lin-a2', label: 'Tone 2 amplitude', min: 0, max: 1, step: 0.01, value: 0.35, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'lin-f2', label: 'Tone 2 frequency', min: 0.02, max: 0.2, step: 0.005, value: 0.07, format: (v) => fmt(v, 3) },
    ],
    plots: [
      { id: 'time', caption: 'Response to sum vs. sum of responses', tall: true },
      { id: 'spec', caption: 'Output spectrum (new frequencies = nonlinearity)', tall: true },
    ],
    readouts: [
      { id: 'err', label: 'Superposition error' },
      { id: 'harm', label: 'Largest new peak' },
      { id: 'verdict', label: 'Verdict' },
    ],
    tasks: [
      'With gain 1.5, the superposition error should be near zero. Confirm it.',
      'Switch to the clipper and raise the amplitudes. Where does superposition fail?',
      'Compare the squarer’s spectrum with the input. Identify the sum and difference frequencies.',
    ],
    note: 'The median filter is a nonlinear rank operation. The superposition error is max|T(x₁+x₂) − (T(x₁)+T(x₂))|. “Largest new peak” is measured outside the two input frequencies; leakage is not corrected.',
  });
  const timePlot = lab.plot('time', { xLabel: 'sample', yLabel: 'amplitude', legend: true });
  const specPlot = lab.plot('spec', { xLabel: 'frequency (cycles/sample)', yLabel: '|X|', legend: true });

  const N = 512;
  const x1 = (a) => Array.from({ length: N }, (_, i) => a * Math.cos(2 * Math.PI * 0.045 * i));
  const x2 = (a, f) => Array.from({ length: N }, (_, i) => a * Math.cos(2 * Math.PI * f * i));
  const median = (x, M = 5) => x.map((_, i) => {
    const win = [];
    for (let k = -2; k <= 2; k++) win.push(x[Math.max(0, Math.min(x.length - 1, i + k))]);
    win.sort((a, b) => a - b);
    return win[2];
  });
  function sys(kind, x) {
    if (kind === 'gain') return x.map((v) => 1.5 * v);
    if (kind === 'clip') return x.map((v) => clamp(1.5 * v, -1, 1));
    if (kind === 'square') return x.map((v) => v * v - 0.5 * mean(x.map((u) => u * u)));
    if (kind === 'abs') return x.map((v) => Math.abs(v) - 0.5);
    return median(x, 5);
  }

  function draw() {
    const kind = lab.segValue('lin-sys');
    const a1 = lab.get('lin-a1'), a2 = lab.get('lin-a2');
    const f2 = lab.get('lin-f2');
    const tone1 = x1(a1), tone2 = x2(a2, f2);
    const sum = tone1.map((v, i) => v + tone2[i]);
    const ySum = sys(kind, sum);
    const y1 = sys(kind, tone1), y2 = sys(kind, tone2);
    const ySep = y1.map((v, i) => v + y2[i]);
    const err = ySum.map((v, i) => v - ySep[i]);
    const maxErr = Math.max(...err.map(Math.abs));
    timePlot.setData([
      { type: 'line', y: ySum, color: 'var(--accent)', width: 1.8, label: 'T(x₁+x₂)' },
      { type: 'line', y: ySep, color: 'var(--coral)', width: 1.4, label: 'T(x₁)+T(x₂)', dash: [4, 3] },
      { type: 'line', y: err.map((v) => v * 2), color: 'var(--amber)', width: 1, label: '2× error' },
    ], { xMin: 0, xMax: N - 1 });
    const S = spectrum(ySum);
    const base = spectrum(sum);
    const mag = S.mag.map((v) => v / N);
    const maxMag = Math.max(...mag);
    // find largest bin away from input tones
    let bestK = 0, bestV = 0;
    for (let k = 2; k < mag.length - 2; k++) {
      if (Math.abs(k / N - 0.045) < 0.02 || Math.abs(k / N - f2) < 0.02) continue;
      if (mag[k] > bestV) { bestV = mag[k]; bestK = k; }
    }
    specPlot.setData([
      { type: 'line', x: S.freqs, y: mag, color: 'var(--accent)', width: 1.6, label: 'output' },
      { type: 'line', x: base.freqs, y: base.mag.map((v) => v / N), color: 'var(--muted)', width: 1, label: 'input', dash: [4, 3] },
    ], { xMin: 0, xMax: 0.5, yMin: 0, yMax: Math.max(0.05, maxMag) * 1.15 });
    lab.readouts({
      err: maxErr.toExponential(2),
      harm: bestV > 0 ? `${(bestK / N).toFixed(3)} fs · ${(bestV / (maxMag || 1) * 100).toFixed(0)}%` : '—',
      verdict: maxErr < 1e-6 ? 'linear (within round-off)' : 'nonlinear',
    });
  }
  lab.onSeg('lin-sys', draw);
  ['lin-a1', 'lin-a2', 'lin-f2'].forEach((id) => lab.onInput(id, draw));
  draw();
  return () => lab.destroy();
});
