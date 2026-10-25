/**
 * dsp.js — numerical engine for the interactive DSP course.
 *
 * Every function here is intentionally dependency-free so the same code can run
 * in the browser and under Node's test runner.  Conventions follow Smith,
 * "The Scientist and Engineer's Guide to DSP" (2nd ed.):
 *   - continuous frequency is normalised to the sampling rate, 0..0.5
 *   - the real DFT has N/2+1 bins
 *   - a recursive filter is  y[n] = sum b[k]x[n-k] - sum a[k]y[n-k], a[0]=1
 */

/* ------------------------------------------------------------------ */
/* Basic statistics                                                     */
/* ------------------------------------------------------------------ */

export const mean = (x) => x.reduce((s, v) => s + v, 0) / x.length;

export function std(x, sample = false) {
  const m = mean(x);
  const ss = x.reduce((s, v) => s + (v - m) ** 2, 0);
  return Math.sqrt(ss / Math.max(1, x.length - (sample ? 1 : 0)));
}

export function histogram(x, bins = 50, lo = Math.min(...x), hi = Math.max(...x)) {
  const width = (hi - lo) / bins || 1;
  const counts = new Array(bins).fill(0);
  for (const v of x) {
    let k = Math.floor((v - lo) / width);
    k = Math.max(0, Math.min(bins - 1, k));
    counts[k]++;
  }
  return { counts, lo, hi, width, centers: counts.map((_, i) => lo + (i + 0.5) * width) };
}

/* Deterministic PRNG so labs and tests are repeatable. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function uniformNoise(n, amplitude = 1, seed = 1) {
  const rnd = mulberry32(seed);
  return Array.from({ length: n }, () => (rnd() * 2 - 1) * amplitude);
}

export function gaussianNoise(n, sigma = 1, seed = 1) {
  const rnd = mulberry32(seed);
  const out = [];
  while (out.length < n) {
    const u1 = Math.max(rnd(), 1e-12);
    const u2 = rnd();
    const r = Math.sqrt(-2 * Math.log(u1));
    out.push(sigma * r * Math.cos(2 * Math.PI * u2));
    if (out.length < n) out.push(sigma * r * Math.sin(2 * Math.PI * u2));
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* DFT / FFT                                                            */
/* ------------------------------------------------------------------ */

/** Complex DFT. Inputs are real/imag arrays (imag optional). */
export function dft(re, im = null, inverse = false) {
  const N = re.length;
  const outRe = new Array(N).fill(0);
  const outIm = new Array(N).fill(0);
  const sign = inverse ? 1 : -1;
  for (let k = 0; k < N; k++) {
    let sr = 0, si = 0;
    for (let n = 0; n < N; n++) {
      const ang = (sign * 2 * Math.PI * k * n) / N;
      const c = Math.cos(ang), s = Math.sin(ang);
      const xr = re[n], xi = im ? im[n] : 0;
      sr += xr * c - xi * s;
      si += xr * s + xi * c;
    }
    outRe[k] = inverse ? sr / N : sr;
    outIm[k] = inverse ? si / N : si;
  }
  return { re: outRe, im: outIm };
}

export const isPow2 = (n) => n > 0 && (n & (n - 1)) === 0;
export const nextPow2 = (n) => 2 ** Math.ceil(Math.log2(Math.max(1, n)));

/** In-place iterative radix-2 FFT on copies of re/im. */
export function fft(reIn, imIn = null, inverse = false) {
  const N = reIn.length;
  if (!isPow2(N)) throw new Error(`FFT length must be a power of two (got ${N})`);
  const re = reIn.slice();
  const im = imIn ? imIn.slice() : new Array(N).fill(0);

  // bit-reversal permutation
  for (let i = 1, j = 0; i < N; i++) {
    let bit = N >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= N; len <<= 1) {
    const ang = ((inverse ? 2 : -2) * Math.PI) / len;
    const wRe = Math.cos(ang), wIm = Math.sin(ang);
    for (let i = 0; i < N; i += len) {
      let curRe = 1, curIm = 0;
      for (let j = 0; j < len / 2; j++) {
        const uRe = re[i + j], uIm = im[i + j];
        const vRe = re[i + j + len / 2] * curRe - im[i + j + len / 2] * curIm;
        const vIm = re[i + j + len / 2] * curIm + im[i + j + len / 2] * curRe;
        re[i + j] = uRe + vRe;
        im[i + j] = uIm + vIm;
        re[i + j + len / 2] = uRe - vRe;
        im[i + j + len / 2] = uIm - vIm;
        const nRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nRe;
      }
    }
  }
  if (inverse) {
    for (let i = 0; i < N; i++) { re[i] /= N; im[i] /= N; }
  }
  return { re, im };
}

/** Real DFT with the book's N/2+1 one-sided format. */
export function realDft(x) {
  const N = x.length;
  let re, im;
  if (isPow2(N)) ({ re, im } = fft(x));
  else ({ re, im } = dft(x));
  const M = Math.floor(N / 2) + 1;
  const rRe = re.slice(0, M);
  const rIm = im.slice(0, M);
  return {
    re: rRe,
    im: rIm,
    mag: rRe.map((v, k) => Math.hypot(v, rIm[k])),
    phase: rRe.map((v, k) => Math.atan2(rIm[k], v)),
    db: rRe.map((v, k) => 20 * Math.log10(Math.max(1e-12, Math.hypot(v, rIm[k])))),
    freqs: rRe.map((_, k) => k / N),
    N,
  };
}

export function pad(x, n) {
  const out = new Array(n).fill(0);
  for (let i = 0; i < Math.min(x.length, n); i++) out[i] = x[i];
  return out;
}

export function idft(re, im) {
  return dft(re, im, true);
}

/** Magnitude/phase spectrum for any (possibly non power-of-two) signal. */
export function spectrum(x, db = false) {
  const data = x.length === nextPow2(x.length) ? realDft(x) : (() => {
    const N = x.length;
    const { re, im } = dft(x);
    const M = Math.floor(N / 2) + 1;
    const rRe = re.slice(0, M), rIm = im.slice(0, M);
    return { re: rRe, im: rIm, mag: rRe.map((v, k) => Math.hypot(v, rIm[k])),
      freqs: rRe.map((_, k) => k / N) };
  })();
  data.db = data.mag.map((m) => 20 * Math.log10(Math.max(1e-12, m)));
  return data;
}

/** Inverse DFT from the book's N/2+1 real format (real output). */
export function inverseRealDft(re, im, N) {
  const fullRe = new Array(N).fill(0);
  const fullIm = new Array(N).fill(0);
  for (let k = 0; k < re.length; k++) {
    fullRe[k] = re[k];
    fullIm[k] = im ? im[k] : 0;
    if (k > 0 && k < N / 2) {
      fullRe[N - k] = re[k];
      fullIm[N - k] = -(im ? im[k] : 0);
    }
  }
  return dft(fullRe, fullIm, true).re;
}

/* ------------------------------------------------------------------ */
/* Convolution / correlation                                            */
/* ------------------------------------------------------------------ */

export function convolve(x, h) {
  const out = new Array(x.length + h.length - 1).fill(0);
  for (let n = 0; n < out.length; n++) {
    let s = 0;
    const k0 = Math.max(0, n - (h.length - 1));
    const k1 = Math.min(x.length - 1, n);
    for (let k = k0; k <= k1; k++) s += x[k] * h[n - k];
    out[n] = s;
  }
  return out;
}

export function correlate(x, y) {
  // correlation without the time reversal of convolution
  return convolve(x, y.slice().reverse());
}

export function fftConvolve(x, h) {
  const N = nextPow2(x.length + h.length - 1);
  const X = fft(pad(x, N)), H = fft(pad(h, N));
  const re = X.re.map((v, i) => v * H.re[i] - X.im[i] * H.im[i]);
  const im = X.re.map((v, i) => v * H.im[i] + X.im[i] * H.re[i]);
  return fft(re, im, true).re.slice(0, x.length + h.length - 1);
}

/** Overlap-add convolution, returning each block for instruction. */
export function overlapAdd(x, h, blockSize = 32) {
  const L = blockSize;
  const blocks = [];
  let y = [];
  for (let start = 0; start < x.length; start += L) {
    const block = x.slice(start, start + L);
    const conv = convolve(block, h);
    blocks.push({ start, input: block, output: conv });
    if (y.length < start + conv.length) {
      const old = y.length;
      y.length = start + conv.length;
      for (let i = old; i < y.length; i++) y[i] = 0;
    }
    for (let i = 0; i < conv.length; i++) y[start + i] += conv[i];
  }
  return { y, blocks, blockSize: L, kernelLength: h.length };
}

export function movingAverage(x, M) {
  const h = new Array(M).fill(1 / M);
  return { y: convolve(x, h), h };
}

export function movingAverageCentered(x, M) {
  const half = Math.floor(M / 2);
  const out = new Array(x.length).fill(0);
  for (let n = 0; n < x.length; n++) {
    let s = 0, c = 0;
    for (let k = -half; k <= half; k++) {
      const i = n + k;
      if (i >= 0 && i < x.length) { s += x[i]; c++; }
    }
    out[n] = s / Math.max(1, c);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Windows, sinc, FIR and IIR filters                                   */
/* ------------------------------------------------------------------ */

export function sinc(x) {
  if (Math.abs(x) < 1e-12) return 1;
  const a = Math.PI * x;
  return Math.sin(a) / a;
}

export function windowFunction(type, M) {
  // M is the even kernel order; returns M+1 samples, i=0..M
  const w = [];
  for (let i = 0; i <= M; i++) {
    const t = (2 * Math.PI * i) / M;
    let v = 1;
    if (type === 'hamming') v = 0.54 - 0.46 * Math.cos(t);
    else if (type === 'hann') v = 0.5 - 0.5 * Math.cos(t);
    else if (type === 'blackman') v = 0.42 - 0.5 * Math.cos(t) + 0.08 * Math.cos(2 * t);
    else if (type === 'bartlett') v = 1 - Math.abs((i - M / 2) / (M / 2));
    w.push(v);
  }
  return w;
}

export function windowedSinc(M, fc, window = 'blackman') {
  M = Math.max(2, Math.round(M / 2) * 2); // enforce even
  const w = windowFunction(window, M);
  const h = [];
  for (let i = 0; i <= M; i++) {
    const t = i - M / 2;
    h.push(2 * fc * sinc(2 * fc * t) * w[i]);
  }
  const sum = h.reduce((s, v) => s + v, 0);
  return h.map((v) => v / sum);
}

/** 2-D FFT of a rectangular complex array (both dimensions powers of two). */
export function fft2(re2, im2) {
  const rows = re2.length, cols = re2[0].length;
  if (!isPow2(cols) || !isPow2(rows)) throw new Error('fft2 requires power-of-two dimensions');
  const re = re2.map((r) => r.slice());
  const im = im2 ? im2.map((r) => r.slice()) : Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let y = 0; y < rows; y++) {
    const R = fft(re[y], im[y]);
    re[y] = R.re; im[y] = R.im;
  }
  for (let x = 0; x < cols; x++) {
    const cr = new Array(rows), ci = new Array(rows);
    for (let y = 0; y < rows; y++) { cr[y] = re[y][x]; ci[y] = im[y][x]; }
    const C = fft(cr, ci);
    for (let y = 0; y < rows; y++) { re[y][x] = C.re[y]; im[y][x] = C.im[y]; }
  }
  return { re, im };
}

/** Centered log-magnitude spectrum image for display. */
export function imageSpectrum(img, size = 128) {
  const n = nextPow2(Math.max(size, img.w, img.h));
  const re = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) re[y][x] = img.data[y * img.w + x];
  const F = fft2(re, null);
  const out = new Float32Array(n * n);
  let max = 0;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const sy = (y + n / 2) % n, sx = (x + n / 2) % n;
    const v = Math.log1p(Math.hypot(F.re[y][x], F.im[y][x]));
    out[sy * n + sx] = v;
    if (v > max) max = v;
  }
  for (let i = 0; i < out.length; i++) out[i] /= max || 1;
  return { w: n, h: n, data: out };
}

/** Frequency response of H(z)=B(z)/A(z) at n frequencies in [0,0.5]. */
export function freqResponse(b, a = [1], n = 256) {
  const freq = [], mag = [], db = [], phase = [];
  for (let i = 0; i < n; i++) {
    const f = (0.5 * i) / (n - 1);
    const w = 2 * Math.PI * f;
    let br = 0, bi = 0, ar = 0, ai = 0;
    for (let k = 0; k < b.length; k++) {
      br += b[k] * Math.cos(-w * k);
      bi += b[k] * Math.sin(-w * k);
    }
    for (let k = 0; k < a.length; k++) {
      ar += a[k] * Math.cos(-w * k);
      ai += a[k] * Math.sin(-w * k);
    }
    const den = ar * ar + ai * ai;
    const hr = (br * ar + bi * ai) / (den || 1e-30);
    const hi = (bi * ar - br * ai) / (den || 1e-30);
    const m = Math.hypot(hr, hi);
    freq.push(f); mag.push(m); db.push(20 * Math.log10(Math.max(1e-12, m)));
    phase.push(Math.atan2(hi, hr));
  }
  return { freq, mag, db, phase };
}

export function applyIir(x, b, a = [1]) {
  const y = new Array(x.length).fill(0);
  for (let n = 0; n < x.length; n++) {
    let s = 0;
    for (let k = 0; k < b.length; k++) if (n - k >= 0) s += b[k] * x[n - k];
    for (let k = 1; k < a.length; k++) if (n - k >= 0) s -= a[k] * y[n - k];
    y[n] = s;
  }
  return y;
}

export function impulseResponse(b, a = [1], n = 128) {
  const d = new Array(n).fill(0); d[0] = 1;
  return applyIir(d, b, a);
}

export function stepResponse(b, a = [1], n = 128) {
  return applyIir(new Array(n).fill(1), b, a);
}

export function singlePole(fc, type = 'lowpass') {
  const x = Math.exp(-2 * Math.PI * Math.max(1e-6, Math.min(0.499, fc)));
  if (type === 'highpass') {
    return { b: [(1 + x) / 2, -(1 + x) / 2], a: [1, -x], x };
  }
  return { b: [1 - x], a: [1, -x], x };
}

/* --- analog prototype -> bilinear digital filter --- */

function polyFromRoots(roots) {
  // coefficients of prod (1 - root_k z^-1), complex roots in conjugate pairs
  let re = [1], im = [0];
  for (const r of roots) {
    const nr = new Array(re.length + 1).fill(0);
    const ni = new Array(im.length + 1).fill(0);
    for (let k = 0; k < re.length; k++) {
      nr[k + 1] -= re[k] * r.re - im[k] * r.im;
      ni[k + 1] -= re[k] * r.im + im[k] * r.re;
      nr[k] += re[k];
      ni[k] += im[k];
    }
    re = nr; im = ni;
  }
  return re; // imaginary parts cancel for conjugate pairs
}

function normalizeDc(b, a) {
  const sB = b.reduce((s, v) => s + v, 0);
  const sA = a.reduce((s, v) => s + v, 0);
  const g = sA / (sB || 1e-30);
  return { b: b.map((v) => v * g), a };
}

/** Scale an unscaled Chebyshev response so its passband maximum is 0 dB. */
function normalizePassbandMax(b, a, fc) {
  const H = freqResponse(b, a, 401);
  let max = 0;
  for (let i = 0; i < H.freq.length; i++) if (H.freq[i] <= fc + 1e-12) max = Math.max(max, H.mag[i]);
  const g = 1 / (max || 1);
  return { b: b.map((v) => v * g), a };
}

/** Chebyshev type-I low-pass, order n, ripple in dB, cutoff 0..0.5. */
export function cheby1(n, rippleDb, fc) {
  const eps = Math.sqrt(10 ** (rippleDb / 10) - 1);
  const a = Math.asinh(1 / eps) / n;
  const roots = [];
  for (let k = 0; k < n; k++) {
    const theta = (Math.PI * (2 * k + 1)) / (2 * n);
    roots.push({ re: -Math.sinh(a) * Math.sin(theta), im: Math.cosh(a) * Math.cos(theta) });
  }
  const omegaP = Math.tan(Math.PI * fc);
  // bilinear z=(1+s)/(1-s), s already scaled by omegaP
  const zPoles = roots.map((p) => {
    const sRe = omegaP * p.re, sIm = omegaP * p.im;
    const d = (1 - sRe) ** 2 + sIm ** 2;
    return { re: (1 - sRe * sRe - sIm * sIm) / d, im: (2 * sIm) / d };
  });
  const aPoly = polyFromRoots(zPoles);
  // all-pole analog prototype maps to n zeros at z=-1: (1+z^-1)^n
  const bPoly = Array.from({ length: n + 1 }, (_, k) => binomial(n, k));
  return normalizePassbandMax(bPoly, aPoly, fc);
}

/** Magnitude in dB at a single normalized frequency. */
export function freqResponseAt(b, a, f) {
  const w = 2 * Math.PI * f;
  let br = 0, bi = 0, ar = 0, ai = 0;
  for (let k = 0; k < b.length; k++) { br += b[k] * Math.cos(-w * k); bi += b[k] * Math.sin(-w * k); }
  for (let k = 0; k < a.length; k++) { ar += a[k] * Math.cos(-w * k); ai += a[k] * Math.sin(-w * k); }
  const den = ar * ar + ai * ai || 1e-30;
  const hr = (br * ar + bi * ai) / den;
  const hi = (bi * ar - br * ai) / den;
  return 20 * Math.log10(Math.max(1e-12, Math.hypot(hr, hi)));
}

/**
 * Chebyshev-I low-pass whose -3 dB point is the requested fc.
 * Smith defines the Chebyshev cutoff at 0.707 amplitude, not at the ripple edge.
 * Binary-searches the ripple-edge design frequency.
 */
export function cheby1Cutoff3(n, rippleDb, fc3) {
  let lo = 1e-5, hi = Math.min(0.49, fc3);
  for (let i = 0; i < 42; i++) {
    const mid = (lo + hi) / 2;
    const { b, a } = cheby1(n, rippleDb, mid);
    const db = freqResponseAt(b, a, fc3);
    if (db > -3.0103) hi = mid; else lo = mid;
  }
  return cheby1(n, rippleDb, (lo + hi) / 2);
}

export function butterworth(n, fc) {  const roots = [];
  for (let k = 0; k < n; k++) {
    const theta = (Math.PI * (2 * k + n + 1)) / (2 * n);
    roots.push({ re: Math.cos(theta), im: Math.sin(theta) });
  }
  const omegaP = Math.tan(Math.PI * fc);
  const zPoles = roots.map((p) => {
    const sRe = omegaP * p.re, sIm = omegaP * p.im;
    const d = (1 - sRe) ** 2 + sIm ** 2;
    return { re: (1 - sRe * sRe - sIm * sIm) / d, im: (2 * sIm) / d };
  });
  const aPoly = polyFromRoots(zPoles);
  const bPoly = Array.from({ length: n + 1 }, (_, k) => binomial(n, k));
  return normalizeDc(bPoly, aPoly);
}

function binomial(n, k) {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

export function poleZero(b, a) {
  // numeric roots by Durand-Kerner for modest orders
  const roots = (coeffs) => {
    const c = coeffs.slice();
    while (c.length > 1 && Math.abs(c[0]) < 1e-12) c.shift();
    const n = c.length - 1;
    if (n < 1) return [];
    const monic = c.map((v) => v / c[0]);
    let z = Array.from({ length: n }, (_, k) => ({
      re: Math.cos((2 * Math.PI * k) / n) * 0.9,
      im: Math.sin((2 * Math.PI * k) / n) * 0.9,
    }));
    const evalP = (p) => {
      let re = 0, im = 0;
      for (let k = 0; k < monic.length; k++) {
        const nr = re * p.re - im * p.im + monic[k];
        const ni = re * p.im + im * p.re;
        re = nr; im = ni;
      }
      return { re, im };
    };
    for (let it = 0; it < 200; it++) {
      for (let i = 0; i < n; i++) {
        let num = evalP(z[i]);
        let den = { re: 1, im: 0 };
        for (let j = 0; j < n; j++) {
          if (i === j) continue;
          const dr = z[i].re - z[j].re, di = z[i].im - z[j].im;
          const nr = den.re * dr - den.im * di;
          const ni = den.re * di + den.im * dr;
          den = { re: nr, im: ni };
        }
        const d = den.re * den.re + den.im * den.im;
        if (d < 1e-24) continue;
        const qr = (num.re * den.re + num.im * den.im) / d;
        const qi = (num.im * den.re - num.re * den.im) / d;
        z[i] = { re: z[i].re - qr, im: z[i].im - qi };
      }
    }
    return z;
  };
  return { zeros: roots(b), poles: roots(a) };
}

/* ------------------------------------------------------------------ */
/* ADC / quantization                                                   */
/* ------------------------------------------------------------------ */

export function quantize(x, bits, vmin = -1, vmax = 1) {
  const levels = 2 ** bits;
  const step = (vmax - vmin) / levels;
  const q = [], err = [], code = [];
  for (const v of x) {
    const clamped = Math.max(vmin, Math.min(vmax - step * 1e-12, v));
    const c = Math.floor((clamped - vmin) / step);
    const qv = vmin + (c + 0.5) * step;
    q.push(qv); err.push(qv - v); code.push(c);
  }
  return { q, err, code, step, levels, bits, vmin, vmax };
}

export const quantizationSnrDb = (bits, fullScaleSine = true) =>
  6.0206 * bits + (fullScaleSine ? 1.7609 : 0);

export function muLawEncode(x, mu = 255) {
  const s = Math.sign(x);
  return s * (Math.log1p(mu * Math.abs(x)) / Math.log1p(mu));
}
export function muLawDecode(y, mu = 255) {
  const s = Math.sign(y);
  return s * ((1 + mu) ** Math.abs(y) - 1) / mu;
}

/* ------------------------------------------------------------------ */
/* Compression                                                          */
/* ------------------------------------------------------------------ */

export function runLength(values) {
  const runs = [];
  for (const v of values) {
    if (runs.length && runs[runs.length - 1].value === v) runs[runs.length - 1].length++;
    else runs.push({ value: v, length: 1 });
  }
  return runs;
}

/** Huffman coding; returns code table, encoded bit string and statistics. */
export function huffman(text) {
  const freq = new Map();
  for (const ch of text) freq.set(ch, (freq.get(ch) || 0) + 1);
  const nodes = [...freq.entries()].map(([ch, f]) => ({ ch, f, left: null, right: null }));
  if (nodes.length === 1) {
    return {
      table: [{ ch: nodes[0].ch, freq: nodes[0].f, code: '0' }],
      encoded: '0'.repeat(nodes[0].f), tree: nodes[0],
      bits: nodes[0].f, originalBits: text.length * 8,
      entropy: 0, avgLength: 1,
    };
  }
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.f - b.f || String(a.ch).localeCompare(String(b.ch)));
    const a = nodes.shift(), b = nodes.shift();
    nodes.push({ ch: null, f: a.f + b.f, left: a, right: b });
  }
  const tree = nodes[0];
  const table = [];
  const walk = (node, code) => {
    if (node.ch !== null) { table.push({ ch: node.ch, freq: node.f, code: code || '0' }); return; }
    walk(node.left, code + '0');
    walk(node.right, code + '1');
  };
  walk(tree, '');
  table.sort((a, b) => a.freq - b.freq);
  const map = new Map(table.map((r) => [r.ch, r.code]));
  const encoded = [...text].map((c) => map.get(c)).join('');
  const total = text.length;
  const entropy = -table.reduce((s, r) => s + (r.freq / total) * Math.log2(r.freq / total), 0);
  const avgLength = table.reduce((s, r) => s + (r.freq / total) * r.code.length, 0);
  return { table, encoded, tree, bits: encoded.length, originalBits: total * 8, entropy, avgLength };
}

/** LZW demo returning codes and a compact dictionary trace. */
export function lzw(text) {
  const dict = new Map();
  let next = 0;
  for (const ch of new Set(text)) dict.set(ch, next++);
  const codes = [];
  const steps = [];
  let w = '';
  for (const ch of text) {
    const wc = w + ch;
    if (dict.has(wc)) { w = wc; }
    else {
      if (w) codes.push(dict.get(w));
      dict.set(wc, next++);
      steps.push({ phrase: wc, code: next - 1, emitted: w ? dict.get(w) : null });
      w = ch;
    }
  }
  if (w) codes.push(dict.get(w));
  return { codes, steps, dictionarySize: next };
}

/* ------------------------------------------------------------------ */
/* Image processing                                                     */
/* ------------------------------------------------------------------ */

export function makeImage(w, h, fn) {
  const data = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) data[y * w + x] = fn(x, y);
  return { w, h, data };
}

export function convolve2D(img, kernel, { normalize = false } = {}) {
  const kh = kernel.length, kw = kernel[0].length;
  const cy = Math.floor(kh / 2), cx = Math.floor(kw / 2);
  let ksum = 0;
  for (const row of kernel) for (const v of row) ksum += v;
  const out = new Float32Array(img.w * img.h);
  for (let y = 0; y < img.h; y++) {
    for (let x = 0; x < img.w; x++) {
      let s = 0;
      for (let j = 0; j < kh; j++) {
        for (let i = 0; i < kw; i++) {
          const yy = Math.min(img.h - 1, Math.max(0, y + j - cy));
          const xx = Math.min(img.w - 1, Math.max(0, x + i - cx));
          s += img.data[yy * img.w + xx] * kernel[j][i];
        }
      }
      out[y * img.w + x] = normalize && ksum ? s / ksum : s;
    }
  }
  return { ...img, data: out };
}

export function gaussianKernel2D(sigma, radius = Math.ceil(sigma * 3)) {
  const size = radius * 2 + 1;
  const k = Array.from({ length: size }, () => new Array(size).fill(0));
  let sum = 0;
  for (let y = -radius; y <= radius; y++) for (let x = -radius; x <= radius; x++) {
    const v = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
    k[y + radius][x + radius] = v; sum += v;
  }
  return k.map((row) => row.map((v) => v / sum));
}

export function bilateral(img, sigmaS = 2, sigmaR = 0.15) {
  const r = Math.ceil(sigmaS * 2);
  const out = new Float32Array(img.w * img.h);
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
    let ws = 0, vs = 0;
    const c = img.data[y * img.w + x];
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
      const yy = Math.min(img.h - 1, Math.max(0, y + j));
      const xx = Math.min(img.w - 1, Math.max(0, x + i));
      const v = img.data[yy * img.w + xx];
      const w = Math.exp(-(i * i + j * j) / (2 * sigmaS * sigmaS) - ((v - c) ** 2) / (2 * sigmaR * sigmaR));
      ws += w; vs += w * v;
    }
    out[y * img.w + x] = vs / ws;
  }
  return { ...img, data: out };
}

export function morphological(img, radius = 2, mode = 'dilate', threshold = 0.5) {
  const out = new Float32Array(img.w * img.h);
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
    let best = mode === 'dilate' ? 0 : 1;
    for (let j = -radius; j <= radius; j++) for (let i = -radius; i <= radius; i++) {
      const yy = Math.min(img.h - 1, Math.max(0, y + j));
      const xx = Math.min(img.w - 1, Math.max(0, x + i));
      const v = img.data[yy * img.w + xx] > threshold ? 1 : 0;
      best = mode === 'dilate' ? Math.max(best, v) : Math.min(best, v);
    }
    out[y * img.w + x] = best;
  }
  return { ...img, data: out };
}

export function dct1(v) {
  const N = v.length;
  const out = new Array(N).fill(0);
  for (let k = 0; k < N; k++) {
    let s = 0;
    for (let n = 0; n < N; n++) s += v[n] * Math.cos((Math.PI * k * (2 * n + 1)) / (2 * N));
    out[k] = (k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N)) * s;
  }
  return out;
}

export function idct1(coeff) {
  const N = coeff.length;
  const out = new Array(N).fill(0);
  for (let n = 0; n < N; n++) {
    let s = 0;
    for (let k = 0; k < N; k++) s += (k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N)) * coeff[k] * Math.cos((Math.PI * k * (2 * n + 1)) / (2 * N));
    out[n] = s;
  }
  return out;
}

/* 2-D DCT via separable 1-D transforms. */
export function dct2d(block) {
  const rows = block.map((row) => dct1(row));
  const out = Array.from({ length: 8 }, () => new Array(8).fill(0));
  for (let x = 0; x < 8; x++) {
    const col = idctColumnHelper(rows, x);
    const t = dct1(col);
    for (let y = 0; y < 8; y++) out[y][x] = t[y];
  }
  return out;
}
function idctColumnHelper(rows, x) {
  return rows.map((r) => r[x]);
}
export function idct2d(coeff) {
  const tmp = Array.from({ length: 8 }, () => new Array(8).fill(0));
  for (let x = 0; x < 8; x++) {
    const col = coeff.map((r) => r[x]);
    const t = idct1(col);
    for (let y = 0; y < 8; y++) tmp[y][x] = t[y];
  }
  return tmp.map((row) => idct1(row));
}

export const JPEG_LUMA_Q = [
  [16, 11, 10, 16, 24, 40, 51, 61],
  [12, 12, 14, 19, 26, 58, 60, 55],
  [14, 13, 16, 24, 40, 57, 69, 56],
  [14, 17, 22, 29, 51, 87, 80, 62],
  [18, 22, 37, 56, 68, 109, 103, 77],
  [24, 35, 55, 64, 81, 104, 113, 92],
  [49, 64, 78, 87, 103, 121, 120, 101],
  [72, 92, 95, 98, 112, 100, 103, 99],
];

export function jpegRoundTrip(block, quality = 50) {
  const q = Math.max(1, Math.min(100, quality));
  const scale = q < 50 ? 5000 / q : 200 - 2 * q;
  const table = JPEG_LUMA_Q.map((row) => row.map((v) => Math.max(1, Math.round((v * scale) / 100))));
  const coeff = dct2d(block);
  const quant = coeff.map((row, y) => row.map((v, x) => Math.round(v / table[y][x])));
  const deq = quant.map((row, y) => row.map((v, x) => v * table[y][x]));
  const recon = idct2d(deq);
  return { coeff, table, quant, recon, quality: q };
}

/* ------------------------------------------------------------------ */
/* CT / Radon demonstration                                             */
/* ------------------------------------------------------------------ */

export function phantom(n = 64) {
  const ellipses = [
    { cx: 0.5, cy: 0.5, a: 0.42, b: 0.32, angle: 0, val: 1 },
    { cx: 0.5, cy: 0.5, a: 0.30, b: 0.22, angle: 0, val: -0.6 },
    { cx: 0.38, cy: 0.42, a: 0.10, b: 0.06, angle: 0.2, val: 0.5 },
    { cx: 0.62, cy: 0.40, a: 0.08, b: 0.05, angle: -0.3, val: 0.4 },
    { cx: 0.50, cy: 0.65, a: 0.06, b: 0.09, angle: 0, val: 0.3 },
  ];
  const img = makeImage(n, n, (x, y) => {
    let v = 0;
    for (const e of ellipses) {
      const dx = (x + 0.5) / n - e.cx, dy = (y + 0.5) / n - e.cy;
      const c = Math.cos(e.angle), s = Math.sin(e.angle);
      const u = (dx * c + dy * s) / e.a, w = (-dx * s + dy * c) / e.b;
      if (u * u + w * w <= 1) v += e.val;
    }
    return Math.max(0, Math.min(1, v));
  });
  return img;
}

export function radon(img, angles = 60) {
  const projections = [];
  const d = Math.ceil(Math.hypot(img.w, img.h));
  for (let a = 0; a < angles; a++) {
    const theta = (Math.PI * a) / angles;
    const p = new Float32Array(d).fill(0);
    for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
      const t = (x - img.w / 2) * Math.cos(theta) + (y - img.h / 2) * Math.sin(theta);
      const idx = Math.round(t + d / 2);
      if (idx >= 0 && idx < d) p[idx] += img.data[y * img.w + x];
    }
    projections.push(p);
  }
  return { projections, d };
}

export function backproject(projections, n = 64, filter = true) {
  const A = projections.length;
  const d = projections[0].length;
  const filtered = [];
  for (let a = 0; a < A; a++) {
    if (!filter) { filtered.push(Float64Array.from(projections[a])); continue; }
    // Ram-Lak ramp filter, sampled at unit spacing, applied by convolution.
    const M = d;
    const c = Math.floor(M / 2);
    const h = new Float64Array(M);
    for (let i = -c; i <= c; i++) {
      if (i === 0) h[i + c] = 0.25;
      else if (Math.abs(i) % 2 === 1) h[i + c] = -1 / (Math.PI * Math.PI * i * i);
      // Hamming-windowed ramp (Shepp-Logan-like) reduces high-frequency streak artifacts.
      h[i + c] *= 0.54 + 0.46 * Math.cos((Math.PI * i) / Math.max(1, c));
    }
    const out = new Float64Array(d);
    for (let t = 0; t < d; t++) {
      let s = 0;
      for (let i = -c; i <= c; i++) {
        const j = t - i;
        if (j >= 0 && j < d) s += h[i + c] * projections[a][j];
      }
      out[t] = s;
    }
    filtered.push(out);
  }
  const out = new Float32Array(n * n);
  const dTheta = Math.PI / A;
  for (let a = 0; a < A; a++) {
    const theta = (Math.PI * a) / A;
    const ct = Math.cos(theta), st = Math.sin(theta);
    const p = filtered[a];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const t = (x - n / 2) * ct + (y - n / 2) * st + d / 2;
      const i0 = Math.floor(t);
      if (i0 < 0 || i0 >= d - 1) continue;
      const f = t - i0;
      out[y * n + x] += ((1 - f) * p[i0] + f * p[i0 + 1]) * dTheta;
    }
  }
  return { w: n, h: n, data: out };
}

/* ------------------------------------------------------------------ */
/* Neural network / perceptron                                          */
/* ------------------------------------------------------------------ */

export function trainPerceptron(points, labels, { epochs = 60, lr = 0.08 } = {}) {
  let w1 = 0.1, w2 = -0.1, b = 0;
  const history = [];
  for (let e = 0; e < epochs; e++) {
    let errors = 0;
    for (let i = 0; i < points.length; i++) {
      const [x1, x2] = points[i];
      const y = labels[i];
      const pred = w1 * x1 + w2 * x2 + b;
      const err = y - (pred >= 0 ? 1 : -1);
      if (err !== 0) {
        w1 += lr * err * x1;
        w2 += lr * err * x2;
        b += lr * err;
        errors++;
      }
    }
    history.push({ epoch: e, w1, w2, b, errors });
    if (!errors) break;
  }
  return { w1, w2, b, history };
}

/* ------------------------------------------------------------------ */
/* Misc                                                                 */
/* ------------------------------------------------------------------ */

export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
export function linspace(lo, hi, n) {
  if (n === 1) return [lo];
  return Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));
}
export function rms(x) { return Math.sqrt(x.reduce((s, v) => s + v * v, 0) / x.length); }
export function db(x) { return 20 * Math.log10(Math.max(1e-12, Math.abs(x))); }

/** Circular buffer trace for Chapter 28. */
export function circularBufferWrite(state, value, size) {
  const buffer = state.buffer.slice();
  const pointer = state.pointer % size;
  buffer[pointer] = value;
  return { buffer, pointer: (pointer + 1) % size, writes: (state.writes || 0) + 1, last: pointer };
}
