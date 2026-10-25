/**
 * End-to-end browser tests for the DSP Fieldbook.
 * Starts its own static server on port 4180, drives Chromium, and fails on
 * console errors, missing labs, broken interactions, or layout overflow.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';

const PORT = 4180;
const BASE = `http://127.0.0.1:${PORT}`;
const shots = new URL('./screenshots/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
mkdirSync(shots, { recursive: true });

let passed = 0;
const failures = [];
async function step(name, fn) {
  try { await fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (err) { failures.push({ name, err }); console.log(`  ✗ ${name}\n    ${err.message}`); }
}
function waitPort(port, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tryOnce = () => {
      const s = createServer();
      s.once('error', () => { s.close(); setTimeout(tryOnce, 150); });
      s.once('listening', () => s.close(() => resolve()));
      s.listen(port, '127.0.0.1');
      if (Date.now() - start > timeout) reject(new Error('server timeout'));
    };
    tryOnce();
  });
}

const server = spawn(process.execPath, ['server.js', String(PORT)], { cwd: process.cwd(), stdio: 'ignore' });
let browser;

try {
  await waitPort(PORT);
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR: ${e.message}`));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  console.log('\nContent and dashboard');
  await step('dashboard shows 33 chapters and hero', async () => {
    assert.equal(await page.locator('.chapter-card').count(), 33);
    assert.match(await page.locator('h1').first().innerText(), /See the signal/);
    assert.equal(await page.locator('#top-progress-text').innerText(), '0%');
  });
  await step('content validator reports 185 sections, 35 labs, and 185 figures', async () => {
    const v = await page.evaluate(() => window.__dsp.validateContent());
    assert.equal(v.chapters, 33);
    assert.equal(v.sections, 185);
    assert.deepEqual(v.missing, []);
    assert.deepEqual(v.tooShort, []);
    assert.deepEqual(v.extras, []);
    assert.deepEqual(v.missingVisuals, []);
    assert.equal(v.figures, 185);
    assert.equal(v.labs, 35);
    assert.equal(v.quizzes, 100);
  });
  await step('source PDF is served', async () => {
    const res = await page.request.get(`${BASE}/source/Guide_to_Digital_Signal_Process.pdf`);
    assert.equal(res.status(), 200);
    assert.ok((await res.body()).length > 1_000_000);
  });
  await page.screenshot({ path: `${shots}/01-home.png` });

  console.log('\nEvery chapter renders and every lab starts');
  const chapters = await page.evaluate(() => window.__dsp.chapters.map((c) => ({ n: c.number, title: c.title, sections: c.sections.length, quiz: c.quiz.length, lab: c.labs[0]?.id, labs: c.labs.length })));
  for (const ch of chapters) {
    await step(`chapter ${ch.n}: ${ch.title}`, async () => {
      await page.goto(`${BASE}/#/chapter/${ch.n}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.concept-card');
      assert.equal(await page.locator('.concept-card').count(), ch.sections);
      await page.goto(`${BASE}/#/chapter/${ch.n}/lab`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.lab-card', { timeout: 10000 });
      assert.equal(await page.locator('.lab-card').count(), ch.labs);
      assert.ok((await page.locator('.lab-card canvas').count()) >= ch.labs, 'each lab has a canvas');
      assert.ok(!/unavailable|error/i.test(await page.locator('.lab-head h2').first().innerText()));
      const w = await page.locator('.lab-card canvas').first().evaluate((c) => c.width);
      assert.ok(w > 0, 'canvas has a backing width');
    });
  }
  await page.goto(`${BASE}/#/chapter/3/lab`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${shots}/02-lab-sampling.png` });
  await page.goto(`${BASE}/#/chapter/3`, { waitUntil: 'networkidle' });
  await step('every concept on a chapter has a figure', async () => {
    assert.equal(await page.locator('.concept-figure').count(), 7);
    assert.equal(await page.locator('.concept-figure img').count(), 7);
  });
  await step('figure opens in the image viewer', async () => {
    await page.locator('.figure-open').first().click();
    await page.waitForTimeout(120);
    assert.equal(await page.locator('#image-modal').isVisible(), true);
    assert.ok((await page.locator('#image-title').innerText()).length > 3);
    await page.keyboard.press('Escape');
  });
  await page.screenshot({ path: `${shots}/02b-concept-figure.png` });

  console.log('\nQuiz, feedback, scoring, and persistence');
  await page.goto(`${BASE}/#/chapter/3/practice`, { waitUntil: 'networkidle' });
  const quiz = await page.evaluate(() => window.__dsp.chapters[2].quiz.map((q) => q.answer));
  await step('correct answer produces positive feedback', async () => {
    await page.locator('.quiz-q').first().locator('.option').nth(quiz[0]).click();
    await page.waitForTimeout(80);
    const fb = page.locator('.quiz-q').first().locator('.feedback');
    assert.match(await fb.innerText(), /Correct/);
    assert.ok(await fb.locator('a[href*="/learn/"]').count() > 0, 'feedback links to a concept');
  });
  await step('completing a quiz records a best score', async () => {
    const qs = page.locator('.quiz-q');
    for (let i = 1; i < await qs.count(); i++) await qs.nth(i).locator('.option').first().click();
    await page.waitForTimeout(150);
    assert.match(await page.locator('#quiz-finish').innerText(), /ATTEMPT COMPLETE/);
    const st = await page.evaluate(() => JSON.parse(localStorage.getItem('dsp-fieldbook-state-v1')));
    assert.ok(st.quiz['3'], 'quiz record saved');
    assert.equal(st.quiz['3'].total, 4);
    assert.ok(st.quiz['3'].attempts >= 1);
  });
  await step('retry clears the attempt', async () => {
    await page.locator('[data-action="quiz-retry"]').click();
    await page.waitForTimeout(120);
    assert.equal(await page.locator('.quiz-q .option.correct').count(), 0);
  });
  await page.screenshot({ path: `${shots}/03-practice.png` });

  console.log('\nStudy, bookmark, notes, and progress');
  await page.goto(`${BASE}/#/chapter/3`, { waitUntil: 'networkidle' });
  await step('mark studied and bookmark a section', async () => {
    await page.locator('[data-action="toggle-study"]').first().click();
    await page.locator('[data-action="toggle-bookmark-section"]').first().click();
    assert.equal(await page.locator('.concept-card.studied').count(), 1);
    assert.equal(await page.locator('[data-action="toggle-bookmark-section"]').first().getAttribute('aria-label'), 'Remove bookmark');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await step('study and bookmark survive reload', async () => {
    assert.equal(await page.locator('.concept-card.studied').count(), 1);
    assert.equal(await page.locator('[data-action="toggle-bookmark-section"]').first().getAttribute('aria-label'), 'Remove bookmark');
  });
  await step('bookmark appears on the bookmarks page and can be removed', async () => {
    await page.goto(`${BASE}/#/bookmarks`, { waitUntil: 'networkidle' });
    assert.ok(await page.locator('.list-item').count() >= 1);
    await page.locator('[data-action="remove-bookmark-chapter"]').first().click().catch(() => {});
  });
  await step('notes autosave and persist', async () => {
    await page.goto(`${BASE}/#/chapter/3/notes`, { waitUntil: 'networkidle' });
    await page.locator('#chapter-notes').fill('Aliasing is irreversible. Filter before sampling.');
    await page.waitForTimeout(900);
    await page.reload({ waitUntil: 'networkidle' });
    assert.match(await page.locator('#chapter-notes').inputValue(), /irreversible/);
    const st = await page.evaluate(() => JSON.parse(localStorage.getItem('dsp-fieldbook-state-v1')));
    assert.ok(st.notes['3']);
  });
  await step('dashboard progress updates', async () => {
    await page.goto(`${BASE}/#/home`, { waitUntil: 'networkidle' });
    assert.notEqual(await page.locator('#top-progress-text').innerText(), '0%');
  });

  console.log('\nSearch, reference pages, and theme');
  await step('search opens with / and finds aliasing', async () => {
    await page.keyboard.press('/');
    await page.locator('#search-input').fill('aliasing');
    await page.waitForTimeout(120);
    assert.ok(await page.locator('.search-result').count() > 0);
    await page.locator('.search-result').first().click();
    await page.waitForTimeout(150);
    assert.equal(await page.locator('#search-modal').isHidden(), true);
    assert.match(page.url(), /#\/chapter\//);
  });
  for (const [route, h1] of [['#/contents', 'The whole book, in order'], ['#/labs', 'Lab gallery'], ['#/visuals', 'Every figure, in one place'], ['#/map', 'Concept dependency map'], ['#/glossary', 'Glossary'], ['#/formulas', 'Formula sheet'], ['#/source', 'PDF-to-application coverage'], ['#/review', 'Review queue'], ['#/bookmarks', 'Bookmarks'], ['#/notes', 'Notes'], ['#/quiz', 'Practice and mastery checks']]) {
    await step(`reference route ${route}`, async () => {
      await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
      assert.match(await page.locator('h1').first().innerText(), new RegExp(h1));
    });
  }
  await step('formula filter works without navigating', async () => {
    await page.goto(`${BASE}/#/formulas`, { waitUntil: 'networkidle' });
    const before = await page.locator('.formula-item').count();
    assert.equal(before, 235);
    await page.locator('#formula-search').fill('Chebyshev');
    await page.waitForTimeout(100);
    const visible = await page.locator('.formula-item:visible').count();
    assert.ok(visible > 0 && visible < before);
    assert.match(page.url(), /#\/formulas$/);
  });
  await step('source coverage has 33 chapter rows', async () => {
    await page.goto(`${BASE}/#/source`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.trace-table tbody tr').count(), 33);
  });
  await step('visual index lists unique figures', async () => {
    await page.goto(`${BASE}/#/visuals`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.visual-card').count(), 83);
    assert.ok(await page.locator('.visual-card img').first().evaluate((img) => img.complete && img.naturalWidth > 0));
  });
  await step('visual index filters original diagrams and licensed images', async () => {
    await page.locator('[data-visual-filter="image"]').click();
    await page.waitForTimeout(100);
    const visible = page.locator('.visual-card:visible');
    const n = await visible.count();
    assert.ok(n > 0 && n < 83, `expected a filtered subset, got ${n}`);
    const kinds = await visible.evaluateAll((cards) => [...new Set(cards.map((c) => c.dataset.visualKind))]);
    assert.deepEqual(kinds, ['image']);
  });
  await step('all local figures load', async () => {
    const sources = await page.evaluate(() => [...new Set(window.__dsp.visualList.map((v) => v.src))]);
    let bad = [];
    for (const src of sources) {
      const r = await page.request.get(`${BASE}/${src}`);
      if (r.status() !== 200) bad.push(src);
    }
    assert.deepEqual(bad, []);
  });
  await step('source reader embeds the local PDF at a page', async () => {
    await page.goto(`${BASE}/#/reader?page=73`, { waitUntil: 'domcontentloaded' });
    assert.match(await page.locator('h1').first().innerText(), /Source reader/);
    assert.match(await page.locator('#pdf-frame').getAttribute('src'), /#page=73/);
  });
  await step('theme toggles and persists', async () => {
    await page.goto(`${BASE}/#/home`, { waitUntil: 'networkidle' });
    const before = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.locator('#theme-toggle').click();
    const after = await page.evaluate(() => document.documentElement.dataset.theme);
    assert.notEqual(before, after);
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), after);
  });
  await page.screenshot({ path: `${shots}/04-dark.png` });

  console.log('\nRepresentative lab controls');
  await step('sampling lab reports aliasing above Nyquist', async () => {
    await page.goto(`${BASE}/#/chapter/3/lab`, { waitUntil: 'networkidle' });
    await page.locator('#samp-f').evaluate((el) => { el.value = '9'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForTimeout(120);
    assert.match(await page.locator('[data-readout="alias"]').innerText(), /aliased/);
  });
  await step('windowed-sinc lab updates kernel length', async () => {
    await page.goto(`${BASE}/#/chapter/16/lab`, { waitUntil: 'networkidle' });
    const before = await page.locator('[data-readout="m"]').innerText();
    await page.locator('#ws-bw').evaluate((el) => { el.value = '0.02'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForTimeout(120);
    assert.notEqual(await page.locator('[data-readout="m"]').innerText(), before);
  });
  await step('Chebyshev lab order changes overshoot', async () => {
    await page.goto(`${BASE}/#/chapter/20/lab`, { waitUntil: 'networkidle' });
    const before = await page.locator('[data-readout="over"]').innerText();
    await page.locator('#cheb-order').evaluate((el) => { el.value = '8'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForTimeout(150);
    assert.notEqual(await page.locator('[data-readout="over"]').innerText(), before);
  });
  await step('neural lab solves XOR with a quadratic feature', async () => {
    await page.goto(`${BASE}/#/chapter/26/lab`, { waitUntil: 'networkidle' });
    await page.locator('#nn-data').selectOption('xor');
    await page.waitForTimeout(250);
    assert.match(await page.locator('[data-readout="acc"]').innerText(), /100/);
  });
  await step('hardware write button changes the circular buffer', async () => {
    await page.goto(`${BASE}/#/chapter/28/lab`, { waitUntil: 'networkidle' });
    const before = await page.locator('[data-readout="writes"]').innerText();
    await page.locator('[data-lab-push]').click();
    await page.waitForTimeout(80);
    assert.notEqual(await page.locator('[data-readout="writes"]').innerText(), before);
  });
  await step('custom-filter deconvolution mode shows a recovery', async () => {
    await page.goto(`${BASE}/#/chapter/17/lab`, { waitUntil: 'networkidle' });
    await page.locator('[data-seg="cf-mode"][data-value="deconv"]').click();
    await page.waitForTimeout(200);
    assert.match(await page.locator('[data-readout="err"]').innerText(), /e-/);
  });
  await step('sigma-delta lab reports a finite SNR and ENOB', async () => {
    await page.goto(`${BASE}/#/chapter/3/lab`, { waitUntil: 'networkidle' });
    const lab = page.locator('#lab-sigma-delta');
    await lab.waitFor();
    assert.match(await lab.locator('[data-readout="snr"]').innerText(), /dB/);
    assert.match(await lab.locator('[data-readout="enob"]').innerText(), /bit/);
  });
  await step('biquad resonator becomes unstable past the unit circle', async () => {
    await page.goto(`${BASE}/#/chapter/19/lab`, { waitUntil: 'networkidle' });
    const lab = page.locator('#lab-resonator');
    await lab.waitFor();
    await lab.locator('#rq-r').evaluate((el) => { el.value = '1.03'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForTimeout(120);
    assert.match(await lab.locator('[data-readout="stable"]').innerText(), /UNSTABLE/);
  });

  console.log('\nResponsive and accessibility');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/#/home`, { waitUntil: 'networkidle' });
  await step('mobile has no horizontal overflow', async () => {
    const sizes = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    assert.ok(sizes.sw <= sizes.cw + 1, JSON.stringify(sizes));
  });
  await step('mobile menu opens the sidebar', async () => {
    await page.locator('#menu-toggle').click();
    assert.equal(await page.locator('#sidebar').evaluate((el) => el.classList.contains('open')), true);
    await page.locator('#sidebar-scrim').click({ position: { x: 370, y: 40 } });
  });
  await step('mobile search opens', async () => {
    await page.locator('#mobile-search').click();
    assert.equal(await page.locator('#search-modal').isVisible(), true);
    await page.keyboard.press('Escape');
  });
  await step('mobile chapter lab fits', async () => {
    await page.goto(`${BASE}/#/chapter/6/lab`, { waitUntil: 'networkidle' });
    const fit = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    assert.ok(fit.sw <= fit.cw + 1, JSON.stringify(fit));
  });
  await step('mobile concept figure fits', async () => {
    await page.goto(`${BASE}/#/chapter/6`, { waitUntil: 'networkidle' });
    const fit = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    assert.ok(fit.sw <= fit.cw + 1, JSON.stringify(fit));
  });
  await step('mobile formula sheet fits', async () => {
    await page.goto(`${BASE}/#/formulas`, { waitUntil: 'networkidle' });
    const fit = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    assert.ok(fit.sw <= fit.cw + 1, JSON.stringify(fit));
  });
  await page.screenshot({ path: `${shots}/05-mobile.png` });
  await step('reduced motion preference is applied', async () => {
    await page.goto(`${BASE}/#/home`, { waitUntil: 'networkidle' });
    await page.locator('#help-btn').click();
    await page.locator('#pref-reduced-motion').check();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.reducedMotion), 'true');
    await page.keyboard.press('Escape');
  });
  await step('skip link and main landmark exist', async () => {
    assert.equal(await page.locator('a.skip-link').count(), 1);
    assert.equal(await page.locator('main#main').count(), 1);
  });

  await step('no console errors during the full run', async () => {
    assert.deepEqual(consoleErrors, []);
  });

  await context.close();
} finally {
  await browser?.close();
  server.kill();
}

console.log(`\n${passed} checks passed, ${failures.length} failed.`);
if (failures.length) {
  for (const f of failures) console.error(`\nFAIL: ${f.name}\n${f.err.stack}`);
  process.exit(1);
}
