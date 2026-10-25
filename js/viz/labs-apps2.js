/** Imaging, neural, compression, and hardware labs. */

import {
  makeImage, convolve2D, gaussianKernel2D, morphological, phantom, radon, backproject,
  runLength, huffman, lzw, jpegRoundTrip, JPEG_LUMA_Q, windowedSinc, freqResponse,
  clamp, mean, nextPow2, pad, fft, realDft, inverseRealDft,
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
/* 25. Special imaging                                                 */
/* ------------------------------------------------------------------ */

function barTarget(n = 96) {
  return makeImage(n, n, (x, y) => {
    if (y < 12 || y > n - 12) return 0.1;
    const groups = [2, 3, 4, 6, 8, 12];
    const gw = Math.floor((n - 20) / groups.length);
    const g = Math.min(groups.length - 1, Math.floor((x - 10) / gw));
    const period = groups[g];
    if (x < 10 || x >= 10 + gw * groups.length) return 0.1;
    return ((x - 10) % period) < period / 2 ? 0.95 : 0.12;
  });
}

function binaryScene(n = 80) {
  return makeImage(n, n, (x, y) => {
    const cx = x / n, cy = y / n;
    const rect = cx > 0.2 && cx < 0.45 && cy > 0.25 && cy < 0.55;
    const circ = (cx - 0.7) ** 2 + (cy - 0.35) ** 2 < 0.018;
    const ring = Math.abs(Math.hypot(cx - 0.5, cy - 0.7) - 0.16) < 0.035;
    let v = rect || circ || ring ? 1 : 0;
    if ((x * 13 + y * 7) % 37 === 0) v = 1; // speckles
    if ((x * 11 + y * 5) % 41 === 0) v = 0;
    return v;
  });
}

function sinogramImage(projections) {
  const A = projections.length, d = projections[0].length;
  let max = 0;
  for (const p of projections) for (const v of p) max = Math.max(max, v);
  const data = new Float32Array(A * d);
  for (let a = 0; a < A; a++) for (let i = 0; i < d; i++) data[a * d + i] = projections[a][i] / (max || 1);
  return { w: d, h: A, data };
}

registerLab('imaging-special', (el) => {
  const lab = mountLabShell(el, {
    title: 'Resolution, morphology, and CT',
    intro: 'Blur a bar target and compare it with the ideal, apply morphological operators to a noisy binary scene, and reconstruct a synthetic phantom from projections with and without the ramp filter.',
    plotCols: 3,
    controls: [
      { type: 'seg', id: 'is-mode', label: 'Mode', value: 'res', options: [{ value: 'res', label: 'Resolution' }, { value: 'morph', label: 'Morphology' }, { value: 'ct', label: 'CT' }] },
      { type: 'range', id: 'is-sigma', label: 'PSF σ', min: 0.5, max: 5, step: 0.5, value: 2, format: (v) => fmt(v, 1) },
      { type: 'range', id: 'is-noise', label: 'Noise σ', min: 0, max: 0.3, step: 0.01, value: 0.02, format: (v) => fmt(v, 2) },
      { type: 'select', id: 'is-op', label: 'Morphology', value: 'open', options: [{ value: 'erode', label: 'Erode' }, { value: 'dilate', label: 'Dilate' }, { value: 'open', label: 'Open' }, { value: 'close', label: 'Close' }] },
      { type: 'range', id: 'is-radius', label: 'Structuring radius', min: 1, max: 5, step: 1, value: 2, format: (v) => String(v) },
      { type: 'range', id: 'is-angles', label: 'CT angles', min: 12, max: 120, step: 6, value: 90, format: (v) => String(v) },
      { type: 'check', id: 'is-filter', label: 'CT ramp filter', value: true },
    ],
    plots: [
      { id: 'img1', caption: 'Input / phantom' },
      { id: 'img2', caption: 'Output / sinogram' },
      { id: 'img3', caption: 'Difference / reconstruction' },
    ],
    readouts: [
      { id: 'a', label: 'Resolution / area' },
      { id: 'b', label: 'Contrast / changed' },
      { id: 'c', label: 'RMSE / angles' },
    ],
    tasks: [
      'Increase PSF σ. Which bar group disappears first? Relate this to the optical MTF.',
      'Apply opening and closing to the noisy binary scene. Which removes speckles, and which fills holes?',
      'Turn the CT ramp filter off. What happens to the reconstruction, and why?',
    ],
    note: 'Resolution mode applies a Gaussian PSF and additive noise to a bar target; “resolved” means local contrast above 25%. Morphology uses a square structuring element; the difference image highlights changed pixels. CT uses a 64×64 phantom and filtered/unfiltered backprojection.',
  });
  const i1 = lab.image('img1'), i2 = lab.image('img2'), i3 = lab.image('img3');
  const bars = barTarget();
  const bin = binaryScene();
  const ph = phantom(64);

  function draw() {
    const mode = lab.segValue('is-mode');
    const sigma = lab.get('is-sigma');
    const noiseLevel = lab.get('is-noise');
    const op = lab.get('is-op');
    const radius = lab.get('is-radius');
    const angles = lab.get('is-angles');
    const filter = lab.get('is-filter');
    const show = (id, on) => { const c = lab.byId(id)?.closest('.control'); if (c) c.style.display = on ? '' : 'none'; };
    show('is-sigma', mode === 'res'); show('is-noise', mode === 'res'); show('is-op', mode === 'morph'); show('is-radius', mode === 'morph'); show('is-angles', mode === 'ct'); show('is-filter', mode === 'ct');
    const labels = lab.el.querySelectorAll('.readout-item .k');
    const setLabels = (a, b, c) => { if (labels[0]) labels[0].textContent = a; if (labels[1]) labels[1].textContent = b; if (labels[2]) labels[2].textContent = c; };
    if (mode === 'res') setLabels('Resolved groups', 'PSF σ', 'Cutoff estimate');
    else if (mode === 'morph') setLabels('Foreground', 'Changed pixels', 'Radius');
    else setLabels('Correlation', 'RMSE', 'Angles');
    if (mode === 'res') {
      const k = gaussianKernel2D(sigma);
      const blurred = convolve2D(bars, k);
      const nz = noise(bars.w * bars.h, noiseLevel, 17);
      const out = { ...blurred, data: blurred.data.map((v, i) => clamp(v + nz[i], 0, 1)) };
      const diff = { ...bars, data: out.data.map((v, i) => bars.data[i] - v) };
      i1.setImage(normImg(bars), { alt: 'Ideal bar target' });
      i2.setImage(normImg(out), { alt: 'Blurred and noisy bar target' });
      i3.setImage(normImg(diff), { alt: 'Difference image' });
      // contrast per group
      const groups = [2, 3, 4, 6, 8, 12];
      const gw = Math.floor((bars.w - 20) / groups.length);
      let resolved = 0;
      for (let g = 0; g < groups.length; g++) {
        let lo = 1, hi = 0;
        for (let x = 10 + g * gw + 2; x < 10 + (g + 1) * gw - 2; x++) {
          const v = out.data[Math.floor(bars.h / 2) * bars.w + x];
          lo = Math.min(lo, v); hi = Math.max(hi, v);
        }
        if (hi - lo > 0.25) resolved++;
      }
      lab.readouts({ a: `${resolved}/6 resolved`, b: `σ=${sigma} px`, c: `Nyquist ${(1 / (2 * sigma * 2.35)).toFixed(3)}` });
    } else if (mode === 'morph') {
      const out = morphological(bin, radius, op, 0.5);
      const diff = { ...bin, data: out.data.map((v, i) => Math.abs(v - bin.data[i])) };
      i1.setImage(normImg(bin), { alt: 'Noisy binary scene' });
      i2.setImage(normImg(out), { alt: 'Morphological output' });
      i3.setImage(normImg(diff), { alt: 'Changed pixels' });
      const area = out.data.reduce((s, v) => s + v, 0) / out.data.length;
      const changed = diff.data.reduce((s, v) => s + v, 0) / diff.data.length;
      lab.readouts({ a: `${(area * 100).toFixed(1)}% foreground`, b: `${(changed * 100).toFixed(1)}% changed`, c: `radius ${radius}` });
    } else {
      const proj = radon(ph, angles);
      const rec = backproject(proj.projections, 64, filter);
      const recN = normImg(rec);
      const rmse = Math.sqrt(ph.data.reduce((s, v, i) => s + (v - recN.data[i]) ** 2, 0) / ph.data.length);
      const phAvg = mean(ph.data), recAvg = mean(recN.data);
      let cov = 0, vp = 0, vr = 0;
      for (let i = 0; i < ph.data.length; i++) { const a = ph.data[i] - phAvg, b = recN.data[i] - recAvg; cov += a * b; vp += a * a; vr += b * b; }
      const corr = cov / Math.sqrt((vp * vr) || 1);
      i1.setImage(normImg(ph), { alt: 'CT phantom' });
      i2.setImage(normImg(sinogramImage(proj.projections)), { alt: 'Sinogram' });
      i3.setImage(recN, { alt: 'Reconstruction' });
      lab.readouts({ a: `corr ${corr.toFixed(2)}`, b: `RMSE ${rmse.toFixed(3)}`, c: `${angles} angles` });
    }
  }
  lab.onSeg('is-mode', draw);
  ['is-sigma', 'is-noise', 'is-radius', 'is-angles'].forEach((id) => lab.onInput(id, draw));
  ['is-op', 'is-filter'].forEach((id) => lab.onChange(id, draw));
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 26. Neural network                                                  */
/* ------------------------------------------------------------------ */

registerLab('neural', (el) => {
  const lab = mountLabShell(el, {
    title: 'Train a perceptron',
    intro: 'Generate a classification problem and train a single linear unit. Add a quadratic feature to solve XOR-like data. The left panel shows the decision regions and the training points; the right panel shows the error per epoch.',
    plotCols: 2,
    controls: [
      { type: 'select', id: 'nn-data', label: 'Dataset', value: 'linear', options: [{ value: 'linear', label: 'Linear boundary' }, { value: 'xor', label: 'XOR (needs feature)' }, { value: 'circle', label: 'Circle (needs feature)' }] },
      { type: 'range', id: 'nn-lr', label: 'Learning rate', min: 0.01, max: 0.5, step: 0.01, value: 0.1, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'nn-epochs', label: 'Max epochs', min: 10, max: 200, step: 10, value: 80, format: (v) => String(v) },
      { type: 'html', html: `<div class="control" style="flex:0 1 auto;max-width:none"><label>&nbsp;</label><div class="row"><button class="btn btn-sm" data-lab-train>Train</button><button class="btn btn-sm" data-lab-reset>New data</button></div></div>` },
    ],
    plots: [
      { id: 'plane', caption: 'Decision regions and training points', tall: true },
      { id: 'loss', caption: 'Training errors per epoch', tall: true },
    ],
    readouts: [
      { id: 'acc', label: 'Training accuracy' },
      { id: 'err', label: 'Final errors' },
      { id: 'feat', label: 'Feature map' },
    ],
    tasks: [
      'Train the linear dataset. How many epochs until the errors reach zero?',
      'Switch to XOR with the default feature map. Why does it still fail?',
      'The XOR mode adds the x₁x₂ feature. Does the perceptron now separate the classes?',
    ],
    note: 'The perceptron uses the classic update w←w+η(y−ŷ)x. XOR and circle modes append one quadratic feature; without it, a linear boundary cannot separate those classes. Decision regions are sampled on a 60×60 grid.',
  });
  const planeCanvas = lab.byId(`${lab.id}-plane`);
  const lossPlot = lab.plot('loss', { xLabel: 'epoch', yLabel: 'errors', legend: false });
  let points = [], labels = [], weights = [], bias = 0, history = [], accuracy = 0;

  function mulberry(seed) {
    let a = seed >>> 0;
    return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function makeData(kind) {
    const rnd = mulberry(12345);
    points = []; labels = [];
    for (let i = 0; i < 80; i++) {
      const x1 = rnd() * 2 - 1, x2 = rnd() * 2 - 1;
      let y;
      if (kind === 'linear') y = x1 + x2 > 0 ? 1 : -1;
      else if (kind === 'xor') y = x1 * x2 > 0 ? 1 : -1;
      else y = x1 * x1 + x2 * x2 > 0.3 ? 1 : -1;
      points.push([x1, x2]); labels.push(y);
    }
  }
  function features(p) {
    const kind = lab.get('nn-data');
    if (kind === 'xor') return [p[0], p[1], p[0] * p[1]];
    if (kind === 'circle') return [p[0], p[1], p[0] * p[0] + p[1] * p[1] - 0.3];
    return [p[0], p[1]];
  }
  function predict(p, w = weights, b = bias) {
    const f = features(p);
    let s = b;
    for (let i = 0; i < f.length; i++) s += w[i] * f[i];
    return s >= 0 ? 1 : -1;
  }
  function train() {
    makeData(lab.get('nn-data'));
    const lr = lab.get('nn-lr');
    const epochs = lab.get('nn-epochs');
    const dim = features(points[0]).length;
    weights = new Array(dim).fill(0);
    bias = 0;
    history = [];
    for (let e = 0; e < epochs; e++) {
      let errors = 0;
      for (let i = 0; i < points.length; i++) {
        const f = features(points[i]);
        let s = bias;
        for (let j = 0; j < dim; j++) s += weights[j] * f[j];
        const pred = s >= 0 ? 1 : -1;
        const err = labels[i] - pred;
        if (err !== 0) {
          for (let j = 0; j < dim; j++) weights[j] += lr * err * f[j];
          bias += lr * err;
          errors++;
        }
      }
      history.push(errors);
      if (!errors) break;
    }
    accuracy = points.reduce((n, p, i) => n + (predict(p) === labels[i] ? 1 : 0), 0) / points.length;
    drawPlane();
    lossPlot.setData([{ type: 'line', x: history.map((_, i) => i), y: history, color: 'var(--accent)', width: 1.8 }], { xMin: 0, xMax: Math.max(1, history.length - 1), yMin: 0 });
    const kind = lab.get('nn-data');
    lab.readouts({ acc: `${(accuracy * 100).toFixed(1)}%`, err: String(history[history.length - 1] ?? 0), feat: kind === 'linear' ? 'x₁, x₂' : kind === 'xor' ? 'x₁, x₂, x₁x₂' : 'x₁, x₂, x₁²+x₂²' });
  }
  function drawPlane() {
    if (!planeCanvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = planeCanvas.clientWidth || 300, h = planeCanvas.clientHeight || 260;
    planeCanvas.width = Math.round(w * dpr); planeCanvas.height = Math.round(h * dpr);
    const ctx = planeCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = (v, f) => getComputedStyle(planeCanvas).getPropertyValue(v).trim() || f;
    const accent = css('--accent-soft', '#dcefe9'), coral = css('--coral-soft', '#fde9dd');
    const ink = css('--ink', '#1b2430'), muted = css('--muted', '#66717d'), border = css('--border', '#ddd5c6');
    ctx.clearRect(0, 0, w, h);
    const pad = 18, size = Math.min(w - 2 * pad, h - 2 * pad);
    const cells = 48, cw = size / cells;
    for (let gy = 0; gy < cells; gy++) for (let gx = 0; gx < cells; gx++) {
      const x = -1 + 2 * (gx + 0.5) / cells, y = 1 - 2 * (gy + 0.5) / cells;
      const pred = predict([x, y]);
      ctx.fillStyle = pred > 0 ? accent : coral;
      ctx.fillRect(pad + gx * cw, pad + gy * cw, cw + 0.5, cw + 0.5);
    }
    ctx.strokeStyle = border; ctx.strokeRect(pad, pad, size, size);
    for (let i = 0; i < points.length; i++) {
      const x = pad + (points[i][0] + 1) / 2 * size, y = pad + (1 - (points[i][1] + 1) / 2) * size;
      ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = labels[i] > 0 ? css('--accent', '#0e6b62') : css('--coral', '#c2410c');
      ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.fillStyle = muted; ctx.font = '10px "Segoe UI", system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('x₁', pad + size / 2, h - 4); ctx.save(); ctx.translate(10, pad + size / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('x₂', 0, 0); ctx.restore();
    planeCanvas.setAttribute('aria-label', `Decision regions for ${lab.get('nn-data')} data. Training accuracy ${(accuracy * 100).toFixed(1)} percent.`);
  }
  lab.q('[data-lab-train]')?.addEventListener('click', train);
  lab.q('[data-lab-reset]')?.addEventListener('click', () => { makeData(lab.get('nn-data')); train(); });
  lab.onChange('nn-data', train);
  ['nn-lr', 'nn-epochs'].forEach((id) => lab.onInput(id, train));
  train();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 27. Compression                                                     */
/* ------------------------------------------------------------------ */

registerLab('compression', (el) => {
  const lab = mountLabShell(el, {
    title: 'Compress text and images',
    intro: 'Run run-length and Huffman coding on different inputs, then compress an 8×8 image block with JPEG. Compare bit counts, entropy, and the visual cost of quantization.',
    plotCols: 3,
    controls: [
      { type: 'seg', id: 'cmp-mode', label: 'Method', value: 'rle', options: [{ value: 'rle', label: 'RLE' }, { value: 'huff', label: 'Huffman' }, { value: 'jpeg', label: 'JPEG' }] },
      { type: 'select', id: 'cmp-input', label: 'Input', value: 'runs', options: [{ value: 'runs', label: 'Run-heavy' }, { value: 'random', label: 'Random' }, { value: 'text', label: 'Text' }] },
      { type: 'range', id: 'cmp-quality', label: 'JPEG quality', min: 5, max: 95, step: 5, value: 50, format: (v) => String(v) },
    ],
    plots: [
      { id: 'img1', caption: 'Original block' },
      { id: 'img2', caption: 'Reconstructed block' },
      { id: 'chart', caption: 'Bit counts / MSE', tall: true },
    ],
    readouts: [
      { id: 'ratio', label: 'Compression ratio' },
      { id: 'bits', label: 'Bits (orig → coded)' },
      { id: 'quality', label: 'Entropy / MSE' },
    ],
    custom: `<div id="huff-table" class="panel" style="margin-top:12px;display:none"><div class="callout-title">Huffman code table</div><div class="tiny mono" id="huff-table-body"></div></div>`,
    tasks: [
      'Compress the run-heavy input with RLE, then the random input. Which one expands?',
      'Compare Huffman’s average code length with the source entropy. How close is it?',
      'Lower JPEG quality. Identify the first artifact: blocking, ringing, or loss of detail?',
    ],
    note: 'RLE bit counts assume 8 bits per value and 8 bits per run length. Huffman statistics use the actual text. JPEG shows one 8×8 luminance block upscaled for visibility; the MSE curve is computed over the full quality range.',
  });
  const i1 = lab.image('img1'), i2 = lab.image('img2');
  const chart = lab.plot('chart', { xLabel: 'quality / method', yLabel: 'bits / MSE', legend: true });

  function makeBlock() {
    const block = Array.from({ length: 8 }, (_, y) => Array.from({ length: 8 }, (_, x) => {
      const v = 0.35 + 0.45 * Math.sin((x + 2) * 0.8) * Math.cos((y + 1) * 0.6);
      return clamp(v, 0, 1) * 255;
    }));
    return block;
  }
  function upscale(block) {
    const s = 12;
    const data = new Float32Array(8 * s * 8 * s);
    for (let y = 0; y < 8 * s; y++) for (let x = 0; x < 8 * s; x++) data[y * 8 * s + x] = block[Math.floor(y / s)][Math.floor(x / s)];
    return { w: 8 * s, h: 8 * s, data };
  }
  const block = makeBlock();

  function draw() {
    const mode = lab.segValue('cmp-mode');
    const input = lab.get('cmp-input');
    const quality = lab.get('cmp-quality');
    const show = (id, on) => { const c = lab.byId(id)?.closest('.control'); if (c) c.style.display = on ? '' : 'none'; };
    show('cmp-input', mode !== 'jpeg'); show('cmp-quality', mode === 'jpeg');
    const wrapImgs = [...lab.el.querySelectorAll('.plot-wrap')].slice(0, 2);
    wrapImgs.forEach((w) => { w.style.display = mode === 'jpeg' ? '' : 'none'; });
    const chartWrap = [...lab.el.querySelectorAll('.plot-wrap')][2];
    if (chartWrap) chartWrap.style.gridColumn = mode === 'jpeg' ? '' : '1 / -1';
    const labels = lab.el.querySelectorAll('.readout-item .k');
    const setLabels = (a, b, c) => { if (labels[0]) labels[0].textContent = a; if (labels[1]) labels[1].textContent = b; if (labels[2]) labels[2].textContent = c; };
    if (mode === 'rle') setLabels('Compression ratio', 'Bits (orig → coded)', 'Runs');
    else if (mode === 'huff') setLabels('Compression ratio', 'Bits (orig → coded)', 'Entropy');
    else setLabels('Approx. ratio', 'Coding', 'MSE');
    const table = lab.q('#huff-table');
    if (table) table.style.display = mode === 'huff' ? '' : 'none';
    if (mode === 'rle') {
      const values = input === 'runs' ? [...new Array(40).fill(0), ...new Array(8).fill(1), ...new Array(24).fill(0), ...new Array(3).fill(2), ...new Array(60).fill(3)]
        : input === 'random' ? Array.from({ length: 128 }, (_, i) => (i * 37 + 11) % 7)
        : [...'aaaaabbbbccccccccdddddddddd'].map((c) => c.charCodeAt(0) - 97);
      const runs = runLength(values);
      const orig = values.length * 8;
      const coded = runs.length * 16;
      chart.setData([{ type: 'bars', x: [0, 1], y: [orig, coded], color: 'var(--accent)', fill: 'var(--accent-soft)', label: 'bits' }], { xMin: -0.5, xMax: 1.5, yMin: 0, xLabels: ['raw', 'RLE'] });
      lab.readouts({ ratio: `${(orig / Math.max(1, coded)).toFixed(2)}×`, bits: `${orig} → ${coded}`, quality: `${runs.length} runs` });
    } else if (mode === 'huff') {
      const text = input === 'runs' ? 'aaaaaaaaabbbbbbbbccccccccccccdddd' : input === 'random' ? 'q7#Lm2!xR9@vT4$kP8%wN6&zB3*' : 'the quick brown fox jumps over the lazy dog';
      const h = huffman(text);
      const orig = text.length * 8;
      chart.setData([{ type: 'bars', x: [0, 1, 2], y: [orig, h.bits, h.entropy * text.length], color: 'var(--accent)', fill: 'var(--accent-soft)', label: 'bits' }], { xMin: -0.5, xMax: 2.5, yMin: 0, xLabels: ['raw', 'Huffman', 'entropy'] });
      lab.readouts({ ratio: `${(orig / Math.max(1, h.bits)).toFixed(2)}×`, bits: `${orig} → ${h.bits}`, quality: `H=${h.entropy.toFixed(2)} b/sym` });
      const body = lab.q('#huff-table-body');
      if (body) body.innerHTML = h.table.map((r) => `<div style="display:flex;gap:12px;border-bottom:1px solid var(--border);padding:2px 0"><span style="min-width:20px">${JSON.stringify(r.ch)}</span><span style="min-width:44px">${r.freq}×</span><span>${r.code}</span></div>`).join('');
    } else {
      const { recon } = jpegRoundTrip(block, quality);
      i1.setImage(normImg(upscale(block)), { alt: 'Original 8 by 8 block' });
      i2.setImage(normImg(upscale(recon)), { alt: 'JPEG reconstructed block' });
      const qs = [], mses = [];
      for (let q = 5; q <= 95; q += 5) {
        const r = jpegRoundTrip(block, q);
        const mse = r.recon.flat().reduce((s, v, i) => s + (v - block.flat()[i]) ** 2, 0) / 64;
        qs.push(q); mses.push(mse);
      }
      chart.setData([{ type: 'line', x: qs, y: mses, color: 'var(--accent)', width: 2, label: 'MSE' }], { xMin: 5, xMax: 95, yMin: 0, xLabel: 'quality', yLabel: 'MSE' });
      chart.setOverlays({ markers: [{ type: 'point', x: quality, y: mses[Math.min(mses.length - 1, Math.max(0, Math.round((quality - 5) / 5)))], color: 'var(--coral)', r: 5, label: `q=${quality}` }] });
      const mse = recon.flat().reduce((s, v, i) => s + (v - block.flat()[i]) ** 2, 0) / 64;
      lab.readouts({ ratio: `${(100 - quality) / 100 * 20 + 1.2}×`, bits: 'DCT + quant.', quality: `MSE ${mse.toFixed(1)}` });
    }
  }
  lab.onSeg('cmp-mode', draw);
  ['cmp-input', 'cmp-quality'].forEach((id) => lab.onChange(id, draw));
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 28. DSP hardware                                                    */
/* ------------------------------------------------------------------ */

registerLab('dsp-hardware', (el) => {
  const lab = mountLabShell(el, {
    title: 'Circular buffers and the MAC loop',
    intro: 'Step a circular buffer through writes and reads, then check whether a FIR filter meets its real-time deadline. The buffer is a ring of memory; the delay is a read offset, not a data shift.',
    plotCols: 2,
    controls: [
      { type: 'range', id: 'hw-size', label: 'Buffer length N', min: 4, max: 16, step: 1, value: 8, format: (v) => String(v) },
      { type: 'range', id: 'hw-delay', label: 'Read delay D', min: 1, max: 15, step: 1, value: 3, format: (v) => String(v) },
      { type: 'range', id: 'hw-taps', label: 'FIR taps', min: 16, max: 1024, step: 16, value: 128, format: (v) => String(v) },
      { type: 'select', id: 'hw-fs', label: 'Sample rate', value: '48000', options: [{ value: '8000', label: '8 kHz' }, { value: '48000', label: '48 kHz' }, { value: '96000', label: '96 kHz' }] },
      { type: 'select', id: 'hw-clock', label: 'Clock', value: '100', options: [{ value: '50', label: '50 MHz' }, { value: '100', label: '100 MHz' }, { value: '200', label: '200 MHz' }] },
      { type: 'html', html: `<div class="control" style="flex:0 1 auto;max-width:none"><label>&nbsp;</label><div class="row"><button class="btn btn-sm" data-lab-push>Write</button><button class="btn btn-sm" data-lab-play>Play</button><button class="btn btn-sm" data-lab-reset>Reset</button></div></div>` },
    ],
    plots: [
      { id: 'buffer', caption: 'Circular buffer cells (pointer and delayed read)', tall: true },
      { id: 'util', caption: 'Real-time utilization vs. taps', tall: true },
    ],
    readouts: [
      { id: 'writes', label: 'Writes' },
      { id: 'delayed', label: 'Delayed sample' },
      { id: 'util', label: 'Utilization' },
      { id: 'max', label: 'Max taps' },
    ],
    tasks: [
      'Write eight samples into a 4-cell buffer. Which values remain, and where is the pointer?',
      'Set delay 2 and verify the read offset with the highlighted cell.',
      'Raise taps until utilization exceeds 100%. What does that mean for real-time operation?',
    ],
    note: 'Buffer contents are illustrative unit samples; the utilization model assumes one MAC per cycle and ignores memory stalls. Real-time operation requires utilization below 100%, with margin for overhead and other tasks.',
  });
  const bufCanvas = lab.byId(`${lab.id}-buffer`);
  const utilPlot = lab.plot('util', { xLabel: 'FIR taps', yLabel: 'utilization', legend: true });
  let buffer = [], pointer = 0, writes = 0, timer = 0, sample = 0;

  function syncDelay() {
    const N = lab.get('hw-size');
    const input = lab.byId('hw-delay');
    if (!input) return;
    input.max = String(N - 1);
    if (Number(input.value) > N - 1) input.value = String(N - 1);
    const out = lab.q('[data-out="hw-delay"]');
    if (out) out.textContent = input.value;
  }
  function reset() {
    const N = lab.get('hw-size');
    buffer = new Array(N).fill(0);
    for (let i = 0; i < N; i++) buffer[i] = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.7));
    pointer = 0; writes = N; sample = N;
    syncDelay();
    draw();
  }
  function push() {
    const N = lab.get('hw-size');
    if (buffer.length !== N) { buffer = new Array(N).fill(0); pointer = 0; }
    buffer[pointer] = 0.35 + 0.65 * Math.abs(Math.sin(sample * 0.7));
    sample++;
    pointer = (pointer + 1) % N;
    writes++;
    draw();
  }
  function drawBuffer() {
    if (!bufCanvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = bufCanvas.clientWidth || 320, h = bufCanvas.clientHeight || 240;
    bufCanvas.width = Math.round(w * dpr); bufCanvas.height = Math.round(h * dpr);
    const ctx = bufCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = (v, f) => getComputedStyle(bufCanvas).getPropertyValue(v).trim() || f;
    const ink = css('--ink', '#1b2430'), muted = css('--muted', '#66717d'), border = css('--border', '#ddd5c6'), accent = css('--accent', '#0e6b62'), coral = css('--coral', '#c2410c'), surface = css('--surface', '#fff');
    ctx.clearRect(0, 0, w, h);
    const N = buffer.length;
    const cols = Math.min(N, 8), rows = Math.ceil(N / cols);
    const cw = Math.min(56, (w - 40) / cols), ch = Math.min(48, (h - 80) / rows);
    const startX = (w - cols * cw) / 2, startY = 40;
    const D = Math.min(N - 1, lab.get('hw-delay'));
    const readIdx = (pointer - D + N) % N;
    for (let i = 0; i < N; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const x = startX + col * cw, y = startY + row * ch;
      ctx.fillStyle = i === readIdx ? css('--accent-soft', '#dcefe9') : surface;
      ctx.strokeStyle = i === readIdx ? accent : border;
      ctx.lineWidth = i === readIdx ? 2 : 1;
      ctx.fillRect(x, y, cw - 4, ch - 4); ctx.strokeRect(x, y, cw - 4, ch - 4);
      ctx.fillStyle = ink; ctx.font = '10px "Cascadia Code", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(buffer[i].toFixed(2), x + (cw - 4) / 2, y + (ch - 4) / 2);
      if (i === pointer) {
        ctx.fillStyle = coral; ctx.font = '9px "Segoe UI", system-ui, sans-serif';
        ctx.fillText('write →', x + (cw - 4) / 2, y - 6);
      }
    }
    ctx.fillStyle = muted; ctx.font = '10px "Segoe UI", system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`N=${N} · write pointer ${pointer} · read index ${readIdx} (delay ${D})`, 8, 8);
    ctx.fillText('blue cell = delayed sample; "write →" marks the next cell', 8, 22);
    bufCanvas.setAttribute('aria-label', `Circular buffer of length ${N}. Values ${buffer.map((v) => v.toFixed(2)).join(', ')}. Write pointer ${pointer}. Delayed sample ${buffer[readIdx].toFixed(2)}.`);
  }
  function drawUtil() {
    const fs = +lab.get('hw-fs'), clk = +lab.get('hw-clock') * 1e6;
    const taps = lab.get('hw-taps');
    const util = taps * fs / clk;
    const xs = [16, 32, 64, 128, 256, 512, 1024];
    utilPlot.setData([{ type: 'line', x: xs, y: xs.map((n) => n * fs / clk), color: 'var(--accent)', width: 2, label: 'utilization' }], { xMin: 0, xMax: 1024, yMin: 0, yMax: 1.6 });
    utilPlot.setOverlays({ hlines: [{ y: 1, label: 'deadline', color: 'var(--coral)' }], markers: [{ type: 'point', x: taps, y: util, color: 'var(--coral)', r: 4, label: `${(util * 100).toFixed(0)}%` }] });
    const maxTaps = Math.floor(clk / fs);
    lab.readouts({ writes: String(writes), delayed: buffer.length ? buffer[(pointer - Math.min(buffer.length - 1, lab.get('hw-delay')) + buffer.length) % buffer.length].toFixed(2) : '—', util: `${(util * 100).toFixed(1)}%`, max: String(maxTaps) });
  }
  function draw() { drawBuffer(); drawUtil(); }
  lab.q('[data-lab-push]')?.addEventListener('click', push);
  lab.q('[data-lab-play]')?.addEventListener('click', (e) => {
    if (timer) { clearInterval(timer); timer = 0; e.target.textContent = 'Play'; return; }
    e.target.textContent = 'Pause';
    timer = setInterval(push, 500);
  });
  lab.q('[data-lab-reset]')?.addEventListener('click', () => {
    clearInterval(timer); timer = 0;
    const b = lab.q('[data-lab-play]'); if (b) b.textContent = 'Play';
    reset();
  });
  ['hw-delay', 'hw-taps'].forEach((id) => lab.onInput(id, draw));
  lab.onInput('hw-size', () => {
    clearInterval(timer); timer = 0;
    const N = lab.get('hw-size');
    buffer = new Array(N).fill(0);
    for (let i = 0; i < N; i++) buffer[i] = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.7));
    pointer = 0; writes = N; sample = N;
    syncDelay();
    draw();
  });
  ['hw-fs', 'hw-clock'].forEach((id) => lab.onChange(id, draw));
  reset();
  return () => { clearInterval(timer); lab.destroy(); };
});

/* ------------------------------------------------------------------ */
/* 29. Real-time FIR                                                   */
/* ------------------------------------------------------------------ */

registerLab('fir-real-time', (el) => {
  const lab = mountLabShell(el, {
    title: 'Size a real-time FIR audio filter',
    intro: 'Choose the tap count, cutoff, sample rate, and clock. The magnitude response shows what the filter does; the utilization plot shows whether it can finish before the next sample deadline.',
    plotCols: 2,
    controls: [
      { type: 'range', id: 'rt-taps', label: 'Taps', min: 16, max: 512, step: 16, value: 128, format: (v) => String(v) },
      { type: 'range', id: 'rt-fc', label: 'Cutoff', min: 0.05, max: 0.45, step: 0.01, value: 0.2, format: (v) => fmt(v, 2) },
      { type: 'select', id: 'rt-fs', label: 'Sample rate', value: '48000', options: [{ value: '8000', label: '8 kHz' }, { value: '44100', label: '44.1 kHz' }, { value: '48000', label: '48 kHz' }, { value: '96000', label: '96 kHz' }] },
      { type: 'select', id: 'rt-clock', label: 'Clock', value: '100', options: [{ value: '50', label: '50 MHz' }, { value: '100', label: '100 MHz' }, { value: '200', label: '200 MHz' }] },
    ],
    plots: [
      { id: 'mag', caption: 'FIR magnitude response (dB)', tall: true },
      { id: 'util', caption: 'Utilization vs. taps', tall: true },
    ],
    readouts: [
      { id: 'macs', label: 'MACs / second' },
      { id: 'util', label: 'Utilization' },
      { id: 'lat', label: 'Group delay' },
      { id: 'max', label: 'Max taps' },
    ],
    tasks: [
      'At 48 kHz and 100 MHz, how many 128-tap mono filters can this DSP run?',
      'Raise the tap count until utilization exceeds 100%. What is the maximum feasible tap count?',
      'The group delay is M/2 samples. Convert it to milliseconds and decide whether it is acceptable for live monitoring.',
    ],
    note: 'Utilization = taps × f_s / clock, assuming one MAC per cycle and no memory stalls. Real code needs margin for loads, stores, interrupts, and other processing. The FIR kernel is a normalized Blackman-windowed sinc.',
  });
  const magPlot = lab.plot('mag', { xLabel: 'frequency (cycles/sample)', yLabel: 'dB', yMin: -100, yMax: 5 });
  const utilPlot = lab.plot('util', { xLabel: 'taps', yLabel: 'utilization', legend: true });

  function draw() {
    const taps = lab.get('rt-taps');
    const fc = lab.get('rt-fc');
    const fs = +lab.get('rt-fs');
    const clk = +lab.get('rt-clock') * 1e6;
    const h = windowedSinc(taps, fc, 'blackman');
    const H = freqResponse(h, [1], 900);
    const util = taps * fs / clk;
    magPlot.setData([{ type: 'line', x: H.freq, y: H.db, color: 'var(--accent)', width: 1.8, label: `${taps}-tap FIR` }], { xMin: 0, xMax: 0.5 });
    const xs = [16, 32, 64, 128, 256, 512];
    utilPlot.setData([{ type: 'line', x: xs, y: xs.map((n) => n * fs / clk), color: 'var(--accent)', width: 2, label: 'utilization' }], { xMin: 0, xMax: 512, yMin: 0, yMax: Math.max(1.2, taps * fs / clk * 1.2) });    utilPlot.setOverlays({ hlines: [{ y: 1, label: 'deadline', color: 'var(--coral)' }], markers: [{ type: 'point', x: taps, y: util, color: 'var(--coral)', r: 4, label: `${(util * 100).toFixed(0)}%` }] });
    lab.readouts({
      macs: `${(taps * fs / 1e6).toFixed(2)} M`,
      util: `${(util * 100).toFixed(1)}%`,
      lat: `${(taps / 2 / fs * 1000).toFixed(2)} ms`,
      max: String(Math.floor(clk / fs)),
    });
  }
  ['rt-taps', 'rt-fc'].forEach((id) => lab.onInput(id, draw));
  ['rt-fs', 'rt-clock'].forEach((id) => lab.onChange(id, draw));
  draw();
  return () => lab.destroy();
});
