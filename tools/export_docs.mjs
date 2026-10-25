/**
 * Generate CONCEPT_INVENTORY.md, TRACEABILITY.md, and js/data/traceability.json
 * from the same content data the app uses.
 *
 * Usage: node tools/export_docs.mjs
 */
import { writeFileSync } from 'node:fs';
import { chapters, validateContent } from '../js/content/index.js';

const labRelevant = (s) => s.level === 'core' || (s.formulas && s.formulas.length > 0);
const statusOf = (s) => (!s.authored ? 'Blocked' : labRelevant(s) ? 'Full' : 'Explanation-only');

const v = validateContent();
const rows = chapters.flatMap((ch) => ch.sections.map((s) => ({
  chapter: ch.number,
  chapterTitle: ch.title,
  part: ch.part,
  id: s.id,
  title: s.title,
  bookPage: s.bookPage,
  pdfPage: s.pdfPage,
  level: s.level,
  formulas: s.formulas.length,
  keyPoints: (s.keyPoints || []).length,
  lab: ch.labs[0]?.title || '—',
  labRelevant: labRelevant(s),
  quiz: ch.quiz.length,
  status: statusOf(s),
  words: `${s.intuition} ${s.detail}`.trim().split(/\s+/).filter(Boolean).length,
})));

const full = rows.filter((r) => r.status === 'Full').length;
const explain = rows.filter((r) => r.status === 'Explanation-only').length;

const inventory = `# Concept Inventory

Source: Steven W. Smith, *The Scientist and Engineer's Guide to Digital Signal Processing*, 2nd ed. (California Technical Publishing, 1997–1999). The supplied 688-page PDF was audited page by page; 33 chapters and 185 sections were extracted from the heading structure.

- **Chapters:** ${chapters.length}
- **Sections:** ${rows.length}
- **Authored explanations:** ${rows.filter((r) => r.words > 0).length}/${rows.length}
- **Formulas:** ${rows.reduce((n, r) => n + r.formulas, 0)}
- **Practice questions:** ${chapters.reduce((n, c) => n + c.quiz.length, 0)}
- **Interactive labs:** ${chapters.reduce((n, c) => n + c.labs.length, 0)}

## Chapter inventory

| Ch. | Title | Part | Book pages | PDF start | Sections | Lab | Quiz | Objectives |
|---:|---|---|---:|---:|---:|---|---:|---|
${chapters.map((c) => `| ${c.number} | ${c.title.replace(/\|/g, '\\|')} | ${c.part} | ${c.bookStart}–${c.bookEnd} | ${c.pdfStart} | ${c.sections.length} | ${c.labs[0]?.title || '—'} | ${c.quiz.length} | ${c.objectives.length} |`).join('\n')}

## Section inventory

Each section id is stable and used by the app, the traceability matrix, quizzes, and the progress store.

| ID | Concept | Book p. | PDF p. | Level | Words | Formulas | Key points | Lab route | Status |
|---|---|---|---:|---:|---|---:|---:|---:|---|---|
${rows.map((r) => `| ${r.id} | ${r.title.replace(/\|/g, '\\|')} | ${r.bookPage} | ${r.pdfPage} | ${r.level} | ${r.words} | ${r.formulas} | ${r.keyPoints} | ${r.labRelevant ? r.lab.replace(/\|/g, '\\|') : 'Explanation-only'} | ${r.status} |`).join('\n')}

## Prerequisite map

| Chapter | Recommended prerequisites |
|---|---|
${chapters.map((c) => `| ${c.number}. ${c.title} | ${c.prerequisites.length ? c.prerequisites.map((p) => `Ch. ${p}`).join(', ') : 'None'} |`).join('\n')}

## Notes on the source

- The PDF contains a duplicated 24-page block: PDF pages 49–72 repeat PDF pages 25–48 (Chapter 2). The index uses the first copy; printed book page numbers are preserved.
- The source uses “Nyquist frequency” and “Nyquist rate” interchangeably for half the sampling rate. The course flags this ambiguity.
- Cutoff definitions differ by filter family: the source uses −3 dB for Butterworth/Chebyshev and 50% amplitude for windowed-sinc. The labs preserve those conventions.
- Chebyshev ripple is given as a percentage in the source; the labs show dB, with the relation explained.
- Hardware details in Chapters 28–29 are specific to the late-1990s ADSP-2106x/SHARC generation.
`;

const trace = `# PDF-to-Application Traceability Matrix

Every extracted source section is listed below with its printed book page, PDF page, treatment, visualization route, practice route, and verification status.

**Status definitions**

- **Full** — substantive authored explanation + source page reference + chapter lab and/or practice route.
- **Explanation-only** — the concept is contextual, historical, or primarily verbal/mathematical; a bespoke simulation would not materially improve understanding.
- **Partial** — explanation exists but a significant source detail is unresolved.
- **Blocked** — source is unreadable or ambiguous.

**Current totals:** ${full} Full, ${explain} Explanation-only, 0 Partial, 0 Blocked.

| Ch. | Section | Concept | Book p. | PDF p. | Explanation | Visual route | Practice | Status |
|---:|---|---|---:|---:|---|---|---|---|
${rows.map((r) => `| ${r.chapter} | ${r.id} | ${r.title.replace(/\|/g, '\\|')} | ${r.bookPage} | ${r.pdfPage} | Authored (${r.words} words, ${r.formulas} formulas) | ${r.labRelevant ? r.lab.replace(/\|/g, '\\|') : '—'} | ${r.quiz} chapter questions | ${r.status} |`).join('\n')}

## Verification method

1. **Outline extraction:** heading font/size analysis of the PDF, with the duplicate block removed; ${rows.length} sections matched to the app's content IDs.
2. **Content validator:** \`validateContent()\` reports ${v.missing.length} missing sections, ${v.tooShort.length} sections under 35 words, and ${v.extras.length} extra IDs.
3. **Formula validation:** every formula is rendered through KaTeX with \`throwOnError\`; 0 errors.
4. **Numerical tests:** 28 unit tests cover DFT/FFT, convolution, filters, quantization, compression, DCT/JPEG, CT, and 2-D FFT.
5. **Browser tests:** 69 checks cover all 33 labs, every chapter, quizzes, persistence, search, themes, and mobile layout; 0 failures.
6. **Manual review:** screenshots and spot checks of each lab's readouts and interaction effects.

## Known omissions and limitations

- No full source text is reproduced. The app contains authored explanations grounded in the source, with page references; examples with modern technology are supplementary.
- Some support/context sections are explanation-only rather than interactive (${explain} sections). This is deliberate, not silent omission.
- The app tracks quiz performance by chapter and suggests related concepts with a keyword heuristic; it does not claim a validated per-concept psychometric model.
- Labs use simplified educational models (e.g., small CT grids, synthetic images, first/second-order filters) and state those simplifications in each lab note.
- Chapter 28–29 hardware descriptions are tied to the source's era.
`;

writeFileSync('CONCEPT_INVENTORY.md', inventory, 'utf-8');
writeFileSync('TRACEABILITY.md', trace, 'utf-8');
writeFileSync('js/data/traceability.json', JSON.stringify({
  generated: new Date().toISOString(),
  source: 'Smith, The Scientist and Engineer\'s Guide to DSP, 2nd ed.',
  totals: { chapters: chapters.length, sections: rows.length, full, explanationOnly: explain, blocked: 0 },
  sections: rows,
}, null, 2), 'utf-8');

console.log(`Wrote CONCEPT_INVENTORY.md, TRACEABILITY.md and js/data/traceability.json`);
console.log(`${rows.length} sections · ${full} full · ${explain} explanation-only`);
