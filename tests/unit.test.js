import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dft, fft, realDft, spectrum, inverseRealDft, convolve, fftConvolve, overlapAdd,
  correlate, movingAverage, windowedSinc, freqResponse, singlePole, applyIir,
  cheby1, cheby1Cutoff3, butterworth, poleZero, quantize, quantizationSnrDb, histogram, mean, std,
  huffman, runLength, lzw, dct2d, idct2d, jpegRoundTrip, phantom, radon, backproject,
  trainPerceptron, circularBufferWrite, gaussianNoise, muLawEncode, muLawDecode, sinc,
  fft2, imageSpectrum,
} from '../js/dsp.js';

const approx = (a, b, eps = 1e-8, msg = '') =>
  assert.ok(Math.abs(a - b) < eps, `${msg} expected ${b}, got ${a}`);

test('DFT and radix-2 FFT agree', () => {
  const x = Array.from({ length: 16 }, (_, n) => Math.sin(2 * Math.PI * 3 * n / 16) + 0.4 * Math.cos(2 * Math.PI * 7 * n / 16));
  const a = dft(x), b = fft(x);
  for (let k = 0; k < 16; k++) {
    approx(a.re[k], b.re[k], 1e-9, `re ${k}`);
    approx(a.im[k], b.im[k], 1e-9, `im ${k}`);
  }
});

test('FFT inverse reconstructs signal', () => {
  const x = [1, -2, 0.5, 3, 1, 0, -1, 2];
  const X = fft(x);
  const y = fft(X.re, X.im, true).re;
  x.forEach((v, i) => approx(y[i], v, 1e-9, `sample ${i}`));
});

test('real DFT of a bin-centred cosine has two one-sided peaks', () => {
  const N = 64, k0 = 7;
  const x = Array.from({ length: N }, (_, n) => Math.cos(2 * Math.PI * k0 * n / N));
  const S = realDft(x);
  approx(S.mag[k0], N / 2, 1e-8, 'positive bin');
  approx(S.mag[0], 0, 1e-8, 'DC');
});

test('inverse real DFT from book format round-trips', () => {
  const x = [0, 1, 2, 1, 0, -1, -2, -1];
  const S = realDft(x);
  const y = inverseRealDft(S.re, S.im, 8);
  x.forEach((v, i) => approx(y[i], v, 1e-9, `sample ${i}`));
});

test('Parseval: energy is preserved by the DFT', () => {
  const x = [1, 2, -1, 0, 3, -2, 0.5, 1];
  const X = fft(x);
  const timeE = x.reduce((s, v) => s + v * v, 0);
  const freqE = X.re.reduce((s, v, k) => s + (v * v + X.im[k] * X.im[k]) / x.length, 0);
  approx(freqE, timeE, 1e-9, 'energy');
});

test('direct and FFT convolution agree', () => {
  const x = Array.from({ length: 37 }, (_, i) => Math.sin(i / 4));
  const h = [0.1, 0.2, 0.4, 0.2, 0.1];
  const a = convolve(x, h), b = fftConvolve(x, h);
  assert.equal(a.length, b.length);
  a.forEach((v, i) => approx(b[i], v, 1e-8, `n=${i}`));
});

test('overlap-add equals full convolution', () => {
  const x = Array.from({ length: 100 }, (_, i) => Math.cos(i / 3));
  const h = [0.2, -0.1, 0.7, 0.3];
  const ref = convolve(x, h);
  const oa = overlapAdd(x, h, 16);
  assert.equal(oa.blocks.length, Math.ceil(100 / 16));
  oa.y.forEach((v, i) => approx(v, ref[i], 1e-9, `n=${i}`));
});

test('correlation detects a shifted feature', () => {
  const x = [0, 0, 1, 2, 3, 0, 0];
  const y = correlate(x, [1, 2, 3]);
  const max = Math.max(...y);
  assert.ok(max > 13.9 && max <= 14.01, `peak ${max}`);
});

test('moving average DC gain is one', () => {
  const x = new Array(50).fill(1);
  const { y } = movingAverage(x, 5);
  approx(y[20], 1, 1e-12, 'DC');
});

test('windowed-sinc has unit DC gain, symmetry, and 0.5 cutoff', () => {
  const h = windowedSinc(100, 0.2, 'blackman');
  approx(h.reduce((s, v) => s + v, 0), 1, 1e-10, 'DC gain');
  for (let i = 0; i < 50; i++) approx(h[i], h[100 - i], 1e-12, `symmetry ${i}`);
  approx(h[50], 2 * 0.2, 1e-3, 'centre value');
  const H = freqResponse(h, [1], 501);
  const atCut = H.mag[200]; // f=0.2
  approx(atCut, 0.5, 0.03, 'half-amplitude cutoff');
});

test('single-pole low-pass matches its analytic cutoff and time constant', () => {
  const fc = -Math.log(0.9) / (2 * Math.PI);
  const { b, a, x } = singlePole(fc);
  approx(x, 0.9, 1e-12, 'decay');
  const H = freqResponse(b, a, 2001);
  const idx = Math.round(fc / (0.5 / 2000));
  approx(H.mag[idx], 1 / Math.SQRT2, 0.02, '3 dB point');
  const imp = applyIir([1, ...new Array(200).fill(0)], b, a);
  const d = -1 / Math.log(x);
  approx(d, 9.49, 0.01, 'time constant');
  approx(imp[9] / imp[0], 0.9 ** 9, 1e-12, 'discrete decay');
  approx(imp[9] / imp[0], 1 / Math.E, 0.03, '36.8% near one time constant');
});

test('Chebyshev-I has correct DC, cutoff ripple and stable poles', () => {
  for (const [n, ripple] of [[2, 0.5], [4, 1], [6, 3]]) {
    const { b, a } = cheby1(n, ripple, 0.2);
    const H = freqResponse(b, a, 4001);
    const expectedDc = n % 2 === 0 ? -ripple : 0;
    approx(H.db[0], expectedDc, 0.05, `DC n=${n}`);
    const idx = Math.round(0.2 / (0.5 / 4000));
    approx(H.db[idx], -ripple, 0.35, `cutoff ripple n=${n}`);
    const { poles } = poleZero(b, a);
    for (const p of poles) assert.ok(Math.hypot(p.re, p.im) < 1.0001, `pole outside unit circle n=${n}`);
  }
});

test('Butterworth is -3 dB at its cutoff', () => {
  const { b, a } = butterworth(4, 0.15);
  const H = freqResponse(b, a, 6001);
  approx(H.db[0], 0, 0.01, 'DC');
  const idx = Math.round(0.15 / (0.5 / 6000));
  approx(H.db[idx], -3.0103, 0.3, 'cutoff');
});

test('quantizer error stays within half an LSB', () => {
  const x = Array.from({ length: 1000 }, (_, i) => Math.sin(i * 0.07));
  const { q, err, step, levels } = quantize(x, 4, -1, 1);
  assert.equal(levels, 16);
  for (const e of err) assert.ok(Math.abs(e) <= step / 2 + 1e-12);
  approx(step, 0.125, 1e-12, 'step');
});

test('uniform quantization of a full-scale sine approaches 6.02N+1.76 dB', () => {
  const N = 4096;
  const x = Array.from({ length: N }, (_, i) => Math.sin(2 * Math.PI * 31 * i / N));
  const { err } = quantize(x, 8, -1, 1);
  const noise = Math.sqrt(err.reduce((s, e) => s + e * e, 0) / err.length);
  const snr = 20 * Math.log10((1 / Math.SQRT2) / noise);
  approx(snr, quantizationSnrDb(8), 1.5, 'SNR');
});

test('statistics and histogram are consistent', () => {
  const x = [1, 2, 3, 4];
  approx(mean(x), 2.5, 1e-12);
  approx(std(x), Math.sqrt(1.25), 1e-12);
  const h = histogram(x, 4, 1, 5);
  assert.equal(h.counts.reduce((s, v) => s + v, 0), 4);
});

test('Huffman codes are prefix-free and lossless', () => {
  const text = 'this is an example of huffman coding';
  const { table, encoded, bits } = huffman(text);
  const map = new Map(table.map((r) => [r.ch, r.code]));
  const decoded = [];
  let cur = '';
  for (const bit of encoded) {
    cur += bit;
    if (map.has([...map.keys()].find((c) => map.get(c) === cur))) {
      decoded.push([...map.keys()].find((c) => map.get(c) === cur));
      cur = '';
    }
  }
  assert.equal(decoded.join(''), text);
  assert.equal(encoded.length, bits);
  for (const a of table) for (const b of table) {
    if (a !== b) assert.ok(!b.code.startsWith(a.code), `${a.code} is a prefix of ${b.code}`);
  }
});

test('RLE compresses runs and LZW round-trips conceptually', () => {
  const runs = runLength([1, 1, 1, 2, 2, 3]);
  assert.equal(runs.length, 3);
  assert.deepEqual(runs[0], { value: 1, length: 3 });
  const l = lzw('abababab');
  assert.ok(l.codes.length > 0 && l.dictionarySize > 2);
});

test('2-D DCT / inverse DCT round-trips', () => {
  const block = Array.from({ length: 8 }, (_, y) => Array.from({ length: 8 }, (_, x) => Math.sin(x / 2) + Math.cos(y / 3)));
  const c = dct2d(block);
  const r = idct2d(c);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) approx(r[y][x], block[y][x], 1e-9, `${x},${y}`);
});

test('JPEG round-trip preserves block mean and reduces error at higher quality', () => {
  const block = Array.from({ length: 8 }, (_, y) => Array.from({ length: 8 }, (_, x) => 128 + 90 * Math.sin(x / 2 + y / 3)));
  const lo = jpegRoundTrip(block, 10), hi = jpegRoundTrip(block, 90);
  const mse = (r) => r.recon.flat().reduce((s, v, i) => s + (v - block.flat()[i]) ** 2, 0) / 64;
  assert.ok(mse(hi) < mse(lo), 'higher quality should reduce MSE');
  approx(hi.recon.flat().reduce((s, v) => s + v, 0) / 64, block.flat().reduce((s, v) => s + v, 0) / 64, 1.0);
});

test('CT phantom projections and backprojection have plausible dimensions', () => {
  const img = phantom(32);
  const { projections, d } = radon(img, 12);
  assert.equal(projections.length, 12);
  assert.ok(d >= 32);
  const bp = backproject(projections, 32, false);
  assert.equal(bp.data.length, 32 * 32);
  assert.ok(Math.max(...bp.data) > 0);
});

test('perceptron learns a linearly separable problem', () => {
  const pts = [], labels = [];
  for (let i = 0; i < 40; i++) {
    const x = (i % 8) / 4 - 1, y = Math.floor(i / 8) / 4 - 1;
    pts.push([x, y]); labels.push(x + y > 0 ? 1 : -1);
  }
  const r = trainPerceptron(pts, labels, { epochs: 100, lr: 0.05 });
  assert.equal(r.history.at(-1).errors, 0);
});

test('circular buffer wraps and overwrites correctly', () => {
  let s = { buffer: [0, 0, 0], pointer: 0, writes: 0 };
  s = circularBufferWrite(s, 7, 3);
  s = circularBufferWrite(s, 8, 3);
  s = circularBufferWrite(s, 9, 3);
  s = circularBufferWrite(s, 10, 3);
  assert.deepEqual(s.buffer, [10, 8, 9]);
  assert.equal(s.pointer, 1);
});

test('noise generators are repeatable and mu-law round-trips', () => {
  assert.deepEqual(gaussianNoise(5, 1, 42), gaussianNoise(5, 1, 42));
  for (const v of [-0.9, -0.2, 0, 0.3, 1]) approx(muLawDecode(muLawEncode(v)), v, 1e-9, 'mu-law');
});

test('sinc handles the removable singularity', () => {
  approx(sinc(0), 1, 1e-15);
  approx(sinc(1), 0, 1e-15);
});

test('Chebyshev cutoff solver hits −3 dB at the requested frequency', () => {
  for (const [n, ripple, fc] of [[2, 0.5, 0.2], [4, 1, 0.2], [6, 3, 0.1]]) {
    const { b, a } = cheby1Cutoff3(n, ripple, fc);
    const H = freqResponse(b, a, 6001);
    const idx = Math.round(fc / 0.5 * 6000);
    approx(H.db[idx], -3.0103, 0.15, `n=${n}`);
  }
});

test('2-D FFT matches a direct 2-D DFT', () => {
  const n = 8;
  const re = Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => Math.sin(x / 2) + Math.cos(y / 3)));
  const F = fft2(re, null);
  // direct at one bin
  for (const [u, v] of [[0, 0], [2, 3], [5, 1]]) {
    let sr = 0, si = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const a = -2 * Math.PI * (u * x + v * y) / n;
      sr += re[y][x] * Math.cos(a);
      si += re[y][x] * Math.sin(a);
    }
    approx(F.re[v][u], sr, 1e-9, `re ${u},${v}`);
    approx(F.im[v][u], si, 1e-9, `im ${u},${v}`);
  }
});

test('imageSpectrum returns a normalized square image', () => {
  const img = phantom(32);
  const S = imageSpectrum(img, 32);
  assert.equal(S.w, 32); assert.equal(S.h, 32);
  assert.ok(Math.max(...S.data) <= 1.0000001);
  assert.ok(Math.min(...S.data) >= 0);
});

