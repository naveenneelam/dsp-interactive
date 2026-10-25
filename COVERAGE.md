# Coverage and Omission Report

**Source:** Steven W. Smith, *The Scientist and Engineer's Guide to Digital Signal Processing*, 2nd ed., California Technical Publishing, 1997–1999.
**Supplied file:** `Guide_to_Digital_Signal_Process.pdf`, 688 PDF pages.
**Audit date:** 2026-10-25.

## 1. Quantitative coverage

| Dimension | Result |
|---|---|
| Chapters in source | 33 |
| Chapters represented | 33 |
| Sections extracted from headings | 185 |
| Sections with authored explanations | **185 / 185** |
| Sections under 35 words | 0 |
| Missing section IDs | 0 |
| Extra/unmatched section IDs | 0 |
| Formula entries | 235 |
| KaTeX rendering errors | 0 |
| Interactive labs | 33 (one per chapter) |
| Practice questions | 100 |
| Glossary terms | 90 |
| Worked examples | 33 |
| Source traceability rows | 185 |
| “Full” treatment | 158 |
| “Explanation-only” treatment | 27 |
| “Partial” / “Blocked” | 0 / 0 |

The machine-readable matrix is `js/data/traceability.json`; the human-readable matrix is `TRACEABILITY.md`; the section inventory is `CONCEPT_INVENTORY.md`.

## 2. How “full” is defined

A section is marked **Full** when it has:

1. an authored intuition and technically substantive explanation;
2. a printed book page and PDF page reference;
3. a route into the chapter’s quantitative lab and/or practice set;
4. formula/variable notes where the source supplies equations.

**Explanation-only** means the concept is primarily historical, contextual, or verbal/mathematical, and a bespoke interactive would not materially improve understanding. It does **not** mean the section was skipped: all 27 have authored explanations and source references.

## 3. The 27 explanation-only sections

These are deliberately explanation-only; the chapter lab may still touch on adjacent ideas, but it is not presented as a direct simulation of the section.

| ID | Section | Book p. | Why no bespoke simulation |
|---|---|---:|---|
| 1.2 | Telecommunications | 4 | Application survey; the chapter pipeline lab covers the shared signal chain. |
| 1.3 | Audio Processing | 5 | Application survey; audio concepts recur in Ch. 22. |
| 1.5 | Image Processing | 9 | Application survey; imaging labs appear in Ch. 23–25. |
| 3.7 | Single Bit Data Conversion | 60 | Circuit-level delta/sigma-delta; the sampling lab covers quantization but not the full feedback loop. |
| 4.5 | Execution Speed: Program Language | 76 | Engineering context; no numerical phenomenon to simulate. |
| 4.6 | Execution Speed: Hardware | 80 | Architecture survey; the hardware lab in Ch. 28 covers MAC/circular buffering. |
| 4.7 | Execution Speed: Programming Tips | 85 | Practical guidance; not a single mechanism. |
| 5.8 | Alternatives to Linearity | 104 | The linearity lab includes a median filter, so the idea is demonstrated, but the section is a survey of nonlinear methods. |
| 8.7 | Duality | 161 | Mathematical symmetry; pairs and properties labs illustrate pieces of it. |
| 12.3 | FFT Programs | 233 | Implementation bookkeeping; the butterfly lab shows the algorithm. |
| 12.5 | Further Speed Increases | 238 | Survey of radix-4/split-radix; asymptotic/complexity discussion. |
| 15.4 | Relatives of the Moving Average Filter | 280 | The moving-average lab includes multiple passes; the section’s Gaussian/Blackman comparison is contextual. |
| 16.4 | Pushing it to the Limit | 293 | Numerical-precision limits; the windowed-sinc lab includes cascade, but not the full precision study. |
| 18.3 | Speed Improvements | 316 | Architecture/partitioning survey; the FFT-convolution lab demonstrates the core method. |
| 19.3 | Narrow-band Filters | 326 | High-Q design context; the recursive lab covers poles/stability but not narrow-band synthesis. |
| 19.5 | Using Integers | 332 | Fixed-point implementation guidance; the precision lab covers Q15/round-off. |
| 22.7 | Nonlinear Audio Processing | 368 | Survey of compression, saturation, pitch shifting, vocoding. |
| 23.3 | Television Video Signals | 384 | Historical standards context. |
| 23.4 | Other Image Acquisition and Display | 386 | Modality survey. |
| 24.7 | A Closer Look at Image Convolution | 418 | Implementation caveats; the image-convolution lab demonstrates kernels/spectra. |
| 26.6 | Recursive Filter Design | 476 | Advanced optimization topic; the neural lab teaches training, not filter-coefficient optimization. |
| 28.3 | Architecture of the Digital Signal Processor | 509 | Architecture survey; the hardware lab covers the MAC loop and circular buffer. |
| 28.5 | C versus Assembly | 520 | Toolchain/practice context. |
| 28.7 | The Digital Signal Processor Market | 531 | Market survey; changes rapidly and is not a DSP mechanism. |
| 29.1 | The ADSP-2106x family | 535 | Datasheet-era hardware survey. |
| 29.2 | The SHARC EZ-KIT Lite | 537 | Specific development-board setup. |
| 29.6 | Advanced Software Tools | 546 | Tooling survey. |

## 4. Visualizations and what they demonstrate

The full list of 33 labs and their concepts is in `README.md` and on the dashboard. Coverage notes:

- **Quantitative labs** (most chapters): computed from the validated DSP engine with adjustable parameters and readouts.
- **Schematic/pipeline labs** (Ch. 1): show information flow and aliasing rather than a physical 3D model.
- **Image labs** (Ch. 23–25): synthetic test images, procedural CT phantom, 2-D FFT spectrum; models are explicitly labeled simplified.
- **Hardware/software labs** (Ch. 4, 28, 29): simulated arithmetic and timing, not a cycle-accurate DSP emulator.
- **Complex-domain labs** (Ch. 30–33): pole-zero geometry, frequency/step/impulse responses, stability.

No 3D was used. DSP is predominantly a 2D signal/geometry subject; Three.js would add cost without improving the concepts in this source. The simplified technology choice is documented in the README.

## 5. Educational completeness

- **Orientation and prerequisites:** each chapter lists objectives and prerequisite chapters; the concept map visualizes dependencies.
- **Intuition and formal treatment:** each section has a plain-language intuition and a technical explanation; core chapters add formulas, key points, caveats, and applications.
- **Visualization and exploration:** 33 labs with meaningful controls; no decorative controls were intentionally included (each control is wired to a computation or a display).
- **Worked examples:** one per chapter with stepwise reasoning and a final answer.
- **Practice:** 100 questions with correct answers, explanations, distractor-specific hints where useful, and a suggested concept review link.
- **Limitations:** caveats are attached to relevant sections; the source coverage page lists known ambiguities.
- **Mastery:** chapter completion requires ≥95% concept coverage, a lab visit, and ≥70% quiz best score; review mode collects weak chapters and missed concepts.

## 6. What is *not* covered

No source section was silently omitted. However:

1. **Depth is not uniform.** Core chapters (sampling, convolution, DFT/FFT, filters, complex methods) receive more formulas, examples, and lab controls than historical/survey sections. This is a pedagogical choice, not a claim that every section has equal depth.
2. **The source text is not reproduced.** The app summarizes and explains; it does not include the book's full prose, figures, tables, or programs. The PDF is available locally via the source links.
3. **Some source figures/tables are represented conceptually, not reproduced.** For example, the book's filter-comparison tables and hardware timing diagrams are summarized; the labs use computed responses instead of scanned figures.
4. **Hardware chapters are era-specific.** Chapters 28–29 describe late-1990s ADSP-2106x/SHARC hardware. The principles are covered; current devices are not.
5. **Audio is visual, not audible.** Companding/data-rate concepts are quantitative and plotted, but the app does not play audio.
6. **Neural-network training is a perceptron with one quadratic feature,** not a full backpropagation deep-network implementation. The chapter's conceptual claims and limitations are covered; state-of-the-art architectures are outside the source.
7. **CT reconstruction uses a small 64×64 phantom and simplified ramp filter.** It demonstrates filtered vs. unfiltered backprojection, not clinical reconstruction.
8. **Quiz-to-concept mapping is heuristic.** The review suggestions use keyword overlap; they are not a validated psychometric model.

## 7. Source ambiguities recorded

| Ambiguity | Handling |
|---|---|
| “Nyquist frequency” vs. “Nyquist rate” | The course states that the literature is inconsistent and follows Smith: both mean half the sampling rate. |
| Cutoff convention | −3 dB for Butterworth/Chebyshev; 50% amplitude for windowed-sinc. Labs label the convention. |
| Chebyshev ripple units | Source uses percent; app shows dB and explains the relation. |
| Chebyshev even-order DC gain | After max-passband normalization, even-order filters sit at −ripple dB at DC. The lab states this. |
| Duplicate PDF pages | Chapter 2 PDF pages 49–72 duplicate 25–48; index uses the first copy and printed page numbers. |
| Source-era hardware | Ch. 28–29 details are explicitly dated; current hardware is not claimed. |

## 8. Verification results

- **Content validator:** 33 chapters, 185 sections, 0 missing, 0 too short, 0 extra; 33 labs; 100 questions.
- **Formula check:** all 235 formulas render in KaTeX with `throwOnError: true`; 0 errors.
- **Unit tests:** 28/28 passing (`npm run test:unit`).
- **Browser tests:** 72/72 checks passing (`npm run test:e2e`), including every chapter/lab, quiz persistence, search, reference pages, themes, mobile layout, reduced motion, and zero console errors.
- **Manual review:** representative screenshots for home, labs, formulas, map, source, practice, dark theme, and mobile.

## 9. Honest conclusion

This is a complete section-level companion to the supplied book: every one of the 185 extracted sections has an authored, page-referenced explanation, and every chapter has an interactive lab, worked example, and practice set. It is not a facsimile of the book, and 27 sections are intentionally explanation-only. The numerical engine is tested; the pedagogical claims are supported by the content and exercises. Remaining gaps are stated above rather than hidden.
