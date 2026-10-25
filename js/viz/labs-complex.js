/** Complex techniques labs (chapters 30–33). */

import {
  dft, realDft, freqResponse, applyIir, impulseResponse, stepResponse,
  cheby1Cutoff3, butterworth, poleZero, clamp, mean,
} from '../dsp.js';
import { mountLabShell, sine, fmt } from './lab-kit.js';
import { registerLab } from './lab-registry.js';

/* ------------------------------------------------------------------ */
/* 30. Complex numbers                                                 */
/* ------------------------------------------------------------------ */

registerLab('complex', (el) => {
  const lab = mountLabShell(el, {
    title: 'Rotate, multiply, and filter',
    intro: 'Explore the complex plane. Change two complex numbers, apply an operation, and see the result as a point, a magnitude, and a phase. The right panel shows the real sinusoid represented by a phasor.',
    plotCols: 2,
    controls: [
      { type: 'range', id: 'cx-a', label: 'z₁ real', min: -2, max: 2, step: 0.1, value: 1, format: (v) => fmt(v, 1) },
      { type: 'range', id: 'cx-b', label: 'z₁ imag', min: -2, max: 2, step: 0.1, value: 1, format: (v) => fmt(v, 1) },
      { type: 'range', id: 'cx-c', label: 'z₂ real', min: -2, max: 2, step: 0.1, value: -0.5, format: (v) => fmt(v, 1) },
      { type: 'range', id: 'cx-d', label: 'z₂ imag', min: -2, max: 2, step: 0.1, value: 0.8, format: (v) => fmt(v, 1) },
      { type: 'select', id: 'cx-op', label: 'Operation', value: 'multiply', options: [
        { value: 'add', label: 'z₁ + z₂' }, { value: 'sub', label: 'z₁ − z₂' }, { value: 'multiply', label: 'z₁ × z₂' }, { value: 'divide', label: 'z₁ ÷ z₂' }, { value: 'conj', label: 'conjugate z₁' }, { value: 'power', label: 'z₁²' },
      ] },
    ],
    plots: [
      { id: 'plane', caption: 'Complex plane: inputs and result', tall: true },
      { id: 'wave', caption: 'Real part of the phasor as it rotates', tall: true },
    ],
    readouts: [
      { id: 'z1', label: 'z₁ magnitude / phase' },
      { id: 'res', label: 'Result' },
      { id: 'identity', label: 'Check' },
    ],
    tasks: [
      'Multiply by j (set z₂=0+j). What happens to the angle and magnitude?',
      'Set z₂ to the conjugate of z₁. What is the product? Why?',
      'Move z₁ into each quadrant and check the atan2 phase.',
    ],
    note: 'The complex plane is drawn with equal data ranges but not necessarily equal pixel aspect. Phase is shown in radians and degrees. The waveform uses the real part of z₁·e^{jωn}; the result does not change the waveform, which isolates the interpretation of a phasor.',
  });
  const plane = lab.plot('plane', { xLabel: 'real', yLabel: 'imaginary', legend: true, xMin: -3, xMax: 3, yMin: -3, yMax: 3 });
  const wave = lab.plot('wave', { xLabel: 'sample', yLabel: 'amplitude', legend: true });
  const circle = Array.from({ length: 121 }, (_, i) => [Math.cos(2 * Math.PI * i / 120), Math.sin(2 * Math.PI * i / 120)]);

  function draw() {
    const a = lab.get('cx-a'), b = lab.get('cx-b'), c = lab.get('cx-c'), d = lab.get('cx-d');
    const op = lab.get('cx-op');
    const z1 = { re: a, im: b }, z2 = { re: c, im: d };
    let r;
    if (op === 'add') r = { re: a + c, im: b + d };
    else if (op === 'sub') r = { re: a - c, im: b - d };
    else if (op === 'multiply') r = { re: a * c - b * d, im: a * d + b * c };
    else if (op === 'divide') { const den = c * c + d * d || 1e-9; r = { re: (a * c + b * d) / den, im: (b * c - a * d) / den }; }
    else if (op === 'conj') r = { re: a, im: -b };
    else r = { re: a * a - b * b, im: 2 * a * b };
    const series = [
      { type: 'line', x: circle.map((p) => p[0]), y: circle.map((p) => p[1]), color: 'var(--border-strong)', width: 1, dash: [3, 3], label: 'unit circle' },
      { type: 'points', x: [a, c, r.re], y: [b, d, r.im], color: 'var(--accent)', label: 'points' },
      { type: 'line', x: [0, r.re], y: [0, r.im], color: 'var(--coral)', width: 2, label: 'result vector' },
    ];
    plane.setData(series, { xMin: -3, xMax: 3, yMin: -3, yMax: 3 });
    plane.setOverlays({ hlines: [{ y: 0, color: 'var(--border-strong)', dash: [] }], vlines: [{ x: 0, color: 'var(--border-strong)', dash: [] }], markers: [
      { type: 'point', x: a, y: b, color: 'var(--accent)', r: 5, label: 'z₁' },
      { type: 'point', x: c, y: d, color: 'var(--blue)', r: 5, label: 'z₂' },
      { type: 'point', x: r.re, y: r.im, color: 'var(--coral)', r: 6, label: 'result' },
    ] });
    const n = 128;
    const w = 0.15;
    const phasor = (z) => Array.from({ length: n }, (_, i) => z.re * Math.cos(w * i) - z.im * Math.sin(w * i));
    wave.setData([
      { type: 'line', x: Array.from({ length: n }, (_, i) => i), y: phasor(z1), color: 'var(--accent)', width: 1.7, label: 'Re{z₁e^{jωn}}' },
    ], { xMin: 0, xMax: n - 1, yMin: -2.2, yMax: 2.2 });
    const mag = (z) => Math.hypot(z.re, z.im);
    const ph = (z) => Math.atan2(z.im, z.re);
    const z1s = `${mag(z1).toFixed(2)} ∠ ${ph(z1).toFixed(2)} rad`;
    lab.readouts({
      z1: z1s,
      res: `${r.re.toFixed(2)} ${r.im >= 0 ? '+' : '−'} j${Math.abs(r.im).toFixed(2)} · ${mag(r).toFixed(2)}∠${ph(r).toFixed(2)}`,
      identity: op === 'multiply' ? `|z₁z₂|=${mag(z1) * mag(z2) >= 0 ? (mag(z1) * mag(z2)).toFixed(2) : '—'}` : op === 'divide' ? `|z₁/z₂|=${(mag(z1) / (mag(z2) || 1)).toFixed(2)}` : '—',
    });
  }
  ['cx-a', 'cx-b', 'cx-c', 'cx-d'].forEach((id) => lab.onInput(id, draw));
  lab.onChange('cx-op', draw);
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 31. Complex DFT                                                     */
/* ------------------------------------------------------------------ */

registerLab('complex-dft', (el) => {
  const lab = mountLabShell(el, {
    title: 'The complex spectrum, including negative frequencies',
    intro: 'Transform real and complex signals with the complex DFT. A real cosine produces a conjugate pair; a complex exponential produces a single peak. Inspect magnitude and phase on a centered frequency axis.',
    plotCols: 2,
    controls: [
      { type: 'select', id: 'cd-signal', label: 'Signal', value: 'cos', options: [
        { value: 'cos', label: 'Real cosine' }, { value: 'exp', label: 'Complex exponential' }, { value: 'mixed', label: 'Real two-tone' }, { value: 'complex', label: 'Complex two-tone' },
      ] },
      { type: 'range', id: 'cd-k', label: 'Bin k', min: 1, max: 30, step: 1, value: 5, format: (v) => `k=${v}` },
      { type: 'range', id: 'cd-amp', label: 'Amplitude', min: 0.1, max: 1, step: 0.05, value: 1, format: (v) => fmt(v, 2) },
      { type: 'range', id: 'cd-phase', label: 'Phase', min: -3.14, max: 3.14, step: 0.05, value: 0, format: (v) => `${v.toFixed(2)}` },
    ],
    plots: [
      { id: 'time', caption: 'Real part of the signal', tall: true },
      { id: 'spec', caption: 'Centered complex DFT magnitude', tall: true },
    ],
    readouts: [
      { id: 'bins', label: 'Nonzero bins' },
      { id: 'sym', label: 'Conjugate symmetry' },
      { id: 'energy', label: 'Parseval ratio' },
    ],
    tasks: [
      'Transform a real cosine. Where are the two peaks? What happens to the phase?',
      'Switch to a complex exponential. Why is there only one peak?',
      'Check Parseval’s ratio. Does it equal one with the chosen scaling?',
    ],
    note: 'N=64. The display is centered by shifting bins k>N/2 to negative frequencies. The complex DFT uses the e^{−j2πkn/N} convention and inverse scale 1/N. Magnitude is shown per N; phase is not displayed to avoid clutter.',
  });
  const timePlot = lab.plot('time', { xLabel: 'sample n', yLabel: 'amplitude', legend: true });
  const specPlot = lab.plot('spec', { xLabel: 'frequency (cycles/sample)', yLabel: '|X|/N', legend: true });
  const N = 64;

  function draw() {
    const kind = lab.get('cd-signal');
    const k = lab.get('cd-k');
    const amp = lab.get('cd-amp');
    const phase = lab.get('cd-phase');
    let re = new Array(N).fill(0), im = new Array(N).fill(0);
    if (kind === 'cos') re = Array.from({ length: N }, (_, n) => amp * Math.cos(2 * Math.PI * k * n / N + phase));
    else if (kind === 'exp') re = Array.from({ length: N }, (_, n) => amp * Math.cos(2 * Math.PI * k * n / N + phase)), im = Array.from({ length: N }, (_, n) => amp * Math.sin(2 * Math.PI * k * n / N + phase));
    else if (kind === 'mixed') re = Array.from({ length: N }, (_, n) => amp * Math.cos(2 * Math.PI * k * n / N) + 0.5 * amp * Math.cos(2 * Math.PI * (k + 4) * n / N));
    else {
      const k2 = Math.min(N - 1, k + 4);
      re = Array.from({ length: N }, (_, n) => amp * Math.cos(2 * Math.PI * k * n / N) + 0.4 * amp * Math.cos(2 * Math.PI * k2 * n / N));
      im = Array.from({ length: N }, (_, n) => amp * Math.sin(2 * Math.PI * k * n / N) + 0.4 * amp * Math.sin(2 * Math.PI * k2 * n / N));
    }
    const X = dft(re, im);
    const freqs = [], mags = [];
    for (let i = 0; i < N; i++) {
      const kk = i < N / 2 ? i : i - N;
      freqs.push(kk / N); mags.push(Math.hypot(X.re[i], X.im[i]) / N);
    }
    // sort by frequency for a continuous line
    const order = freqs.map((f, i) => ({ f, m: mags[i] })).sort((a, b) => a.f - b.f);
    timePlot.setData([
      { type: 'line', y: re, color: 'var(--accent)', width: 1.7, label: 'Re{x}' },
      ...(im.some((v) => Math.abs(v) > 1e-9) ? [{ type: 'line', y: im, color: 'var(--coral)', width: 1.2, label: 'Im{x}', dash: [4, 3] }] : []),
    ], { xMin: 0, xMax: N - 1 });
    specPlot.setData([{ type: 'line', x: order.map((o) => o.f), y: order.map((o) => o.m), color: 'var(--accent)', width: 1.8, label: '|X|/N' }], { xMin: -0.5, xMax: 0.5, yMin: 0 });
    const nonzero = order.filter((o) => o.m > 0.01).map((o) => `k=${Math.round(o.f * N)}`).join(', ');
    const energyT = re.reduce((s, v, i) => s + v * v + im[i] * im[i], 0);
    const energyF = X.re.reduce((s, v, i) => s + (v * v + X.im[i] * X.im[i]) / N, 0);
    lab.readouts({
      bins: nonzero || '—',
      sym: kind === 'cos' || kind === 'mixed' ? 'yes (real input)' : 'no (complex input)',
      energy: (energyF / (energyT || 1)).toFixed(3),
    });
  }
  lab.onChange('cd-signal', draw);
  ['cd-k', 'cd-amp', 'cd-phase'].forEach((id) => lab.onInput(id, draw));
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 32. Laplace                                                         */
/* ------------------------------------------------------------------ */

registerLab('laplace', (el) => {
  const lab = mountLabShell(el, {
    title: 'Poles, zeros, and the s-plane',
    intro: 'Move a real pole and zero in the s-plane. The magnitude response peaks near poles and dips near zeros; the step response shows the natural mode. A pole in the right half-plane is unstable.',
    plotCols: 3,
    controls: [
      { type: 'range', id: 'lp-pole', label: 'Pole at s = −p', min: -2, max: 5, step: 0.1, value: 1.5, format: (v) => v.toFixed(1) },
      { type: 'range', id: 'lp-zero', label: 'Zero at s = −z', min: 0, max: 5, step: 0.1, value: 0.5, format: (v) => v.toFixed(1) },
      { type: 'range', id: 'lp-gain', label: 'Gain K', min: 0.2, max: 3, step: 0.1, value: 1, format: (v) => fmt(v, 1) },
    ],
    plots: [
      { id: 'plane', caption: 's-plane: pole × and zero ○', tall: true },
      { id: 'mag', caption: '|H(jω)| in dB', tall: true },
      { id: 'step', caption: 'Step response', tall: true },
    ],
    readouts: [
      { id: 'loc', label: 'Pole / zero' },
      { id: 'dc', label: 'DC gain' },
      { id: 'stable', label: 'Stability' },
    ],
    tasks: [
      'Move the pole to the right half-plane. What happens to the step response?',
      'Place the zero at the same location as the pole. What happens to the response?',
      'Move the pole closer to the imaginary axis. How does the peak sharpen?',
    ],
    note: 'The system is first-order: H(s)=K(s+z)/(s+p), with real pole −p and zero −z. The step response is analytic; the frequency response is evaluated along s=jω. Pole-zero cancellation is exact only if the locations match.',
  });
  const plane = lab.plot('plane', { xLabel: 'real', yLabel: 'imaginary', xMin: -3, xMax: 6, yMin: -0.5, yMax: 0.5, legend: true });
  const magPlot = lab.plot('mag', { xLabel: 'ω (rad/s)', yLabel: 'dB', yMin: -60, yMax: 20 });
  const stepPlot = lab.plot('step', { xLabel: 'time', yLabel: 'amplitude' });

  function draw() {
    const p = lab.get('lp-pole');
    const z = lab.get('lp-zero');
    const K = lab.get('lp-gain');
    plane.setData([{ type: 'line', x: [-3, 6], y: [0, 0], color: 'var(--border-strong)', width: 1, dash: [3, 3], label: 'jω axis' }], { xMin: -3, xMax: 6, yMin: -0.5, yMax: 0.5 });
    plane.setOverlays({ vlines: [{ x: 0, label: 'jω', color: 'var(--border-strong)' }], markers: [
      { type: 'point', x: -p, y: 0, color: 'var(--coral)', r: 7, label: 'pole' },
      { type: 'point', x: -z, y: 0, color: 'var(--accent)', r: 6, label: 'zero' },
    ] });
    const w = Array.from({ length: 500 }, (_, i) => 0.01 + i * 0.02);
    const H = w.map((ww) => {
      const numRe = K * z, numIm = K * ww;
      const denRe = p, denIm = ww;
      const d = denRe * denRe + denIm * denIm;
      return { re: (numRe * denRe + numIm * denIm) / d, im: (numIm * denRe - numRe * denIm) / d };
    });
    const mag = H.map((v) => 20 * Math.log10(Math.max(1e-9, Math.hypot(v.re, v.im))));
    magPlot.setData([{ type: 'line', x: w, y: mag, color: 'var(--accent)', width: 1.8, label: '|H|' }], { xMin: 0, xMax: 10, yMin: -60, yMax: Math.max(20, ...mag) });
    const t = Array.from({ length: 300 }, (_, i) => i * 0.02);
    const step = t.map((tt) => p !== 0 ? K * (z / p + (p - z) / p * Math.exp(-p * tt)) : K * (1 + z * tt));
    stepPlot.setData([{ type: 'line', x: t, y: step.map((v) => clamp(v, -10, 10)), color: 'var(--accent)', width: 1.8, label: 'step' }], { xMin: 0, xMax: t[t.length - 1], yMin: -2, yMax: 3 });
    lab.readouts({
      loc: `p=${p.toFixed(1)}, z=${z.toFixed(1)}`,
      dc: `${(20 * Math.log10(Math.abs(K * z / p))).toFixed(1)} dB`,
      stable: p > 0 ? 'stable' : p === 0 ? 'marginal' : 'UNSTABLE',
    });
  }
  ['lp-pole', 'lp-zero', 'lp-gain'].forEach((id) => lab.onInput(id, draw));
  draw();
  return () => lab.destroy();
});

/* ------------------------------------------------------------------ */
/* 33. z-plane                                                         */
/* ------------------------------------------------------------------ */

registerLab('zplane', (el) => {
  const lab = mountLabShell(el, {
    title: 'Poles, zeros, and digital stability',
    intro: 'Place a complex-conjugate pole pair and a zero in the z-plane. The unit circle is the frequency axis; poles inside it decay, outside it grow. Inspect the magnitude response and impulse response.',
    plotCols: 3,
    controls: [
      { type: 'range', id: 'zp-radius', label: 'Pole radius r', min: 0.3, max: 1.15, step: 0.01, value: 0.9, format: (v) => v.toFixed(2) },
      { type: 'range', id: 'zp-angle', label: 'Pole angle θ', min: 0, max: 3.14, step: 0.02, value: 0.8, format: (v) => v.toFixed(2) },
      { type: 'range', id: 'zp-zero', label: 'Zero radius', min: 0, max: 1.2, step: 0.01, value: 0.6, format: (v) => v.toFixed(2) },
      { type: 'range', id: 'zp-gain', label: 'Gain K', min: 0.1, max: 2, step: 0.05, value: 1, format: (v) => fmt(v, 2) },
    ],
    plots: [
      { id: 'plane', caption: 'z-plane: unit circle, poles, zero', tall: true },
      { id: 'mag', caption: '|H(e^{jω})| in dB', tall: true },
      { id: 'imp', caption: 'Impulse response', tall: true },
    ],
    readouts: [
      { id: 'pole', label: 'Pole radius / angle' },
      { id: 'peak', label: 'Peak frequency' },
      { id: 'stable', label: 'Stability' },
    ],
    tasks: [
      'Move the pole outside the unit circle. What happens to the impulse response?',
      'Set θ=0. How does the resonance move?',
      'Move the zero onto the unit circle. Which frequency is blocked?',
    ],
    note: 'The denominator is 1−2r cosθ z⁻¹+r²z⁻²; the numerator is K(1−z₀z⁻¹). The unit circle is the digital frequency axis. A pole outside the unit circle is unstable for a causal system. The z-plane is drawn with equal data ranges to preserve the circle shape.',
  });
  const planeCanvas = lab.byId(`${lab.id}-plane`);
  const magPlot = lab.plot('mag', { xLabel: 'frequency (cycles/sample)', yLabel: 'dB', yMin: -60, yMax: 30 });
  const impPlot = lab.plot('imp', { xLabel: 'sample', yLabel: 'h[n]' });

  function drawPlane(b, a) {
    if (!planeCanvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = planeCanvas.clientWidth || 250, h = planeCanvas.clientHeight || 260;
    planeCanvas.width = Math.round(w * dpr); planeCanvas.height = Math.round(h * dpr);
    const ctx = planeCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = (v, f) => getComputedStyle(planeCanvas).getPropertyValue(v).trim() || f;
    const ink = css('--ink', '#1b2430'), muted = css('--muted', '#66717d'), border = css('--border', '#ddd5c6'), accent = css('--accent', '#0e6b62'), coral = css('--coral', '#c2410c');
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.38;
    ctx.strokeStyle = border; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(12, cy); ctx.lineTo(w - 12, cy); ctx.moveTo(cx, 10); ctx.lineTo(cx, h - 10); ctx.stroke();
    ctx.strokeStyle = muted; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    const { poles, zeros } = poleZero(b, a);
    const drawMarker = (p, color, isPole) => {
      const x = cx + p.re * R, y = cy - p.im * R;
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
      if (isPole) { ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.stroke(); }
    };
    zeros.forEach((p) => drawMarker(p, accent, false));
    poles.forEach((p) => drawMarker(p, coral, true));
    ctx.fillStyle = ink; ctx.font = '10px "Segoe UI", system-ui, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('× pole', 8, 14); ctx.fillStyle = accent; ctx.fillText('○ zero', 8, 27);
    ctx.fillStyle = muted; ctx.fillText('|z|=1', w - 46, cy - R - 6);
    planeCanvas.setAttribute('aria-label', `z-plane. Poles ${poles.map((p) => `${p.re.toFixed(2)} plus j ${p.im.toFixed(2)}`).join('; ')}. Zeros ${zeros.map((p) => `${p.re.toFixed(2)} plus j ${p.im.toFixed(2)}`).join('; ')}.`);
  }

  function draw() {
    const r = lab.get('zp-radius');
    const th = lab.get('zp-angle');
    const z0 = lab.get('zp-zero');
    const K = lab.get('zp-gain');
    const b = [K, -K * z0];
    const a = [1, -2 * r * Math.cos(th), r * r];
    const H = freqResponse(b, a, 900);
    const imp = impulseResponse(b, a, 120).map((v) => (Number.isFinite(v) ? v : 0));
    magPlot.setData([{ type: 'line', x: H.freq, y: H.db, color: 'var(--accent)', width: 1.8, label: '|H|' }], { xMin: 0, xMax: 0.5 });
    const lim = Math.max(1e-3, Math.min(10, Math.max(...imp.map(Math.abs))));
    impPlot.setData([{ type: 'line', x: Array.from({ length: imp.length }, (_, i) => i), y: imp.map((v) => clamp(v, -lim, lim)), color: 'var(--coral)', width: 1.6, label: 'h[n]' }], { xMin: 0, xMax: imp.length - 1 });
    drawPlane(b, a);
    let peak = '—';
    for (let i = 1; i < H.db.length; i++) if (H.db[i] > H.db[i - 1] && H.db[i] >= H.db[i + 1]) { peak = H.freq[i].toFixed(3); break; }
    lab.readouts({
      pole: `${r.toFixed(2)} ∠ ${th.toFixed(2)}`,
      peak,
      stable: r < 1 ? 'stable' : r === 1 ? 'marginal' : 'UNSTABLE',
    });
  }
  ['zp-radius', 'zp-angle', 'zp-zero', 'zp-gain'].forEach((id) => lab.onInput(id, draw));
  draw();
  return () => lab.destroy();
});
