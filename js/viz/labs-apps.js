/** Application labs (chapters 22–29). */

import {
  muLawEncode, muLawDecode, quantize, quantizationSnrDb, makeImage, convolve2D,
  gaussianKernel2D, imageSpectrum, morphological, phantom, radon, backproject,
  phantom as makePhantom, runLength, huffman, lzw, jpegRoundTrip, JPEG_LUMA_Q,
  windowedSinc, freqResponse, mean, clamp, nextPow2, pad, fft, realDft, inverseRealDft,
} from '../dsp.js';
import { mountLabShell, noise, fmt } from './lab-kit.js';
import { registerLab } from './lab-registry.js';

const normImg = (img) => {
  let lo = Infinity, hi = -Infinity;
  for (const v of img.data) { if (v < lo) lo = v; if (v > hi) hi = v; }
  const d = new Float32Array(img.data.length);
  for (let i = 0; i < d.length; i++) d[i] = (img.data[i] - lo) / (hi - lo || 1);
  return { ...img, data: d };
};

/* ------------------------------------------------------------------ */
/* 22. Audio                                                           */
/* ------------------------------------------------------------------ */

registerLab('audio', (el) => {
  const lab = mountLabShell(el, {
    title: 'Companding and the cost of audio',
    intro: 'Compare uniform and μ-law quantization of a low-level audio signal, then calculate raw data rates and storage for common formats. Companding is a nonlinear quantization strategy matched to hearing; it is not the same as dynamic-range compression.',
    plotCols: 2,
    controls: [
      { type: 'seg', id: 'aud-mode', label: 'Mode', value: 'compand', options: [{ value: 'compand', label: 'Companding' }, { value: 'rate', label: 'Data rate' }] },
      { type: 'range', id: 'aud-bits', label: 'Bits per sample', min: 4, max: 12, step: 1, value: 8, format: (v) => `${v} bit` },
      { type: 'range', id: 'aud-mu', label: 'μ law', min: 1, max: 255, step: 1, value: 255, format: (v) => String(v) },
      { type: 'select', id: 'aud-fs', label: 'Sample rate', value: '8000', options: [{ value: '8000', label: '8 kHz (telephone)' }, { value: '44100', label: '44.1 kHz (CD)' }, { value: '48000', label: '48 kHz' }, { value: '96000', label: '96 kHz' }] },
      { type: 'select', id: 'aud-ch', label: 'Channels', value: '1', options: [{ value: '1', label: 'Mono' }, { value: '2', label: 'Stereo' }] },
    ],
    plots: [
      { id: 'time', caption: 'Original and reconstructed signal', tall: true },
      { id: 'curve', caption: 'Quantization error / data-rate comparison', tall: true },
    ],
    readouts: [
      { id: 'snr', label: 'SNR (μ / uniform)' },
      { id: 'rate', label: 'Raw bit rate' },
      { id: 'storage', label: '4-minute storage' },
    ],
    tasks: [
      'At 8 bits, compare μ-law with uniform quantization. Which has lower error for quiet passages?',
      'Reduce to 5 bits. Does μ-law still help? What does it cost in distortion for loud signals?',
      'Switch to data-rate mode. Compare telephone, CD, and 96/24 stereo. Which would you stream?',
    ],
    note: 'μ-law companding uses μ=255 by default and a logarithmic transfer. The SNR readout is a rough full-band estimate; companding intentionally gives more resolution to small amplitudes. Data-rate mode uses raw PCM, before any compression.',
  });
  const timePlot = lab.plot('time', { xLabel: 'sample', yLabel: 'amplitude', legend: true });
  const curvePlot = lab.plot('curve', { xLabel: 'sample / format', yLabel: 'error / kbit/s', legend: true });

  function draw() {
    const mode = lab.segValue('aud-mode');
    const bits = lab.get('aud-bits');
    const mu = lab.get('aud-mu');
    const fs = +lab.get('aud-fs');
    const ch = +lab.get('aud-ch');
    const isRate = mode === 'rate';
    const labels = lab.el.querySelectorAll('.readout-item .k');
    const setLabels = (a, b, c) => { if (labels[0]) labels[0].textContent = a; if (labels[1]) labels[1].textContent = b; if (labels[2]) labels[2].textContent = c; };
    if (isRate) setLabels('Formats', 'Bit-rate range', 'Custom storage');
    else setLabels('SNR (μ / uniform)', 'Raw bit rate', '4-minute storage');
    const caps = lab.el.querySelectorAll('.plot-cap span:first-child');
    if (caps[0]) caps[0].textContent = isRate ? 'Storage for 4 minutes (MB)' : 'Original and reconstructed signal';
    if (caps[1]) caps[1].textContent = isRate ? 'Raw bit rate (kbit/s)' : 'Quantization error (×20)';
    const setVisible = (id, on) => { const c = lab.byId(id)?.closest('.control'); if (c) c.style.display = on ? '' : 'none'; };
    setVisible('aud-bits', true);
    setVisible('aud-mu', !isRate);
    setVisible('aud-fs', isRate);
    setVisible('aud-ch', isRate);
    if (!isRate) {
      const n = 400;
      const x = Array.from({ length: n }, (_, i) => 0.12 * Math.cos(2 * Math.PI * 5 * i / n) + 0.04 * Math.cos(2 * Math.PI * 17 * i / n));
      const comp = x.map((v) => muLawEncode(v, mu));
      const { q } = quantize(comp, bits, -1, 1);
      const rec = q.map((v) => muLawDecode(v, mu));
      const uni = quantize(x, bits, -1, 1);
      timePlot.setData([
        { type: 'line', y: x, color: 'var(--muted)', width: 1.3, label: 'original' },
        { type: 'line', y: rec, color: 'var(--accent)', width: 1.8, label: 'μ-law' },
        { type: 'line', y: uni.q, color: 'var(--coral)', width: 1.2, label: 'uniform', dash: [4, 3] },
      ], { xMin: 0, xMax: n - 1 });
      const errMu = x.map((v, i) => v - rec[i]);
      const errU = x.map((v, i) => v - uni.q[i]);
      curvePlot.setData([
        { type: 'line', y: errMu.map((v) => v * 20), color: 'var(--accent)', width: 1.4, label: '20× μ-law error' },
        { type: 'line', y: errU.map((v) => v * 20), color: 'var(--coral)', width: 1.2, label: '20× uniform error', dash: [4, 3] },
      ], { xMin: 0, xMax: n - 1 });
      const rms = (arr) => Math.sqrt(arr.reduce((s, v) => s + v * v, 0) / arr.length);
      const snrMu = 20 * Math.log10((rms(x) || 1e-9) / (rms(errMu) || 1e-9));
      const snrU = 20 * Math.log10((rms(x) || 1e-9) / (rms(errU) || 1e-9));
      lab.readouts({ snr: `${snrMu.toFixed(1)} / ${snrU.toFixed(1)} dB`, rate: '—', storage: '—' });
    } else {
      const formats = [
        { name: 'Telephone', fs: 8000, bits: 8, ch: 1 },
        { name: 'CD', fs: 44100, bits: 16, ch: 2 },
        { name: '96/24', fs: 96000, bits: 24, ch: 2 },
        { name: 'Custom', fs, bits, ch },
      ];
      const rates = formats.map((f) => f.fs * f.bits * f.ch / 1000);
      curvePlot.setData([{ type: 'bars', x: rates.map((_, i) => i), y: rates, color: 'var(--accent)', fill: 'var(--accent-soft)', label: 'kbit/s' }], { xMin: -0.5, xMax: formats.length - 0.5, yMin: 0, xLabels: formats.map((f) => f.name) });
      // Label formats with a second series is not supported; the table is in the readout/note.
      timePlot.setData([{ type: 'bars', x: rates.map((_, i) => i), y: formats.map((f) => f.fs * f.bits * f.ch / 8 * 240 / 1e6), color: 'var(--amber)', fill: 'var(--amber-soft)', label: 'MB / 4 min' }], { xMin: -0.5, xMax: formats.length - 0.5, yMin: 0, xLabels: formats.map((f) => f.name) });
      const custom = formats[3];
      lab.readouts({
        snr: '4 formats',
        rate: `${(formats[0].fs * formats[0].bits * formats[0].ch / 1000).toFixed(0)}–${(formats[2].fs * formats[2].bits * formats[2].ch / 1000).toFixed(0)} kbit/s`,
        storage: `${(custom.fs * custom.bits * custom.ch / 8 * 240 / 1e6).toFixed(1)} MB custom (4 min)`,
      });
    }
  }
  lab.onSeg('aud-mode', draw);
  ['aud-bits', 'aud-mu'].forEach((id) => lab.onInput(id, draw));
  ['aud-fs', 'aud-ch'].forEach((id) => lab.onChange(id, draw));
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 23. Image basics                                                    */
/* ------------------------------------------------------------------ */

function testImage(w = 112, h = 112) {
  return makeImage(w, h, (x, y) => {
    const cx = x / w, cy = y / h;
    let v = 0.15 + 0.55 * cx;
    if ((cx - 0.3) ** 2 + (cy - 0.35) ** 2 < 0.02) v = 0.95;
    if ((cx - 0.7) ** 2 + (cy - 0.3) ** 2 < 0.012) v = 0.1;
    if (cx > 0.55 && cx < 0.85 && cy > 0.6 && cy < 0.85) v = 0.75;
    if (Math.abs(cy - 0.52) < 0.015 && cx > 0.08 && cx < 0.92) v = 0.9;
    if ((Math.floor(cx * 16) + Math.floor(cy * 16)) % 2 === 0 && cx > 0.1 && cx < 0.25 && cy > 0.65 && cy < 0.9) v = 0.55;
    return clamp(v, 0, 1);
  });
}

function warpImage(img, angle, interp = 'bilinear') {
  const a = angle * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  const out = new Float32Array(img.w * img.h);
  const cx = img.w / 2, cy = img.h / 2;
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
    const dx = x - cx, dy = y - cy;
    const sx = c * dx + s * dy + cx, sy = -s * dx + c * dy + cy;
    if (sx < 0 || sy < 0 || sx >= img.w - 1 || sy >= img.h - 1) { out[y * img.w + x] = 0; continue; }
    if (interp === 'nearest') out[y * img.w + x] = img.data[Math.round(sy) * img.w + Math.round(sx)];
    else {
      const x0 = Math.floor(sx), y0 = Math.floor(sy), fx = sx - x0, fy = sy - y0;
      const v00 = img.data[y0 * img.w + x0], v10 = img.data[y0 * img.w + x0 + 1];
      const v01 = img.data[(y0 + 1) * img.w + x0], v11 = img.data[(y0 + 1) * img.w + x0 + 1];
      out[y * img.w + x] = (1 - fx) * (1 - fy) * v00 + fx * (1 - fy) * v10 + (1 - fx) * fy * v01 + fx * fy * v11;
    }
  }
  return { ...img, data: out };
}

registerLab('image-basics', (el) => {
  const lab = mountLabShell(el, {
    title: 'Pixels, brightness, and warping',
    intro: 'Apply pointwise intensity transforms, gamma, and a geometric rotation to a synthetic test image. The histogram shows how values are remapped; clipping destroys detail that no later processing can recover.',
    plotCols: 3,
    controls: [
      { type: 'range', id: 'ib-bright', label: 'Brightness', min: -0.4, max: 0.4, step: 0.01, value: 0, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'ib-contrast', label: 'Contrast', min: 0.4, max: 2, step: 0.05, value: 1, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'ib-gamma', label: 'Gamma', min: 0.3, max: 2.5, step: 0.05, value: 1, format: (v) => fmt(v, 2) },
      { type: 'select', id: 'ib-transform', label: 'Grayscale transform', value: 'linear', options: [
        { value: 'linear', label: 'Linear' }, { value: 'invert', label: 'Invert' }, { value: 'log', label: 'Log' }, { value: 'threshold', label: 'Threshold' }, { value: 'posterize', label: 'Posterize' },
      ] },
      { type: 'range', id: 'ib-thr', label: 'Threshold / levels', min: 0, max: 1, step: 0.01, value: 0.5, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'ib-rot', label: 'Rotation', min: -35, max: 35, step: 1, value: 0, format: (v) => `${v}°` },
      { type: 'select', id: 'ib-interp', label: 'Interpolation', value: 'bilinear', options: [{ value: 'bilinear', label: 'Bilinear' }, { value: 'nearest', label: 'Nearest' }] },
    ],
    plots: [
      { id: 'img1', caption: 'Original test image' },
      { id: 'img2', caption: 'Transformed image' },
      { id: 'hist', caption: 'Histogram: original vs transformed', tall: true },
    ],
    readouts: [
      { id: 'range', label: 'Output range' },
      { id: 'clip', label: 'Clipped pixels' },
      { id: 'mean', label: 'Mean level' },
    ],
    tasks: [
      'Raise contrast until clipping appears. Which details disappear first?',
      'Apply gamma 0.5 and then gamma 2.0. Do they undo each other exactly?',
      'Rotate by 20° with nearest-neighbor and bilinear. Compare edge quality.',
    ],
    note: 'Transforms are pointwise, followed by a rotation with inverse mapping. Clipping is counted before display. Histograms use 40 bins. The test image is synthetic, so ground truth is known.',
  });
  const orig = testImage();
  const img1 = lab.image('img1');
  const img2 = lab.image('img2');
  const hist = lab.plot('hist', { xLabel: 'intensity', yLabel: 'count', legend: true });
  img1.setImage(normImg(orig), { alt: 'Original synthetic test image' });

  function transform(v) {
    const kind = lab.get('ib-transform');
    const b = lab.get('ib-bright'), c = lab.get('ib-contrast'), g = lab.get('ib-gamma'), t = lab.get('ib-thr');
    let x = v;
    if (kind === 'invert') x = 1 - x;
    else if (kind === 'log') x = Math.log1p(9 * x) / Math.log(10);
    else if (kind === 'threshold') x = x >= t ? 1 : 0;
    else if (kind === 'posterize') { const levels = Math.max(2, Math.round(2 + t * 10)); x = Math.floor(x * levels) / (levels - 1); }
    x = (x - 0.5) * c + 0.5 + b;
    x = clamp(x, 0, 1);
    return x ** (1 / g);
  }

  function draw() {
    const angle = lab.get('ib-rot');
    const interp = lab.get('ib-interp');
    const pre = { ...orig, data: new Float32Array(orig.data.map(transform)) };
    const out = warpImage(pre, angle, interp);
    img2.setImage(normImg(out), { alt: 'Transformed synthetic image' });
    const n = orig.data.length;
    let clip = 0;
    for (const v of orig.data) { const t = transform(v); if (t <= 0 || t >= 1) clip++; }
    const oHist = new Array(40).fill(0), tHist = new Array(40).fill(0);
    for (const v of orig.data) oHist[Math.min(39, Math.floor(v * 40))]++;
    for (const v of out.data) tHist[Math.min(39, Math.floor(v * 40))]++;
    const centers = Array.from({ length: 40 }, (_, i) => (i + 0.5) / 40);
    hist.setData([
      { type: 'bars', x: centers, y: oHist, color: 'var(--muted)', fill: 'var(--surface-3)', label: 'original' },
      { type: 'line', x: centers, y: tHist, color: 'var(--accent)', width: 1.8, label: 'transformed' },
    ], { xMin: 0, xMax: 1, yMin: 0 });
    const vals = out.data;
    lab.readouts({
      range: `${Math.min(...vals).toFixed(2)}–${Math.max(...vals).toFixed(2)}`,
      clip: `${(100 * clip / n).toFixed(1)}%`,
      mean: mean(vals).toFixed(3),
    });
  }
  ['ib-bright', 'ib-contrast', 'ib-gamma', 'ib-thr', 'ib-rot'].forEach((id) => lab.onInput(id, draw));
  ['ib-transform', 'ib-interp'].forEach((id) => lab.onChange(id, draw));
  lab.onChange('ib-transform', () => {
    const kind = lab.get('ib-transform');
    const c = lab.byId('ib-thr')?.closest('.control');
    if (c) c.style.display = ['threshold', 'posterize'].includes(kind) ? '' : 'none';
    draw();
  });
  const tc = lab.byId('ib-thr')?.closest('.control'); if (tc) tc.style.display = 'none';
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 24. Image convolution                                               */
/* ------------------------------------------------------------------ */

registerLab('image-convolution', (el) => {
  const lab = mountLabShell(el, {
    title: 'Kernels, separability, and spectra',
    intro: 'Apply blur, sharpen, Sobel, Laplacian, and emboss kernels to the same image. Compare direct and separable Gaussian convolution, and inspect the 2-D log-magnitude spectrum.',
    plotCols: 3,
    controls: [
      { type: 'select', id: 'ic-kernel', label: 'Kernel', value: 'gauss', options: [
        { value: 'gauss', label: 'Gaussian blur' }, { value: 'box', label: 'Box blur' }, { value: 'sharpen', label: 'Sharpen' }, { value: 'sobel', label: 'Sobel edges' }, { value: 'laplace', label: 'Laplacian' }, { value: 'emboss', label: 'Emboss' },
      ] },
      { type: 'range', id: 'ic-sigma', label: 'Kernel size / σ', min: 1, max: 6, step: 0.5, value: 2, format: (v) => fmt(v, 1) },
      { type: 'check', id: 'ic-sep', label: 'Separable implementation', value: true },
      { type: 'check', id: 'ic-norm', label: 'Normalize kernel sum', value: true },
    ],
    plots: [
      { id: 'img1', caption: 'Original' },
      { id: 'img2', caption: 'Filtered' },
      { id: 'spec', caption: '2-D log-magnitude spectrum' },
    ],
    readouts: [
      { id: 'sum', label: 'Kernel sum' },
      { id: 'sep', label: 'Direct vs separable' },
      { id: 'range', label: 'Output range' },
    ],
    tasks: [
      'Blur with σ=2. Compare direct and separable output; they should match to round-off.',
      'Sharpen the image. Where does noise or clipping appear?',
      'Inspect the spectrum of the blurred image. Which spatial frequencies were removed?',
    ],
    note: 'Gaussian and box kernels are separable; Sobel is applied as two directional convolutions to form a gradient magnitude. The spectrum is centered and log-scaled for display. Edge handling replicates border pixels.',
  });
  const src = testImage(96, 96);
  const img1 = lab.image('img1'), img2 = lab.image('img2'), spec = lab.image('spec');
  img1.setImage(normImg(src), { alt: 'Original test image' });

  function kernel() {
    const kind = lab.get('ic-kernel');
    const s = lab.get('ic-sigma');
    if (kind === 'box') { const n = Math.max(3, Math.round(s) * 2 + 1); return Array.from({ length: n }, () => new Array(n).fill(1 / (n * n))); }
    if (kind === 'gauss') return gaussianKernel2D(s);
    if (kind === 'sharpen') return [[0, -1, 0], [-1, 5, -1], [0, -1, 0]];
    if (kind === 'laplace') return [[0, 1, 0], [1, -4, 1], [0, 1, 0]];
    if (kind === 'emboss') return [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]];
    if (kind === 'sobel') return [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    return [[1]];
  }

  function draw() {
    const kind = lab.get('ic-kernel');
    const k = kernel();
    const normalize = lab.get('ic-norm');
    let out;
    let maxDiff = 0;
    if (kind === 'sobel') {
      const gx = convolve2D(src, k);
      const gy = convolve2D(src, [[-1, -2, -1], [0, 0, 0], [1, 2, 1]]);
      out = { ...src, data: new Float32Array(gx.data.map((v, i) => Math.hypot(v, gy.data[i]))) };
    } else {
      out = convolve2D(src, k, { normalize: normalize && ['gauss', 'box'].includes(kind) });
      if (kind === 'gauss' && lab.get('ic-sep')) {
        const radius = Math.max(1, Math.ceil(lab.get('ic-sigma') * 3));
        const k1 = Array.from({ length: radius * 2 + 1 }, (_, i) => Math.exp(-((i - radius) ** 2) / (2 * lab.get('ic-sigma') ** 2)));
        const sum1 = k1.reduce((a, b) => a + b, 0);
        const k1n = k1.map((v) => v / sum1);
        const tmp = convolve2D(src, [k1n]);
        const sep = convolve2D(tmp, k1n.map((v) => [v]));
        maxDiff = Math.max(...out.data.map((v, i) => Math.abs(v - sep.data[i])));
        out = sep;
      }
    }
    img2.setImage(normImg(out), { alt: 'Filtered image' });
    spec.setImage(imageSpectrum(out, 128), { alt: '2-D log magnitude spectrum of filtered image' });
    const sum = k.flat().reduce((a, b) => a + b, 0);
    lab.readouts({ sum: sum.toFixed(3), sep: kind === 'gauss' ? maxDiff.toExponential(1) : 'n/a', range: `${Math.min(...out.data).toFixed(2)}–${Math.max(...out.data).toFixed(2)}` });
  }
  lab.onChange('ic-kernel', () => {
    const kind = lab.get('ic-kernel');
    const isSep = kind === 'gauss';
    const isBlur = kind === 'gauss' || kind === 'box';
    const show = (id, on) => { const c = lab.byId(id)?.closest('.control'); if (c) c.style.display = on ? '' : 'none'; };
    show('ic-sep', isSep);
    show('ic-sigma', isBlur);
    show('ic-norm', isBlur);
    draw();
  });
  lab.onInput('ic-sigma', draw);
  ['ic-sep', 'ic-norm'].forEach((id) => lab.onChange(id, draw));
  { const sep = lab.byId('ic-sep')?.closest('.control'); if (sep) sep.style.display = ''; const norm = lab.byId('ic-norm')?.closest('.control'); if (norm) norm.style.display = ''; }
  draw();
  return () => lab.destroy();
});
