# DSP Fieldbook

An interactive, source-linked course for **Digital Signal Processing**, built around Steven W. Smith's *The Scientist and Engineer's Guide to Digital Signal Processing* (2nd ed., 688 pp.).

The app covers all 33 chapters and all 185 source sections, with 33 interactive labs, 100 practice questions, 235 formulas, a glossary, a concept dependency map, bookmarks, notes, progress tracking, and a section-by-section traceability matrix.

> **Source-first, not a replacement.** The book is the primary source of truth. Explanations here are authored summaries grounded in its terminology and page references. Modern examples and some derivations are supplementary and are identified as such in the documentation. The book remains the authoritative text.

---

## Quick start

Requirements: **Node.js 18+** (tested on Node 20). No build step, no backend, no external services.

```bash
cd dsp-interactive
npm install                # installs KaTeX and the Playwright test dependency
npm start                  # serves http://127.0.0.1:4173
```

Open **http://127.0.0.1:4173**.

If you want to run only the app and skip the test dependency, KaTeX is already vendored under `vendor/katex/`, so you can also use:

```bash
python -m http.server 4173
# then open http://127.0.0.1:4173
```

### Commands

| Command | What it does |
|---|---|
| `npm start` | Start the static server on port 4173 |
| `npm run test:unit` | Run 28 numerical/algorithm tests with Node's test runner |
| `npm run test:e2e` | Run 72 browser checks with Playwright/Chromium |
| `npm test` | Run both suites |

For the browser suite, install Chromium once if needed:

```bash
npx playwright install chromium
```

---

## What is in the application

### Learning experience

- **Dashboard** with progress, continue-where-you-left-off, and all 33 chapters grouped into the book's five parts.
- **Searchable contents** page with the complete part → chapter → section hierarchy, page numbers, and title/body filtering.
- **Lab gallery** with every interactive visualization and its guided tasks.
- **Chapter pages** with six tabs:
  - **Concepts** — intuition, technical detail, formulas, key points, caveats, source page badges, and per-section study tracking. A Guided/Technical depth switch changes progressive disclosure.
  - **Interactive lab** — a quantitative simulation for the chapter's central mechanism.
  - **Worked example** — step-by-step reasoning with a revealable answer.
  - **Practice** — immediate-feedback questions with explanations and suggested concept review.
  - **Source** — a section-by-section traceability table with book/PDF pages and treatment status.
  - **Notes** — a local, per-chapter notebook.
- **Concept map** of all 33 chapters with prerequisite arrows and hover details.
- **Review mode** that collects weak quiz chapters, missed-concept suggestions, bookmarks, and unfinished sections.
- **Reference library**: glossary, searchable formula sheet, assessment center, and source coverage audit.
- **Search** across chapters, sections, glossary, and formulas, with keyboard navigation.
- **Persistence**: theme, study state, lab visits, quiz best scores, bookmarks, notes, preferences, and last position are stored in `localStorage`; no account or backend is required.

### Interactive labs (33)

| Ch. | Lab | Concept demonstrated |
|---:|---|---|
| 1 | Signal chain | Sensor → anti-alias → ADC → DSP → DAC, aliasing and smoothing |
| 2 | Noise and histograms | Uniform/Gaussian processes, sample statistics, pdf |
| 3 | Sampling and quantization | Aliasing, sinc reconstruction, bit depth, SNR |
| 4 | Numerical precision | Float32/64, Q15, round-off growth, Kahan summation |
| 5 | Linearity test | Superposition, clipping, squaring, median nonlinearity |
| 6 | Convolution step-by-step | Flip/shift/overlap, input-side and output-side views |
| 7 | Kernels and correlation | Identity, echo, difference, sinc, matched-filter lag |
| 8 | DFT synthesis/analysis | Basis functions, bins, truncation, reconstruction |
| 9 | Windows and circular convolution | Leakage, record length, zero padding, DFT convolution |
| 10 | Fourier properties | Shift, scale, modulation, Parseval |
| 11 | Transform pairs | Rectangle/sinc, triangle, Gaussian, Gibbs, harmonics, chirp |
| 12 | FFT butterfly | Bit reversal, stages, twiddles, operation counts |
| 13 | Continuous processing | Continuous convolution, Fourier series, Gibbs |
| 14 | Filter design trade space | Low/high/band-pass/reject, phase, step response |
| 15 | Moving average | Noise vs rise time, sinc response, recursive O(1) |
| 16 | Windowed-sinc | Cutoff, transition width, windows, cascade |
| 17 | Custom filters | Frequency sampling, deconvolution, regularization |
| 18 | FFT convolution | Overlap-add, zero padding, wraparound |
| 19 | Recursive filters | Single pole, cutoff, time constant, instability |
| 20 | Chebyshev | Ripple/order, Butterworth comparison, poles, overshoot |
| 21 | Filter comparison | Four filters on one specification |
| 22 | Audio | μ-law companding, uniform vs companded error, data rates |
| 23 | Image basics | Brightness/contrast/gamma, grayscale maps, warping |
| 24 | Image convolution | Blur/sharpen/Sobel/Laplacian, separability, 2-D spectrum |
| 25 | Special imaging | PSF resolution, morphology, CT projections/backprojection |
| 26 | Perceptron | Linear boundary, XOR quadratic feature, training error |
| 27 | Compression | RLE, Huffman, JPEG block quantization |
| 28 | DSP hardware | Circular buffer, pointer/delay, real-time utilization |
| 29 | Real-time FIR | Tap count, deadline, group delay, utilization |
| 30 | Complex numbers | Plane arithmetic, polar form, phasors |
| 31 | Complex DFT | Conjugate symmetry, negative frequencies, Parseval |
| 32 | Laplace | s-plane pole/zero, stability, frequency and step response |
| 33 | z-plane | Unit circle, pole radius, resonance, impulse response |

Every lab note states where the model is simplified. All readouts are computed from the same dependency-free DSP engine used by the unit tests.

---

## Project structure

```
dsp-interactive/
├── index.html                  app shell
├── server.js                   dependency-free static server
├── css/styles.css              design system, light/dark, responsive
├── js/
│   ├── app.js                  router, views, interactions
│   ├── state.js                local-first learner state
│   ├── dsp.js                  DFT/FFT, convolution, filters, quantization, compression, imaging
│   ├── search.js               full-text search index
│   ├── ui.js                   escaping, rich text, KaTeX, icons, dialogs
│   ├── content/
│   │   ├── part1.js … part5.js 185 authored section explanations + quizzes
│   │   └── index.js            merge with source index + content validator
│   ├── data/
│   │   ├── source_index.js     extracted 33-chapter/185-section outline
│   │   ├── traceability.json   machine-readable coverage matrix
│   │   └── glossary.js         90-term glossary
│   └── viz/
│       ├── plot.js             Canvas chart engine (themes, hover, log axes)
│       ├── lab-kit.js          reusable lab scaffolding
│       ├── labs-*.js           33 labs grouped by subject
│       └── labs.js             registry
├── vendor/katex/               local KaTeX (offline equations)
├── source/Guide_to_Digital_Signal_Process.pdf   local source copy
├── tests/unit.test.js          28 unit tests
├── tests/e2e.mjs               72 browser checks
├── tools/                      source-index builder + doc exporter
├── CONCEPT_INVENTORY.md
├── TRACEABILITY.md
├── COVERAGE.md
├── TESTS.md
└── README.md
```

### Content model

Each section in `js/content/part*.js` has:

```js
{
  id: "3.2",                 // stable id matched to source_index.js
  title: "The Sampling Theorem",
  page: 39,                  // printed book page
  level: "core",
  intuition: "...",          // beginner-friendly explanation
  detail: "...",             // formal explanation
  advanced: "...",           // optional depth
  formulas: [{ label, tex, vars }],
  keyPoints: ["..."],
  caveat: "...",
  application: "..."
}
```

Chapter metadata adds objectives, prerequisites, a lab, a worked example, misconceptions, takeaways, and quiz questions. The source index is generated from the PDF outline; the content validator in `js/content/index.js` checks that every extracted section has authored content and that no extra IDs exist.

---

## Source fidelity and traceability

- `js/data/source_index.js` is generated from the PDF's heading structure. Printed book pages and PDF pages are both recorded.
- `TRACEABILITY.md` lists every section with its source pages, explanation, visual route, practice route, and status.
- `CONCEPT_INVENTORY.md` lists all chapters, sections, prerequisites, formulas, and labs.
- The Source coverage page in the app exposes the same matrix and links directly to the local PDF at the matching PDF page.
- The PDF has a duplicated 24-page block in Chapter 2 (PDF pages 49–72 repeat pages 25–48). The index uses the first copy and preserves printed page numbers.

### Source vs. supplement

The source provides the chapter/section structure, terminology, equations, and key claims. Explanations are written for this course and page-referenced. Examples involving modern technology (5G, JPEG, machine learning, etc.) and some engineering guidance are supplementary context, not attributed to Smith. If a detail is not supported by the source, the app does not present it as source fact.

Known source ambiguities are recorded in the app's Source coverage page and in `COVERAGE.md`:

- “Nyquist frequency” vs. “Nyquist rate” (the book uses both for half the sampling rate).
- Cutoff definition: −3 dB for Butterworth/Chebyshev vs. 50% amplitude for windowed-sinc.
- Chebyshev ripple in percent vs. dB.
- Hardware details specific to the 1990s ADSP-2106x/SHARC generation.

---

## Accessibility and UX

- Skip link, semantic landmarks, visible focus states, and labeled controls.
- Keyboard shortcuts: `/` search, `T` theme, `?` help, `G` then `H` dashboard, `Alt+←/→` previous/next chapter.
- Light/dark themes persisted locally.
- Reduced-motion preference is respected through CSS and can be forced in Help → preferences.
- Responsive layout: off-canvas sidebar, mobile search, scrollable tabs, stacked labs on narrow screens.
- Lab canvases have generated `aria-label` summaries; key readouts are also exposed as text.
- No backend, no tracking, no network requests after load (KaTeX is vendored).

---

## Testing

```bash
npm run test:unit   # 28/28 passing
npm run test:e2e    # 72/72 checks passing
```

The unit suite covers:

- DFT ↔ FFT agreement, inverse transforms, Parseval
- Direct ↔ FFT ↔ overlap-add convolution
- Moving average, windowed-sinc design, single-pole cutoff/time constant
- Chebyshev response, −3 dB cutoff solver, Butterworth response, pole stability
- Quantization error bound and 6.02N+1.76 dB SNR
- Huffman prefix-free coding, RLE, LZW structure
- 2-D DCT/IDCT, JPEG quality behavior
- Radon/backprojection, perceptron convergence, circular buffer behavior
- 2-D FFT vs. direct 2-D DFT, spectrum normalization

The browser suite checks every chapter and every lab, quiz feedback/scoring/persistence, bookmarks, notes, search, themes, all reference routes, representative lab controls, mobile overflow, the mobile menu/search, reduced motion, and zero console errors. See `TESTS.md` for the actual output and limitations of testing.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Port 4173 already in use | `node server.js 4174` and open the new port |
| Equations show as raw TeX | Confirm `vendor/katex/` exists; do not move `index.html` away from the project root |
| PDF link does not open | Some browsers block `file://` or PDF plugins; use the local server URL and open `source/Guide_to_Digital_Signal_Process.pdf` directly |
| Browser tests fail with “Executable doesn't exist” | `npx playwright install chromium` |
| Progress did not persist | Check that the browser allows `localStorage` for `127.0.0.1`; private windows may clear it on close |
| Labs are blank | Open the browser console; the numerical engine or a lab failed to load. The rest of the chapter remains usable |
| Dark theme flashes on load | The inline head script sets the saved theme before CSS; hard-refresh if an old cached file is served |

---

## Known limitations

- **Depth varies.** All 185 sections have authored explanations, but the source is a 688-page book. Core chapters receive deeper treatment and more lab controls than support/context sections. See `COVERAGE.md` for the 27 explanation-only sections.
- **Heuristic concept mapping.** Quiz feedback suggests a related section using keyword overlap; it is a study aid, not a validated diagnostic model.
- **Simplified simulations.** Labs use educational models (small CT grids, synthetic images, first/second-order filters, moving-average examples). Each lab note states its assumptions.
- **No audio playback.** The audio lab visualizes companding and data rates; it does not stream sound. This avoids autoplay and codec dependencies.
- **Hardware era.** Chapters 28–29 describe the source's ADSP-2106x/SHARC generation; modern devices differ.
- **Browser coverage.** Tested in Chromium. Modern Firefox/Safari should work (ES modules, Canvas, ResizeObserver), but were not part of the automated run.
- **No backend / multi-user sync.** State is local to the browser by design.

## Suggested future improvements

- Optional audio playback for the audio/conversion labs.
- Spaced-repetition scheduling based on quiz history.
- Export notes and progress as Markdown/JSON.
- Additional lab presets for specific textbook examples and figures.
- Screen-reader testing with NVDA/JAWS and a formal WCAG audit.
- Cross-browser CI (Firefox/WebKit) and visual regression snapshots.

---

## Attribution

Source text: Steven W. Smith, *The Scientist and Engineer's Guide to Digital Signal Processing*, 2nd ed., California Technical Publishing, 1997–1999. Copyright remains with the author/publisher. This project is an independent educational companion and is not affiliated with or endorsed by the author or publisher. The local PDF copy under `source/` is the user's supplied document for personal study; do not redistribute it.
