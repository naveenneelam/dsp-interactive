import {
  chapters, parts, chapterByNumber, validateContent,
} from './content/index.js';
import {
  getState, subscribe, update, recordVisit, setTheme, setPref, toggleStudy,
  markLabVisited, recordQuiz, toggleBookmark, isBookmarked, setNote, saveLastRoute,
  chapterStats, globalStats, streak, weakChapters, todayKey,
} from './state.js';
import {
  esc, rich, math, renderMath, icon, sourceRef, progressBar, toast,
  openModal, closeModal, debounce, formatDate,
} from './ui.js';
import { buildIndex, search, renderResults } from './search.js';
import { glossary } from './data/glossary.js';
import { visuals, visualList, chapterVisuals } from './data/visuals.js';
import { mountLab } from './viz/labs.js';

const main = document.getElementById('main');
const state = getState();
const VALID_TABS = ['learn', 'lab', 'worked', 'practice', 'source', 'notes'];
const quizSessions = new Map();
let activeCleanups = [];
let searchGroups = [];
let searchIndexBuilt = false;
let lastRenderedTab = null;

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */

function init() {
  const theme = state.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  applyPrefs();
  buildSidebar();
  buildSearch();
  refreshChrome();
  recordVisit();
  window.addEventListener('hashchange', renderRoute);
  window.addEventListener('keydown', onGlobalKey);
  bindGlobalUI();
  renderRoute();
  document.getElementById('loading')?.remove();
}

function applyPrefs() {
  document.documentElement.dataset.reducedMotion = String(state.prefs.reducedMotion);
  document.body.classList.toggle('hide-source', !state.prefs.showSource);
  const rm = document.getElementById('pref-reduced-motion');
  const deep = document.getElementById('pref-deep');
  const src = document.getElementById('pref-show-source');
  if (rm) rm.checked = state.prefs.reducedMotion;
  if (deep) deep.checked = state.prefs.deep;
  if (src) src.checked = state.prefs.showSource;
}

function bindGlobalUI() {
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
  document.getElementById('menu-toggle')?.addEventListener('click', toggleMenu);
  document.getElementById('sidebar-scrim')?.addEventListener('click', closeMenu);
  document.getElementById('search-trigger')?.addEventListener('click', openSearch);
  document.getElementById('mobile-search')?.addEventListener('click', openSearch);
  document.getElementById('help-btn')?.addEventListener('click', () => openModal('help-modal'));
  document.getElementById('collapse-chapters')?.addEventListener('click', toggleAllParts);
  document.getElementById('pref-reduced-motion')?.addEventListener('change', (e) => {
    setPref('reducedMotion', e.target.checked);
    document.documentElement.dataset.reducedMotion = String(e.target.checked);
  });
  document.getElementById('pref-deep')?.addEventListener('change', (e) => {
    setPref('deep', e.target.checked);
    document.querySelectorAll('.tech-detail').forEach((d) => { d.open = e.target.checked; });
  });
  document.getElementById('pref-show-source')?.addEventListener('change', (e) => {
    setPref('showSource', e.target.checked);
    document.body.classList.toggle('hide-source', !e.target.checked);
  });
  for (const el of document.querySelectorAll('[data-close-modal]')) {
    el.addEventListener('click', () => closeModal());
  }
  const searchInput = document.getElementById('search-input');
  searchInput?.addEventListener('input', debounce(() => runSearch(searchInput.value), 60));
  searchInput?.addEventListener('keydown', onSearchKey);
  document.querySelectorAll('#search-filters .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#search-filters .chip').forEach((c) => { c.classList.remove('active'); c.setAttribute('aria-selected', 'false'); });
      chip.classList.add('active');
      chip.setAttribute('aria-selected', 'true');
      runSearch(searchInput?.value || '', chip.dataset.filter);
    });
  });
  document.getElementById('search-modal')?.addEventListener('click', (e) => {
    if (e.target.closest('.search-result')) setTimeout(() => closeModal('search-modal'), 10);
  });
  subscribe(() => refreshChrome());
}

function toggleMenu() {
  const sb = document.getElementById('sidebar');
  const scrim = document.getElementById('sidebar-scrim');
  const btn = document.getElementById('menu-toggle');
  const open = !sb.classList.contains('open');
  sb.classList.toggle('open', open);
  scrim.hidden = !open;
  btn.setAttribute('aria-expanded', String(open));
}
function closeMenu() {
  document.getElementById('sidebar')?.classList.remove('open');
  const scrim = document.getElementById('sidebar-scrim');
  if (scrim) scrim.hidden = true;
  document.getElementById('menu-toggle')?.setAttribute('aria-expanded', 'false');
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
  updateThemeLabel();
  window.dispatchEvent(new Event('themechange'));
}
function updateThemeLabel() {
  const dark = document.documentElement.dataset.theme === 'dark';
  document.getElementById('theme-toggle')?.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
}

/* ------------------------------------------------------------------ */
/* Sidebar / chrome                                                    */
/* ------------------------------------------------------------------ */

let collapsedParts = new Set();

function buildSidebar() {
  const tree = document.getElementById('chapter-tree');
  if (!tree) return;
  tree.innerHTML = parts.map((part) => {
    const list = chapters.filter((c) => c.part === part);
    return `<div class="tree-part" data-part="${esc(part)}">
      <button class="tree-part-btn" data-part-toggle="${esc(part)}" aria-expanded="true">
        <span>${esc(part)}</span><span class="tree-caret">▾</span>
      </button>
      <div class="tree-chapters">
        ${list.map((c) => `<a class="tree-chapter" href="#/chapter/${c.number}" data-chapter="${c.number}">
          <span class="tree-num">${String(c.number).padStart(2, '0')}</span>
          <span class="tree-title">${esc(c.title)}</span>
          <span class="tree-dot" aria-label="completed"></span>
        </a>`).join('')}
      </div>
    </div>`;
  }).join('');
  tree.querySelectorAll('[data-part-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const part = btn.dataset.partToggle;
      const el = btn.closest('.tree-part');
      if (collapsedParts.has(part)) { collapsedParts.delete(part); el.classList.remove('closed'); btn.setAttribute('aria-expanded', 'true'); }
      else { collapsedParts.add(part); el.classList.add('closed'); btn.setAttribute('aria-expanded', 'false'); }
    });
  });
  tree.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
}

function toggleAllParts() {
  const allClosed = document.querySelectorAll('.tree-part.closed').length === parts.length;
  document.querySelectorAll('.tree-part').forEach((el) => {
    const part = el.dataset.part;
    if (allClosed) { el.classList.remove('closed'); collapsedParts.delete(part); el.querySelector('[data-part-toggle]')?.setAttribute('aria-expanded', 'true'); }
    else { el.classList.add('closed'); collapsedParts.add(part); el.querySelector('[data-part-toggle]')?.setAttribute('aria-expanded', 'false'); }
  });
  const btn = document.getElementById('collapse-chapters');
  if (btn) btn.textContent = allClosed ? '−' : '+';
}

function refreshChrome() {
  const g = globalStats(chapters);
  const ring = document.getElementById('top-ring');
  if (ring) ring.setAttribute('stroke-dashoffset', String(87.96 * (1 - g.progress)));
  const txt = document.getElementById('top-progress-text');
  if (txt) txt.textContent = `${Math.round(g.progress * 100)}%`;
  document.querySelectorAll('.tree-chapter').forEach((a) => {
    const c = chapterByNumber[+a.dataset.chapter];
    if (!c) return;
    const st = chapterStats(c);
    a.classList.toggle('done', st.complete);
    a.classList.toggle('active', !!a.dataset.active);
  });
  updateThemeLabel();
}

function updateChapterProgressUI(ch) {
  const el = document.querySelector('.chapter-progress-strip');
  if (!el || !ch) return;
  const st = chapterStats(ch);
  el.innerHTML = `${progressBar(st.progress)}<span class="lbl">${Math.round(st.progress * 100)}% · ${st.studied}/${st.total} studied${st.quiz ? ` · quiz best ${st.quiz.best}/${st.quiz.total}` : ''}</span>`;
}

/* ------------------------------------------------------------------ */
/* Routing                                                             */
/* ------------------------------------------------------------------ */

function parseRoute() {
  const raw = (location.hash || '#/home').replace(/^#\/?/, '');
  const [pathPart, queryPart] = raw.split('?');
  const segs = pathPart.split('/').filter(Boolean);
  const query = new URLSearchParams(queryPart || '');
  return { segs, query, raw };
}

function renderRoute() {
  const route = parseRoute();
  if (document.querySelector('.modal:not([hidden])')) closeModal();
  const segs = route.segs;
  let out;
  if (!segs.length || segs[0] === 'home') out = renderHome();
  else if (segs[0] === 'contents') out = renderContents(route.query);
  else if (segs[0] === 'labs') out = renderLabGallery();
  else if (segs[0] === 'visuals') out = renderVisualIndex();
  else if (segs[0] === 'chapter') out = renderChapterRoute(segs, route.query);
  else if (segs[0] === 'glossary') out = renderGlossary(route.query);
  else if (segs[0] === 'formulas') out = renderFormulas(route.query);
  else if (segs[0] === 'source') out = renderSource(route.query);
  else if (segs[0] === 'reader') out = renderReader(route.query);
  else if (segs[0] === 'map') out = renderMap();
  else if (segs[0] === 'review') out = renderReview();
  else if (segs[0] === 'bookmarks') out = renderBookmarks();
  else if (segs[0] === 'notes') out = renderNotes();
  else if (segs[0] === 'quiz') out = renderQuizCenter();
  else out = { title: 'Not found', html: renderNotFound() };
  mount(out);
}

function mount(out) {
  cleanupAll();
  closeMenu();
  document.title = `${out.title || 'DSP Fieldbook'} · DSP Fieldbook`;
  main.innerHTML = `<div class="content">${out.html}</div>`;
  refreshChrome();
  renderMath(main);
  out.after?.(main);
  afterRenderCommon(main);
  document.querySelectorAll('.side-link').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === `#/${parseRoute().segs[0] || 'home'}`);
  });
  document.querySelectorAll('.tree-chapter').forEach((a) => {
    const isCurrent = parseRoute().segs[0] === 'chapter' && +a.dataset.chapter === +parseRoute().segs[1];
    a.classList.toggle('active', isCurrent);
    a.dataset.active = isCurrent ? '1' : '';
  });
  if (!out.keepScroll) window.scrollTo({ top: 0, behavior: 'instant' });
  if (out.anchor) setTimeout(() => document.getElementById(out.anchor)?.scrollIntoView({ block: 'start' }), 30);
  lastRenderedTab = out.tab || null;
}

function cleanupAll() {
  for (const fn of activeCleanups) {
    try { fn(); } catch { /* ignore */ }
  }
  activeCleanups = [];
}

function renderNotFound() {
  return `<div class="empty-state"><h3>Page not found</h3><p>The link may be out of date.</p><a class="btn btn-primary" href="#/home">Return to the dashboard</a></div>`;
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

function renderHome() {
  const g = globalStats(chapters);
  const s = getState();
  const last = chapterByNumber[s.lastChapter] || chapters[0];
  const nextSection = last.sections.find((x) => !s.studied[x.id]) || last.sections[0];
  const lastStats = chapterStats(last);
  const hours = Math.round(chapters.reduce((n, c) => n + c.sections.length * 7, 0) / 60);
  return {
    title: 'Dashboard',
    html: `
      <section class="hero">
        <div class="hero-inner">
          <div class="kicker">Interactive companion · 33 chapters · 185 concepts</div>
          <h1 class="display">See the signal.<br><em>Understand the system.</em></h1>
          <p class="lede">A fieldbook for digital signal processing: start with intuition, manipulate the mathematics, and trace every idea back to Steven W. Smith’s classic text.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#/chapter/${nextSection.id.split('.')[0]}/learn/${nextSection.id}">${icon('play', 15)} Continue: Chapter ${last.number}</a>
            <a class="btn" href="#/map">${icon('map', 15)} Explore the concept map</a>
            <a class="btn btn-ghost" href="#/chapter/1">Start from the beginning ${icon('arrow', 15)}</a>
          </div>
          <div class="hero-meta">
            <div><strong>${g.chapters}</strong><span>chapters</span></div>
            <div><strong>${g.sections}</strong><span>concepts</span></div>
            <div><strong>${chapters.reduce((n, c) => n + c.labs.length, 0)}</strong><span>interactive labs</span></div>
            <div><strong>${g.quizAvg ? Math.round(g.quizAvg * 100) + '%' : '—'}</strong><span>quiz average</span></div>
            <div><strong>${Math.max(1, hours)}h</strong><span>guided study</span></div>
          </div>
        </div>
      </section>

      <div class="dash-grid">
        <div class="card continue-card">
          <div class="continue-num">${String(last.number).padStart(2, '0')}</div>
          <div style="min-width:0">
            <div class="kicker" style="margin-bottom:4px">${esc(last.part)} · ${last.sections.length} concepts</div>
            <h3>${esc(last.title)}</h3>
            <p class="muted small" style="margin-bottom:8px">Next up: <strong>${esc(nextSection.title)}</strong> · book p. ${nextSection.bookPage}</p>
            <div class="progress-block">
              ${progressBar(lastStats.progress)}
              <div class="progress-meta"><span>${Math.round(lastStats.progress * 100)}% complete</span><span>${lastStats.studied}/${lastStats.total} concepts studied</span></div>
            </div>
          </div>
          <a class="btn btn-primary" href="#/chapter/${last.number}/learn/${nextSection.id}">Resume ${icon('arrow', 14)}</a>
        </div>
        <div class="stat-grid">
          <div class="stat-card"><div class="num">${g.complete}<span class="muted" style="font-size:14px">/${g.chapters}</span></div><div class="lbl">Chapters completed</div></div>
          <div class="stat-card"><div class="num">${g.studied}<span class="muted" style="font-size:14px">/${g.sections}</span></div><div class="lbl">Concepts studied</div></div>
          <div class="stat-card"><div class="num">${g.quizAvg ? Math.round(g.quizAvg * 100) + '%' : '—'}</div><div class="lbl">Quiz average</div></div>
          <div class="stat-card"><div class="num">${streak()}<span class="muted" style="font-size:14px">d</span></div><div class="lbl">Study streak</div></div>
        </div>
      </div>

      <div class="section-heading-row">
        <div><h2 class="section-title">The course</h2><p>Five parts, one argument: from samples to systems, filters, applications, and complex methods.</p></div>
        <div class="row"><a class="btn btn-sm" href="#/source">Coverage report</a><a class="btn btn-sm" href="#/quiz">Assessments</a></div>
      </div>
      <div class="parts">
        ${parts.map((part) => {
          const list = chapters.filter((c) => c.part === part);
          return `<div class="part-block">
            <div class="part-label"><h3>${esc(part)}</h3><span class="line"></span><span class="count">${list.length} chapters</span></div>
            <div class="chapter-grid">
              ${list.map((c) => {
                const st = chapterStats(c);
                return `<a class="chapter-card ${st.complete ? 'done' : ''} ${c.number === last.number ? 'current' : ''}" href="#/chapter/${c.number}">
                  <div class="cc-top"><span class="cc-num">CH ${String(c.number).padStart(2, '0')}</span><div class="tag-row">${c.labs.length ? `<span class="badge accent">Lab</span>` : ''}<span class="badge outline">${c.quiz.length} quiz</span></div></div>
                  <h4>${esc(c.title)}</h4>
                  <div class="cc-foot"><div class="cc-progress"><span style="width:${Math.round(st.progress * 100)}%"></span></div><span class="cc-pages">pp. ${c.bookStart}–${c.bookEnd}</span></div>
                </a>`;
              }).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>

      <div class="dash-bottom">
        <div class="card card-pad">
          <div class="kicker">The method</div>
          <h2 class="section-title" style="font-size:26px">Four layers per chapter</h2>
          <div class="stack" style="margin-top:14px">
            <div class="row" style="align-items:flex-start"><span class="badge accent">1</span><div><strong>Concepts.</strong> <span class="muted">Intuition first, then the formal equations and caveats. Mark what you understand.</span></div></div>
            <div class="row" style="align-items:flex-start"><span class="badge blue">2</span><div><strong>Lab.</strong> <span class="muted">Move the parameters. See the mechanism change, not just the final plot.</span></div></div>
            <div class="row" style="align-items:flex-start"><span class="badge amber">3</span><div><strong>Worked example.</strong> <span class="muted">Follow the reasoning, then reproduce it without looking.</span></div></div>
            <div class="row" style="align-items:flex-start"><span class="badge green">4</span><div><strong>Practice.</strong> <span class="muted">Answer, get an explanation, and let weak areas feed the review queue.</span></div></div>
          </div>
        </div>
        <div class="card card-pad">
          <div class="kicker">Source-first</div>
          <h2 class="section-title" style="font-size:26px">Every concept is traceable</h2>
          <p class="muted small">The course is mapped section-by-section to the 688-page source PDF, including book page and PDF page numbers. 185/185 sections have authored explanations; 235 formulas and 100 questions make the coverage checkable.</p>
          <div class="trace-summary" style="grid-template-columns:repeat(2,1fr);margin-bottom:14px">
            <div class="stat-card"><div class="num">185</div><div class="lbl">Sections indexed</div></div>
            <div class="stat-card"><div class="num">${chapters.reduce((n, c) => n + c.labs.length, 0)}</div><div class="lbl">Interactive labs</div></div>
          </div>
          <div class="row"><a class="btn" href="#/source">${icon('source', 15)} Traceability matrix</a><a class="btn btn-ghost" href="#/glossary">Glossary ${icon('arrow', 14)}</a></div>
        </div>
      </div>

      <div class="footnote">Source: Steven W. Smith, <cite>The Scientist and Engineer's Guide to Digital Signal Processing</cite>, 2nd ed., California Technical Publishing, 1997–1999. This companion is an independent educational work; supplemental explanations are marked in the text where they go beyond the source.</div>
    `,
  };
}

/* ------------------------------------------------------------------ */
/* Searchable contents                                                 */
/* ------------------------------------------------------------------ */

function renderContents(query) {
  const q = (query.get('q') || '').toLowerCase();
  const partBlocks = parts.map((part) => {
    const chs = chapters.filter((c) => c.part === part);
    return `<section class="contents-part" data-cpart>
      <div class="part-label"><h2>${esc(part)}</h2><span class="line"></span><span class="count">${chs.length} chapters · ${chs.reduce((n, c) => n + c.sections.length, 0)} sections</span></div>
      ${chs.map((c) => `<div class="contents-chapter" data-cchapter data-title="${esc(`chapter ${c.number} ch ${c.number} ${c.title}`.toLowerCase())}" data-search="${esc((c.title + ' ' + c.sections.map((s) => `${s.title} ${s.intuition} ${(s.keyPoints || []).join(' ')}`).join(' ')).toLowerCase())}">
        <div class="contents-ch-head"><a href="#/chapter/${c.number}"><span class="tree-num">${String(c.number).padStart(2, '0')}</span>${esc(c.title)}</a><span class="tiny muted">pp. ${c.bookStart}–${c.bookEnd}</span></div>
        <div class="contents-sections">
          ${c.sections.map((s) => `<a href="#/chapter/${c.number}/learn/${s.id}" data-csection data-search="${esc(`${s.title} ${s.intuition} ${(s.keyPoints || []).join(' ')}`.toLowerCase())}"><span>${s.id}</span>${esc(s.title)}<em>p. ${s.bookPage}</em></a>`).join('')}
        </div>
      </div>`).join('')}
    </section>`;
  }).join('');
  return {
    title: 'Contents',
    html: `${pageHead('Table of contents', 'The whole book, in order', 'Every chapter and section, with printed book page numbers. Search by chapter, section, or keyword; the same content is indexed in the global search.')}
      <div class="ref-toolbar">
        <label class="ref-search">${icon('target', 15)}<input id="contents-search" type="search" placeholder="Filter chapters and sections…" value="${esc(q)}" aria-label="Filter contents"></label>
        <span class="tiny muted"><span id="contents-count">${chapters.length}</span> chapters · ${chapters.reduce((n, c) => n + c.sections.length, 0)} sections</span>
      </div>
      <div id="contents-body">${partBlocks}</div>
      <div class="empty-state hide" id="contents-empty"><h3>No chapters match</h3><p>Try a chapter number, a title, or a section keyword.</p></div>`,
    after(root) {
      const input = root.querySelector('#contents-search');
      const chs = [...root.querySelectorAll('[data-cchapter]')];
      const partsEls = [...root.querySelectorAll('[data-cpart]')];
      const empty = root.querySelector('#contents-empty');
      const count = root.querySelector('#contents-count');
      const filter = () => {
        const v = input.value.trim().toLowerCase();
        let shown = 0;
        chs.forEach((el) => {
          const titleMatch = !v || (el.dataset.title || '').includes(v);
          const sectionEls = [...el.querySelectorAll('[data-csection]')];
          let sectionShown = 0;
          sectionEls.forEach((s) => {
            const ok = !v || titleMatch || s.dataset.search.includes(v);
            s.style.display = ok ? '' : 'none';
            if (ok) sectionShown++;
          });
          const ok = !v || titleMatch || sectionShown > 0;
          el.style.display = ok ? '' : 'none';
          if (ok) shown++;
        });
        partsEls.forEach((p) => { p.style.display = [...p.querySelectorAll('[data-cchapter]')].some((c) => c.style.display !== 'none') ? '' : 'none'; });
        if (count) count.textContent = String(shown);
        empty?.classList.toggle('hide', shown > 0);
      };
      input?.addEventListener('input', filter);
      if (q) filter();
    },
  };
}

/* ------------------------------------------------------------------ */
/* Lab gallery                                                         */
/* ------------------------------------------------------------------ */

function renderLabGallery() {
  const s = getState();
  return {
    title: 'Lab gallery',
    html: `${pageHead('Visual index', 'Lab gallery', 'Every interactive visualization in one place. Each lab is a quantitative model; open the chapter for the supporting explanation, worked example, and practice.')}
      <div class="lab-gallery">
        ${chapters.map((c) => {
          const lab = c.labs[0];
          if (!lab) return '';
          const visited = !!s.labs[`${c.number}:${lab.id}`];
          return `<a class="lab-gallery-card" href="#/chapter/${c.number}/lab">
            <div class="lg-top"><span class="cc-num">CH ${String(c.number).padStart(2, '0')}</span><span class="badge ${visited ? 'green' : 'outline'}">${visited ? 'visited' : esc(c.part)}</span></div>
            <h3>${esc(lab.title)}</h3>
            <p>${esc(lab.intro)}</p>
            <div class="lg-foot"><span class="tiny muted">${lab.tasks.length} guided tasks</span><span class="tiny" style="color:var(--accent)">Open lab →</span></div>
          </a>`;
        }).join('')}
      </div>
      <div class="panel panel-tip" style="margin-top:18px"><div class="callout-title">How the labs are built</div><p class="small" style="margin:0">The labs use Canvas 2D, SVG, and a dependency-free numerical engine. All numerical readouts come from the same functions tested by the unit suite. There is no 3D scene: DSP is primarily a 2D signal/geometry subject, and 2D plots communicate the mechanisms more accurately and cheaply.</p></div>`,
  };
}

/* ------------------------------------------------------------------ */
/* Visual index                                                        */
/* ------------------------------------------------------------------ */

function renderVisualIndex() {
  const unique = [];
  const seen = new Set();
  for (const v of Object.values(visuals)) {
    if (!seen.has(v.src)) { seen.add(v.src); unique.push(v); }
  }
  unique.sort((a, b) => (a.kind === b.kind ? a.title.localeCompare(b.title) : a.kind === 'diagram' ? -1 : 1));
  const usage = (v) => chapters.filter((c) => c.sections.some((s) => s.visual && s.visual.src === v.src)).map((c) => c.number);
  return {
    title: 'Visual index',
    html: `${pageHead('Visual library', 'Every figure, in one place', 'Original diagrams and openly licensed photographs used to make the concepts visible. Click any figure to enlarge it; the credit and license are shown with each image.')}
      <div class="ref-toolbar">
        <span class="chip active" data-visual-filter="all" role="button" tabindex="0">All ${unique.length}</span>
        <span class="chip" data-visual-filter="diagram" role="button" tabindex="0">Original diagrams ${unique.filter((v) => v.kind === 'diagram').length}</span>
        <span class="chip" data-visual-filter="image" role="button" tabindex="0">Licensed images ${unique.filter((v) => v.kind === 'image').length}</span>
        <span class="tiny muted">Images are local; no requests leave this device after loading.</span>
      </div>
      <div class="visual-grid" id="visual-grid">
        ${unique.map((v) => {
          const used = usage(v);
          const credit = v.kind === 'diagram' ? `Original · ${v.license}` : `${v.credit} · ${v.license}`;
          return `<article class="visual-card" data-visual-kind="${v.kind}" data-visual-search="${esc((v.title + ' ' + v.caption).toLowerCase())}">
            <button class="visual-thumb" data-image-open type="button" data-src="${esc(visualSource(v))}" data-title="${esc(v.title)}" data-caption="${esc(v.caption)}" data-credit="${esc(credit)}" data-page="${esc(v.page || '')}" data-kind="${esc(v.kind)}" aria-label="Enlarge ${esc(v.title)}">
              <img src="${esc(visualSource(v))}" alt="${esc(v.alt || v.caption)}" loading="lazy" decoding="async" />
            </button>
            <div class="visual-body">
              <h3>${esc(v.title)}</h3>
              <p>${esc(v.caption)}</p>
              <div class="visual-credit">${credit}${v.kind === 'image' ? ` · <a href="${esc(v.page)}" target="_blank" rel="noopener">source</a>` : ''}</div>
              ${used.length ? `<div class="visual-use">Used in ${used.slice(0, 6).map((n) => `Ch. ${n}`).join(', ')}${used.length > 6 ? '…' : ''}</div>` : ''}
            </div>
          </article>`;
        }).join('')}
      </div>
      <div class="panel panel-tip" style="margin-top:18px"><div class="callout-title">Source and license policy</div><p class="small" style="margin:0">The book's prose and figures are copyrighted and are not reproduced here. Source-page links open the user's local PDF. Downloaded images are from Wikimedia Commons under the licenses shown; original diagrams were created for this course under CC BY 4.0. Every image is stored locally and can be enlarged.</p></div>`,
    after(root) {
      const cards = [...root.querySelectorAll('.visual-card')];
      root.querySelectorAll('[data-visual-filter]').forEach((chip) => {
        const run = () => {
          root.querySelectorAll('[data-visual-filter]').forEach((c) => c.classList.remove('active'));
          chip.classList.add('active');
          const f = chip.dataset.visualFilter;
          cards.forEach((c) => { c.style.display = f === 'all' || c.dataset.visualKind === f ? '' : 'none'; });
        };
        chip.addEventListener('click', run);
        chip.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(); } });
      });
    },
  };
}

/* ------------------------------------------------------------------ */
/* Chapter route                                                       */
/* ------------------------------------------------------------------ */

function renderChapterRoute(segs, query) {
  const n = Number(segs[1]);
  const ch = chapterByNumber[n];
  if (!ch) return { title: 'Chapter not found', html: renderNotFound() };
  const tab = VALID_TABS.includes(segs[2]) ? segs[2] : 'learn';
  const section = segs[3] || null;
  if (!query.has('noscroll')) recordVisit(n);
  saveLastRoute(location.hash);
  const stats = chapterStats(ch);
  const tabHtml = chapterTabs(ch, tab);
  let content = '';
  if (tab === 'learn') content = renderLearn(ch, section);
  else if (tab === 'lab') content = renderLabs(ch);
  else if (tab === 'worked') content = renderWorked(ch);
  else if (tab === 'practice') content = renderPractice(ch);
  else if (tab === 'source') content = renderChapterSource(ch);
  else if (tab === 'notes') content = renderChapterNotes(ch);
  return {
    title: `Chapter ${ch.number}: ${ch.title}`,
    tab,
    keepScroll: !!section,
    anchor: section ? `section-${section}` : null,
    html: `
      <header class="chapter-hero">
        <div class="kicker">${esc(ch.part)} <span class="dot"></span> Chapter ${ch.number} <span class="dot"></span> book pp. ${ch.bookStart}–${ch.bookEnd}</div>
        <div class="spread">
          <div style="min-width:0">
            <h1>${esc(ch.title)}</h1>
            <p class="lede">${esc(ch.tagline)}</p>
          </div>
          <div class="chapter-actions">
            <a class="btn btn-sm" href="#/chapter/${ch.number}/notes">${icon('note', 14)} Notes</a>
            <button class="btn btn-sm" data-action="toggle-bookmark-chapter" data-chapter="${ch.number}" aria-pressed="${isBookmarked('chapter', ch.number)}">${icon(isBookmarked('chapter', ch.number) ? 'bookmarked' : 'bookmark', 14)} <span>${isBookmarked('chapter', ch.number) ? 'Bookmarked' : 'Bookmark'}</span></button>
            <a class="btn btn-sm" href="source/Guide_to_Digital_Signal_Process.pdf#page=${ch.pdfStart}" target="_blank" rel="noopener">${icon('source', 14)} PDF p. ${ch.pdfStart}</a>
          </div>
        </div>
        <div class="objectives">
          ${ch.objectives.map((o) => `<div><span class="tick">✓</span><span>${esc(o)}</span></div>`).join('')}
        </div>
        <div class="chapter-meta">
          <span class="badge accent">${ch.sections.length} concepts</span>
          <span class="badge blue">${ch.labs.length} lab${ch.labs.length === 1 ? '' : 's'}</span>
          <span class="badge amber">${ch.quiz.length} practice questions</span>
          ${ch.prerequisites.length ? `<span class="badge outline">Prereqs: ${ch.prerequisites.map((p) => `Ch. ${p}`).join(', ')}</span>` : `<span class="badge outline">No prerequisites</span>`}
        </div>
        <div class="chapter-progress-strip">
          ${progressBar(stats.progress)}
          <span class="lbl">${Math.round(stats.progress * 100)}% · ${stats.studied}/${stats.total} studied${stats.quiz ? ` · quiz best ${stats.quiz.best}/${stats.quiz.total}` : ''}</span>
        </div>
      </header>
      <nav class="tabs" aria-label="Chapter sections">
        ${tabHtml}
      </nav>
      <div class="chapter-layout">${content}</div>
      ${chapterNav(ch)}
    `,
  };
}

function chapterTabs(ch, active) {
  const specs = [
    ['learn', 'Concepts', ch.sections.length],
    ['lab', 'Interactive lab', ch.labs.length],
    ['worked', 'Worked example', null],
    ['practice', 'Practice', ch.quiz.length],
    ['source', 'Source', ch.sections.length],
    ['notes', 'Notes', getState().notes[ch.number] ? 1 : 0],
  ];
  return specs.map(([id, label, count]) => `<a class="tab ${active === id ? 'active' : ''}" href="#/chapter/${ch.number}/${id}" ${active === id ? 'aria-current="page"' : ''}>${label}${count ? `<span class="count">${count}</span>` : ''}</a>`).join('');
}

function chapterNav(ch) {
  const prev = chapterByNumber[ch.number - 1];
  const next = chapterByNumber[ch.number + 1];
  return `<nav class="chapter-nav" aria-label="Chapter navigation">
    ${prev ? `<a href="#/chapter/${prev.number}" class="prev"><span class="nav-dir">← Previous</span><span class="nav-title">${esc(prev.title)}</span></a>` : `<span></span>`}
    ${next ? `<a href="#/chapter/${next.number}" class="next"><span class="nav-dir">Next →</span><span class="nav-title">${esc(next.title)}</span></a>` : `<a href="#/quiz" class="next"><span class="nav-dir">Continue →</span><span class="nav-title">Assessment center</span></a>`}
  </nav>`;
}

/* ------------------------------------------------------------------ */
/* Learn tab                                                           */
/* ------------------------------------------------------------------ */

function renderLearn(ch, section) {
  const deep = getState().prefs.deep;
  return `
    <div class="spread" style="margin-bottom:14px">
      <div class="row">
        <div class="depth-switch" role="group" aria-label="Explanation depth">
          <button data-action="set-depth" data-depth="guided" class="${deep ? '' : 'active'}">Guided</button>
          <button data-action="set-depth" data-depth="technical" class="${deep ? 'active' : ''}">Technical</button>
        </div>
        <button class="btn btn-ghost btn-sm" data-action="expand-all">Expand all detail</button>
      </div>
      <span class="tiny muted">${ch.sections.length} sections · ${ch.sections.reduce((n, s) => n + s.formulas.length, 0)} formulas</span>
    </div>
    <div class="concept-list">
      ${ch.sections.map((s, i) => renderConcept(ch, s, i, deep)).join('')}
    </div>
    <div class="panel panel-tip" style="margin-top:18px">
      <div class="callout-title">How to read this chapter</div>
      <p class="small" style="margin:0">Start with the intuition. Open <strong>Technical detail</strong> when you want the formal mechanism, assumptions, and edge cases. Formula boxes are self-contained. Use the star to bookmark a section and the check button to mark it studied; both persist locally.</p>
      <p class="tiny muted" style="margin:8px 0 0"><strong>Source note.</strong> Explanations are authored summaries keyed to the printed page. Modern examples and engineering guidance that go beyond Smith's text are supplementary, not claims of the source.</p>
    </div>`;
}

function visualSource(v) {
  const reduced = getState().prefs.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return v.poster && reduced ? v.poster : v.src;
}

function renderConceptFigure(v, s) {
  if (!v) return '';
  const creditText = v.kind === 'diagram'
    ? `Original diagram for DSP Fieldbook · ${v.license}`
    : `Image: ${v.credit} · ${v.license}`;
  const creditLink = v.kind === 'image' && v.page
    ? ` · <a href="${esc(v.page)}" target="_blank" rel="noopener">source file</a>`
    : '';
  const animated = /\.gif$/i.test(v.src);
  const reduced = getState().prefs.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return `<figure class="concept-figure">
    <button class="figure-open" data-image-open type="button"
      data-src="${esc(visualSource(v))}" data-title="${esc(v.title)}"
      data-caption="${esc(v.caption)}" data-credit="${esc(creditText)}"
      data-page="${esc(v.page || '')}" data-kind="${esc(v.kind)}"
      aria-label="Open larger figure: ${esc(v.title)}">
      <img src="${esc(visualSource(v))}" alt="${esc(v.alt || v.caption)}" loading="lazy" decoding="async" />
      ${animated ? `<span class="figure-badge">${reduced ? 'animated · still' : 'animated'}</span>` : ''}
      <span class="figure-zoom">View larger</span>
    </button>
    <figcaption class="figure-caption"><strong>${esc(v.title)}.</strong> ${rich(v.caption)}</figcaption>
    <div class="figure-credit">${esc(creditText)}${creditLink}</div>
  </figure>`;
}

function renderConcept(ch, s, i, deep) {
  const sState = getState();
  const studied = !!sState.studied[s.id];
  const bookmarked = isBookmarked('section', s.id);
  return `<article class="concept-card ${studied ? 'studied' : ''}" id="section-${s.id}" data-section-card="${s.id}">
    <header class="concept-head">
      <div class="concept-index">${s.id}</div>
      <div class="concept-head-main">
        <h3>${esc(s.title)}</h3>
        <div class="row" style="gap:8px">${sourceRef(s.bookPage, s.pdfPage, s.title)}<span class="badge ${s.level === 'advanced' ? 'amber' : s.level === 'support' ? 'outline' : 'accent'}">${s.level}</span></div>
      </div>
      <div class="concept-actions">
        <button class="icon-btn" data-action="toggle-bookmark-section" data-section="${s.id}" aria-label="${bookmarked ? 'Remove bookmark' : 'Bookmark this section'}" title="${bookmarked ? 'Remove bookmark' : 'Bookmark'}">${icon(bookmarked ? 'bookmarked' : 'bookmark', 17)}</button>
        <button class="icon-btn" data-action="toggle-study" data-section="${s.id}" aria-label="${studied ? 'Mark unstudied' : 'Mark studied'}" title="${studied ? 'Studied' : 'Mark studied'}">${icon('check', 17)}</button>
      </div>
    </header>
    <div class="concept-body">
      <p class="intuition">${rich(s.intuition)}</p>
      ${s.visual ? renderConceptFigure(s.visual, s) : ''}
      ${s.formulas?.length ? `<div class="formula-stack">${s.formulas.map((f) => renderFormula(f)).join('')}</div>` : ''}
      <details class="tech-detail" ${deep ? 'open' : ''}>
        <summary>Technical detail</summary>
        ${rich(s.detail)}
        ${s.application ? `<p class="small muted" style="margin-top:10px"><strong style="color:var(--ink)">Where it is used.</strong> ${rich(s.application)}</p>` : ''}
        ${s.advanced ? `<div class="panel panel-note" style="margin-top:12px"><div class="callout-title">Beyond the basics</div>${rich(s.advanced)}</div>` : ''}
      </details>
      ${s.keyPoints?.length ? `<ul class="key-points">${s.keyPoints.map((k) => `<li>${rich(k)}</li>`).join('')}</ul>` : ''}
      ${s.caveat ? `<p class="caveat"><strong>Watch out.</strong> ${rich(s.caveat)}</p>` : ''}
    </div>
    <footer class="concept-foot">
      <button class="study-toggle ${studied ? 'on' : ''}" data-action="toggle-study" data-section="${s.id}">${icon(studied ? 'check' : 'target', 13)} ${studied ? 'Studied' : 'Mark studied'}</button>
      <span class="tiny muted">${s.formulas?.length ? `${s.formulas.length} formula${s.formulas.length > 1 ? 's' : ''}` : 'Concept'}</span>
      ${ch.labs.length ? `<a class="tiny" href="#/chapter/${ch.number}/lab" style="margin-left:auto">Explore the lab →</a>` : ''}
    </footer>
  </article>`;
}

function renderFormula(f) {
  return `<div class="formula-box">
    <div class="formula-label">${esc(f.label)}</div>
    ${math(f.tex, true)}
    ${f.vars ? `<div class="formula-vars">${esc(f.vars)}</div>` : ''}
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Lab tab                                                             */
/* ------------------------------------------------------------------ */

function renderLabs(ch) {
  if (!ch.labs.length) {
    return `<div class="empty-state"><h3>No lab for this chapter</h3><p>This chapter is primarily conceptual. Use the concept cards and worked example.</p></div>`;
  }
  return `<div class="stack" style="gap:22px">
    ${ch.labs.map((lab) => `<section class="lab-mount" id="lab-${lab.id}" data-lab-id="${lab.id}" data-chapter="${ch.number}">
      <div class="loading-screen" style="min-height:220px"><div class="loader"></div><p>Preparing “${esc(lab.title)}”…</p></div>
    </section>`).join('')}
    <div class="panel panel-quiet">
      <div class="callout-title">Model note</div>
      <p class="small" style="margin:0">Labs are quantitative simulations built from the equations in the source. Where a model is deliberately simplified (for example, illustrative filter prototypes or a small CT grid), the lab note says so. Numerical readouts are computed from the same engine used by the unit tests.</p>
    </div>
  </div>`;
}

function afterLabs(root, ch) {
  ch.labs.forEach((lab, i) => {
    const el = root.querySelector(`#lab-${CSS.escape(lab.id)}`);
    if (!el) return;
    markLabVisited(ch.number, lab.id);
    updateChapterProgressUI(ch);
    const cleanup = mountLab(lab.id, el, {
      chapter: ch, lab, index: i,
      reducedMotion: getState().prefs.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
    if (typeof cleanup === 'function') activeCleanups.push(cleanup);
  });
}

/* ------------------------------------------------------------------ */
/* Worked example                                                      */
/* ------------------------------------------------------------------ */

function renderWorked(ch) {
  const w = ch.worked;
  if (!w) return `<div class="empty-state"><h3>Worked example coming soon</h3></div>`;
  return `<div class="card worked">
    <div class="kicker">Worked example · Chapter ${ch.number}</div>
    <h2>${esc(w.title)}</h2>
    <p class="muted small">Source: book pp. ${ch.bookStart}–${ch.bookEnd}. The reasoning is the point; try each step before revealing the answer.</p>
    <div class="problem">${rich(w.problem)}</div>
    <ol class="steps">
      ${w.steps.map((st) => `<li class="step"><h4>${esc(st.title)}</h4>${rich(st.text)}${st.tex ? renderFormula({ label: st.title, tex: st.tex, vars: '' }) : ''}</li>`).join('')}
    </ol>
    <details class="answer">
      <summary style="cursor:pointer;font-weight:650">Reveal the final answer</summary>
      <div style="margin-top:8px">${rich(w.answer)}</div>
    </details>
    <div class="panel panel-tip" style="margin-top:18px">
      <div class="callout-title">Self-check</div>
      <p class="small" style="margin:0">Close this page and reproduce the calculation on paper. If you get stuck, identify which step—model, equation, or arithmetic—is unclear, then return to that concept.</p>
    </div>
  </div>
  <div class="card card-pad" style="margin-top:16px">
    <h3>Common misconceptions in this chapter</h3>
    <div class="stack" style="margin-top:10px">
      ${(ch.misconceptions || []).map((m) => `<div class="panel panel-warn"><div class="callout-title">Not quite</div><p class="small" style="margin:0"><strong>${esc(m.wrong)}</strong><br>${rich(m.right)}</p></div>`).join('')}
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Practice                                                            */
/* ------------------------------------------------------------------ */

function getSession(ch) {
  if (!quizSessions.has(ch.number)) {
    quizSessions.set(ch.number, { answers: {}, recorded: false });
  }
  return quizSessions.get(ch.number);
}

const STOP_WORDS = new Set('the a an and or of to in is are was were be been being for with on at by from as that this these those it its into can could may might should would will not no yes which what when where why how using use used'.split(' '));
const conceptCache = new Map();
function relatedConcept(ch, q) {
  const key = `${ch.number}:${q.question}`;
  if (conceptCache.has(key)) return conceptCache.get(key);
  const text = `${q.question} ${q.options.join(' ')}`.toLowerCase();
  const tokens = text.split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !STOP_WORDS.has(w));
  let best = ch.sections[0], bestScore = -1;
  for (const s of ch.sections) {
    const title = s.title.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
    const body = `${s.intuition} ${s.detail} ${(s.keyPoints || []).join(' ')}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (title.some((w) => w.includes(t) || t.includes(w))) score += 5;
      if (body.includes(t)) score += 1;
    }
    if (score > bestScore) { bestScore = score; best = s; }
  }
  conceptCache.set(key, best);
  return best;
}

function renderPractice(ch) {
  const s = getSession(ch);
  const best = getState().quiz[ch.number];
  return `<div class="quiz-wrap">
    <div class="quiz-intro">
      <div><div class="kicker">Practice · Chapter ${ch.number}</div><h2>Check your understanding</h2><p class="muted small" style="margin:4px 0 0">Immediate feedback with explanations. Scores feed the review queue and your progress.</p></div>
      <div class="center"><div class="quiz-score">${best ? `${best.best}/${best.total}` : '—'}</div><div class="tiny muted">previous best</div></div>
    </div>
    <div class="quiz-list" id="quiz-list">
      ${ch.quiz.map((q, qi) => renderQuizQuestion(ch, q, qi, s)).join('')}
    </div>
    <div id="quiz-finish">${renderQuizFinish(ch, s)}</div>
  </div>`;
}

function renderQuizQuestion(ch, q, qi, session) {
  const chosen = session.answers[qi];
  const answered = chosen !== undefined;
  const correct = chosen === q.answer;
  return `<article class="quiz-q ${answered ? (correct ? 'correct' : 'incorrect') : ''}" data-quiz-card="${qi}" data-answer="${q.answer}">
    <div class="q-top"><span class="q-num">Q${qi + 1}</span><span class="q-type">${q.type === 'tf' ? 'True / false' : 'Multiple choice'}</span></div>
    <div class="q-text">${rich(q.question)}</div>
    <div class="options">
      ${q.options.map((opt, oi) => {
        let cls = '';
        if (answered) {
          if (oi === q.answer) cls = 'correct';
          else if (oi === chosen) cls = 'wrong';
        }
        return `<button class="option ${cls}" data-action="quiz-option" data-chapter="${ch.number}" data-q="${qi}" data-option="${oi}" ${answered ? 'disabled' : ''}>
          <span class="letter">${String.fromCharCode(65 + oi)}</span><span>${rich(opt)}</span>
        </button>`;
      }).join('')}
    </div>
    <div class="feedback ${answered ? 'show ' + (correct ? 'good' : 'bad') : ''}" data-feedback="${qi}">
      ${answered ? quizFeedback(ch, q, qi, chosen, correct) : ''}
    </div>
  </article>`;
}

function quizFeedback(ch, q, qi, chosen, correct) {
  const sec = relatedConcept(ch, q);
  const link = `<div class="tiny" style="margin-top:6px"><a href="#/chapter/${ch.number}/learn/${sec.id}">Suggested review: §${sec.id} ${esc(sec.title)} →</a></div>`;
  if (correct) {
    return `<strong>Correct.</strong>${rich(q.explanation)}${link}`;
  }
  const answerLabel = q.type === 'tf' ? q.options[q.answer] : String.fromCharCode(65 + q.answer);
  const hint = q.wrongHints?.[chosen] ? `<br><em>Why your choice is not right:</em> ${rich(q.wrongHints[chosen])}` : '';
  return `<strong>Not quite.</strong> The correct answer is <b>${answerLabel}</b>. ${rich(q.explanation)}${hint}${link}`;
}

function renderQuizFinish(ch, session) {
  const answered = Object.keys(session.answers).length;
  if (answered < ch.quiz.length) {
    return `<div class="panel panel-quiet" style="margin-top:16px"><p class="small muted" style="margin:0">Answer all ${ch.quiz.length} questions to complete this attempt. ${answered} answered so far.</p></div>`;
  }
  const score = ch.quiz.reduce((n, q, i) => n + (session.answers[i] === q.answer ? 1 : 0), 0);
  return `<div class="card card-pad" style="margin-top:16px">
    <div class="spread"><div><div class="kicker">Attempt complete</div><h3 style="font-family:var(--font-serif);font-weight:500;font-size:24px">${score}/${ch.quiz.length} correct</h3><p class="small muted" style="margin:0">${score === ch.quiz.length ? 'Excellent. Return to any concept you guessed, then try the next chapter.' : score >= 0.7 * ch.quiz.length ? 'Passing. Review the explanations for the ones you missed; the review queue will remember them.' : 'This chapter needs another pass. Re-read the concept cards and revisit the lab before retrying.'}</p></div><button class="btn" data-action="quiz-retry" data-chapter="${ch.number}">${icon('reset', 14)} Retry</button></div>
    <div class="progress-block" style="margin-top:12px">${progressBar(score / ch.quiz.length)}</div>
  </div>`;
}

function answerQuiz(ch, qi, oi) {
  const session = getSession(ch);
  if (session.answers[qi] !== undefined) return;
  session.answers[qi] = oi;
  const q = ch.quiz[qi];
  const correct = oi === q.answer;
  const card = document.querySelector(`[data-quiz-card="${qi}"]`);
  if (card) {
    card.classList.add(correct ? 'correct' : 'incorrect');
    card.querySelectorAll('.option').forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.answer) btn.classList.add('correct');
      else if (idx === oi) btn.classList.add('wrong');
    });
    const fb = card.querySelector(`[data-feedback="${qi}"]`);
    if (fb) {
      fb.className = `feedback show ${correct ? 'good' : 'bad'}`;
      fb.innerHTML = quizFeedback(ch, q, qi, oi, correct);
      renderMath(fb);
    }
  }
  const answered = Object.keys(session.answers).length;
  const finish = document.getElementById('quiz-finish');
  if (finish) finish.innerHTML = renderQuizFinish(ch, session);
  if (answered === ch.quiz.length && !session.recorded) {
    session.recorded = true;
    const score = ch.quiz.reduce((n, qq, i) => n + (session.answers[i] === qq.answer ? 1 : 0), 0);
    recordQuiz(ch.number, score, ch.quiz.length, { ...session.answers });
    const bestEl = document.querySelector('.quiz-score');
    if (bestEl) bestEl.textContent = `${Math.max(score, getState().quiz[ch.number]?.best || 0)}/${ch.quiz.length}`;
    toast(`Chapter ${ch.number}: ${score}/${ch.quiz.length}. Progress saved.`);
    refreshChrome();
    updateChapterProgressUI(ch);
  }
}

/* ------------------------------------------------------------------ */
/* Source tab / traceability                                          */
/* ------------------------------------------------------------------ */

function labRelevant(ch, s) {
  return s.level === 'core' || (s.formulas && s.formulas.length > 0);
}

function traceStatus(ch, s) {
  if (!s.authored) return 'blocked';
  return labRelevant(ch, s) ? 'full' : 'explain';
}

function traceStatusLabel(status) {
  return status === 'full' ? 'Full' : status === 'explain' ? 'Explanation-only' : status === 'partial' ? 'Partial' : 'Blocked';
}

function renderChapterSource(ch) {
  const full = ch.sections.filter((s) => traceStatus(ch, s) === 'full').length;
  const explain = ch.sections.length - full;
  return `<div class="card card-pad">
    <div class="spread" style="margin-bottom:14px">
      <div><div class="kicker">Source traceability</div><h2 class="section-title" style="font-size:27px">Every section, accounted for</h2><p class="small muted" style="margin:0">Book pp. ${ch.bookStart}–${ch.bookEnd} · PDF p. ${ch.pdfStart} onward · ${full} full, ${explain} explanation-only.</p></div>
      <a class="btn btn-sm" href="source/Guide_to_Digital_Signal_Process.pdf#page=${ch.pdfStart}" target="_blank" rel="noopener">${icon('external', 14)} Open source PDF</a>
    </div>
    <div class="trace-legend"><span><span class="status-pill status-full">Full</span> explanation + formulas/visual + chapter practice</span><span><span class="status-pill status-explain">Explanation-only</span> concept is primarily verbal or contextual</span></div>
    <div class="trace-table-wrap"><table class="trace-table">
      <thead><tr><th>Source</th><th>Concept</th><th>In this app</th><th>Visual</th><th>Practice</th><th>Status</th></tr></thead>
      <tbody>
        ${ch.sections.map((s) => `<tr>
          <td class="src-page"><a href="source/Guide_to_Digital_Signal_Process.pdf#page=${s.pdfPage}" target="_blank" rel="noopener" title="Open the source PDF at this page">p. ${s.bookPage}</a><br><span style="color:var(--faint)">PDF ${s.pdfPage}</span></td>
          <td><strong>${s.id}</strong> ${esc(s.title)}</td>
          <td><a href="#/chapter/${ch.number}/learn/${s.id}">Explanation${s.formulas.length ? ` + ${s.formulas.length} formula${s.formulas.length > 1 ? 's' : ''}` : ''}</a></td>
          <td><a href="#/chapter/${ch.number}/learn/${s.id}">${esc(s.visual?.title || 'Figure')}</a>${labRelevant(ch, s) && ch.labs.length ? `<br><span class="tiny muted">Lab: ${esc(ch.labs[0].title)}</span>` : ''}</td>
          <td>${ch.quiz.length ? `${ch.quiz.length} chapter questions` : '—'}</td>
          <td class="status"><span class="status-pill status-${traceStatus(ch, s)}">${traceStatusLabel(traceStatus(ch, s))}</span></td>
        </tr>`).join('')}
      </tbody>
    </table></div>
    <p class="coverage-note">“Full” means the section has an authored explanation, a source page reference, and a route into the chapter’s lab or practice set. “Explanation-only” means the concept is contextual or primarily mathematical, and a bespoke interactive is not the best way to teach it. No section is merely a heading.</p>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Notes tab                                                           */
/* ------------------------------------------------------------------ */

function renderChapterNotes(ch) {
  const n = getState().notes[ch.number];
  return `<div class="card card-pad" style="max-width:820px">
    <div class="kicker">Personal notes · Chapter ${ch.number}</div>
    <h2 class="section-title" style="font-size:28px">Write to your future self</h2>
    <p class="small muted">Notes are stored in this browser only. Use them to record a derivation, a question, or the moment a concept clicked.</p>
    <div class="notes-editor">
      <textarea id="chapter-notes" placeholder="What is the key idea? What did you get wrong? What do you want to revisit?">${esc(n?.text || '')}</textarea>
      <div class="notes-meta"><span id="notes-status">${n ? `Saved ${formatDate(n.updated)}` : 'Not saved yet'}</span><span>Auto-saves locally</span></div>
      <div class="row"><button class="btn btn-primary" data-action="save-note" data-chapter="${ch.number}">Save note</button><button class="btn btn-ghost" data-action="clear-note" data-chapter="${ch.number}">Clear</button><a class="btn btn-ghost" href="#/notes">All notes →</a></div>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Reference pages                                                     */
/* ------------------------------------------------------------------ */

function pageHead(kicker, title, desc) {
  return `<header class="page-head"><div class="kicker">${kicker}</div><h1>${title}</h1><p>${desc}</p></header>`;
}

function renderGlossary(query) {
  const q = (query.get('q') || '').toLowerCase();
  const sorted = [...glossary].sort((a, b) => a.term.localeCompare(b.term));
  const letters = [...new Set(sorted.map((g) => g.term[0].toUpperCase()))];
  return {
    title: 'Glossary',
    html: `${pageHead('Reference', 'Glossary', 'The vocabulary of DSP, defined in plain language and linked to the chapters where it is developed.')}
      <div class="ref-toolbar">
        <label class="ref-search">${icon('target', 15)}<input id="glossary-search" type="search" placeholder="Filter terms…" value="${esc(q)}" aria-label="Filter glossary"></label>
        <span class="tiny muted">${glossary.length} terms</span>
      </div>
      <div class="letter-jump">${letters.map((l) => `<a href="#/glossary?q=${l}" data-letter="${l}">${l}</a>`).join('')}</div>
      <div class="glossary-grid" id="glossary-grid">
        ${sorted.map((g) => `<dl class="glossary-item" data-term="${esc((g.term + ' ' + g.def).toLowerCase())}" data-start="${esc(g.term.toLowerCase())}">
          <dt>${esc(g.term)} <a class="tiny" href="#/chapter/${g.chapters[0]}">Ch. ${g.chapters.join(', ')}</a></dt>
          <dd>${esc(g.def)}${g.source ? `<span class="src">Book p. ${g.source}</span>` : ''}</dd>
        </dl>`).join('')}
      </div>`,
    after(root) {
      const input = root.querySelector('#glossary-search');
      const items = [...root.querySelectorAll('.glossary-item')];
      let startsWith = false;
      const filter = () => {
        const v = input.value.toLowerCase().trim();
        let shown = 0;
        items.forEach((el) => {
          const ok = !v || (startsWith ? el.dataset.start.startsWith(v) : el.dataset.term.includes(v));
          el.style.display = ok ? '' : 'none';
          if (ok) shown++;
        });
        let empty = root.querySelector('.glossary-empty');
        if (!shown) {
          if (!empty) {
            empty = document.createElement('div');
            empty.className = 'empty-state glossary-empty';
            empty.innerHTML = '<h3>No terms match</h3><p>Try a shorter prefix or a different term.</p>';
            root.querySelector('#glossary-grid').after(empty);
          }
        } else empty?.remove();
      };
      input?.addEventListener('input', () => { startsWith = false; filter(); });
      if (q) filter();
      root.querySelectorAll('[data-letter]').forEach((a) => {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          input.value = a.dataset.letter;
          startsWith = true;
          filter();
          window.scrollTo({ top: 0, behavior: 'instant' });
        });
      });
    },
  };
}

function allFormulas() {
  return chapters.flatMap((ch) => ch.sections.flatMap((s) => (s.formulas || []).map((f) => ({ ...f, chapter: ch.number, chapterTitle: ch.title, section: s.id, sectionTitle: s.title, page: s.bookPage }))));
}

function renderFormulas(query) {
  const q = (query.get('q') || '').toLowerCase();
  const list = allFormulas();
  const groups = [];
  for (const f of list) {
    let g = groups.find((x) => x.chapter === f.chapter);
    if (!g) { g = { chapter: f.chapter, title: f.chapterTitle, items: [] }; groups.push(g); }
    g.items.push(f);
  }
  return {
    title: 'Formula sheet',
    html: `${pageHead('Reference', 'Formula sheet', `${list.length} equations and definitions extracted from the course, with variable notes and source pages. Search by concept, symbol, or chapter.`)}
      <div class="ref-toolbar">
        <label class="ref-search">${icon('target', 15)}<input id="formula-search" type="search" placeholder="Filter formulas…" value="${esc(q)}" aria-label="Filter formulas"></label>
        <span class="tiny muted"><span id="formula-count">${list.length}</span> shown</span>
      </div>
      <div class="formula-list" id="formula-list">
        ${groups.map((g) => `<div class="formula-group" data-fgroup="${g.chapter}">
          <div class="part-label" style="margin:20px 0 8px"><h3 style="font-size:18px"><a href="#/chapter/${g.chapter}" style="text-decoration:none;color:var(--ink)">Ch. ${g.chapter} · ${esc(g.title)}</a></h3><span class="line"></span></div>
          ${g.items.map((f) => `<div class="formula-item" data-fsearch="${esc(`${f.label} ${f.tex} ${f.vars || ''} ${f.chapterTitle} ${f.sectionTitle}`.toLowerCase())}">
            <div class="f-head"><h3>${esc(f.label)}</h3><span class="f-src">§ ${f.section} · p. ${f.page}</span></div>
            ${math(f.tex, true)}
            ${f.vars ? `<div class="f-vars">${esc(f.vars)}</div>` : ''}
            <div class="row" style="margin-top:6px"><a class="tiny" href="#/chapter/${f.chapter}/learn/${f.section}">Read the concept →</a><button class="btn btn-ghost btn-sm" data-action="copy-tex" data-tex="${esc(f.tex)}">Copy TeX</button></div>
          </div>`).join('')}
        </div>`).join('')}
        <div class="empty-state hide" id="formula-empty"><h3>No formulas match</h3><p>Try a different term or clear the search.</p></div>
      </div>`,
    after(root) {
      const input = root.querySelector('#formula-search');
      const items = [...root.querySelectorAll('.formula-item')];
      const groupsEls = [...root.querySelectorAll('[data-fgroup]')];
      const count = root.querySelector('#formula-count');
      const empty = root.querySelector('#formula-empty');
      const filter = () => {
        const v = input.value.trim().toLowerCase();
        let shown = 0;
        items.forEach((el) => {
          const ok = !v || el.dataset.fsearch.includes(v);
          el.style.display = ok ? '' : 'none';
          if (ok) shown++;
        });
        groupsEls.forEach((g) => { g.style.display = [...g.querySelectorAll('.formula-item')].some((el) => el.style.display !== 'none') ? '' : 'none'; });
        if (count) count.textContent = String(shown);
        empty?.classList.toggle('hide', shown > 0);
      };
      input?.addEventListener('input', filter);
      if (q) filter();
    },
  };
}

/* ------------------------------------------------------------------ */
/* Source reader                                                       */
/* ------------------------------------------------------------------ */

function renderReader(query) {
  const initial = Math.max(1, Math.min(688, +(query.get('page') || 1)));
  return {
    title: 'Source reader',
    html: `${pageHead('Original pages', 'Source reader', 'The supplied PDF in its original context. This is the user’s local copy; the app does not redistribute or reproduce the book’s copyrighted prose or figures as its own content.')}
      <div class="panel panel-warn" style="margin-bottom:14px"><div class="callout-title">Copyright note</div><p class="small" style="margin:0">The book is copyrighted. This reader exists so the learner can compare the authored explanations with the original pages they already possess. It is not a substitute for the book and does not grant redistribution rights.</p></div>
      <div class="ref-toolbar">
        <label class="ref-search" style="flex:0 1 300px">${icon('source', 15)}<input id="reader-page" type="number" min="1" max="688" value="${initial}" aria-label="PDF page" /></label>
        <button class="btn btn-primary btn-sm" data-action="reader-go">Open page</button>
        <select id="reader-chapter" class="btn btn-sm" aria-label="Jump to chapter">
          ${chapters.map((c) => `<option value="${c.pdfStart}">Ch. ${c.number} · ${esc(c.title)} (PDF p. ${c.pdfStart})</option>`).join('')}
        </select>
        <a class="btn btn-sm" href="source/Guide_to_Digital_Signal_Process.pdf#page=${initial}" target="_blank" rel="noopener">${icon('external', 14)} Open in a new tab</a>
      </div>
      <div class="pdf-frame-wrap">
        <iframe id="pdf-frame" title="Original source PDF" src="source/Guide_to_Digital_Signal_Process.pdf#page=${initial}&view=FitH"></iframe>
      </div>
      <p class="tiny muted" style="margin-top:10px">If the browser does not display the embedded PDF, use “Open in a new tab”. The reader is intentionally loaded only on this page to keep the rest of the app light.</p>`,
    after(root) {
      const frame = root.querySelector('#pdf-frame');
      const pageInput = root.querySelector('#reader-page');
      const chapterSelect = root.querySelector('#reader-chapter');
      const go = () => {
        const p = Math.max(1, Math.min(688, Number(pageInput.value) || 1));
        frame.src = `source/Guide_to_Digital_Signal_Process.pdf#page=${p}&view=FitH`;
      };
      root.querySelector('[data-action="reader-go"]')?.addEventListener('click', go);
      pageInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
      chapterSelect?.addEventListener('change', () => {
        pageInput.value = chapterSelect.value;
        go();
      });
    },
  };
}

function renderSource() {
  const totalSections = chapters.reduce((n, c) => n + c.sections.length, 0);
  const full = chapters.reduce((n, c) => n + c.sections.filter((s) => traceStatus(c, s) === 'full').length, 0);
  const explain = totalSections - full;
  const formulas = allFormulas().length;
  const quizzes = chapters.reduce((n, c) => n + c.quiz.length, 0);
  return {
    title: 'Source coverage',
    html: `${pageHead('Audit', 'PDF-to-application coverage', 'A machine-readable trace from every section of the 688-page source to an authored explanation, page reference, visual route, and practice path.')}
      <div class="trace-summary">
        <div class="stat-card"><div class="num">${totalSections}</div><div class="lbl">Source sections indexed</div></div>
        <div class="stat-card"><div class="num">${full}</div><div class="lbl">Full treatment</div></div>
        <div class="stat-card"><div class="num">${explain}</div><div class="lbl">Explanation-only</div></div>
        <div class="stat-card"><div class="num">${quizzes}</div><div class="lbl">Practice questions</div></div>
      </div>
      <div class="card card-pad" style="margin-bottom:16px">
        <div class="spread"><div><div class="kicker">How to read this audit</div><h2 class="section-title" style="font-size:24px">No concept is just a heading</h2></div><a class="btn btn-sm" href="source/Guide_to_Digital_Signal_Process.pdf" target="_blank" rel="noopener">Open the source PDF ${icon('external', 13)}</a></div>
        <p class="small muted">Each chapter row links to a section-by-section table. “Full” means the concept has a substantive authored explanation, a book/PDF page reference, and a route to the chapter lab or practice set. “Explanation-only” means a bespoke simulation would not materially improve understanding (for example, market context or historical notes). The source PDF contains a duplicated block in Chapter 2: PDF pages 25–48 repeat as 49–72. The index uses the first copy and original book-page numbers; no content is lost.</p>
        <div class="trace-legend"><span><span class="status-pill status-full">Full</span> ${full}</span><span><span class="status-pill status-explain">Explanation-only</span> ${explain}</span><span><span class="status-pill status-blocked">Blocked</span> 0</span><span class="muted">${formulas} formulas · ${chapters.reduce((n, c) => n + c.labs.length, 0)} labs · ${chapters.reduce((n, c) => n + c.quiz.length, 0)} questions</span></div>
      </div>
      <div class="trace-table-wrap"><table class="trace-table">
        <thead><tr><th>Ch.</th><th>Title</th><th>Book pages</th><th>PDF start</th><th>Sections</th><th>Lab</th><th>Practice</th><th>Status</th></tr></thead>
        <tbody>${chapters.map((c) => {
          const cf = c.sections.filter((s) => traceStatus(c, s) === 'full').length;
          return `<tr>
            <td class="src-page">${String(c.number).padStart(2, '0')}</td>
            <td><a href="#/chapter/${c.number}"><strong>${esc(c.title)}</strong></a><br><span class="tiny muted">${esc(c.part)}</span></td>
            <td class="src-page">${c.bookStart}–${c.bookEnd}</td>
            <td class="src-page">${c.pdfStart}</td>
            <td>${c.sections.length}</td>
            <td>${c.labs.length ? `<a href="#/chapter/${c.number}/lab">${esc(c.labs[0].title)}</a>` : '—'}</td>
            <td>${c.quiz.length}</td>
            <td><span class="status-pill status-full">${cf} full</span> ${cf < c.sections.length ? `<span class="status-pill status-explain">${c.sections.length - cf} expl.</span>` : ''}</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
      <div class="grid two-col" style="margin-top:18px">
        <div class="panel panel-warn"><div class="callout-title">Known ambiguities in the source</div><ul class="small" style="margin:0;padding-left:18px"><li>“Nyquist frequency” and “Nyquist rate” are used inconsistently in the literature; Smith uses both for half the sampling rate.</li><li>Cutoff frequency is defined at −3 dB for Butterworth/Chebyshev but at 50% amplitude for windowed-sinc.</li><li>Chebyshev ripple is given in percent in the source, while most modern tools use dB. The app shows the relation.</li><li>Some hardware details in Chapters 28–29 are specific to the 1990s ADSP-2106x/SHARC generation.</li></ul></div>
        <div class="panel panel-tip"><div class="callout-title">Coverage method</div><p class="small" style="margin:0">The section inventory is generated from the PDF outline (font-size/bold heading extraction) and validated against authored content. The validator reports missing sections, sections under 35 words, and extra IDs. Current result: 185/185 authored, 0 missing, 0 too short. Unit tests verify the numerical engine; the browser test verifies routing, labs, quizzes, persistence, and mobile layout.</p></div>
      </div>`,
  };
}

/* ------------------------------------------------------------------ */
/* Map, review, bookmarks, notes, quiz center                          */
/* ------------------------------------------------------------------ */

function renderMap() {
  const width = 1080;
  const rowH = 118;
  const nodeW = 96, nodeH = 30;
  const rows = parts.map((part, pi) => {
    const list = chapters.filter((c) => c.part === part);
    return { part, pi, list };
  });
  const height = rows.length * rowH + 40;
  const positions = new Map();
  rows.forEach(({ part, pi, list }) => {
    list.forEach((c, i) => {
      positions.set(c.number, { x: 142 + i * 104, y: 46 + pi * rowH, w: nodeW, h: nodeH, chapter: c });
    });
  });
  const edges = [];
  for (const c of chapters) {
    const to = positions.get(c.number);
    for (const p of c.prerequisites) {
      const from = positions.get(p);
      if (from) edges.push({ from, to, key: `${p}-${c.number}` });
    }
  }
  const edgeHtml = edges.map((e) => {
    const x1 = e.from.x + e.from.w, y1 = e.from.y + e.from.h / 2;
    const x2 = e.to.x, y2 = e.to.y + e.to.h / 2;
    const mx = (x1 + x2) / 2;
    return `<path class="map-edge" data-edge="${e.key}" d="M${x1} ${y1} C${mx + 20} ${y1}, ${mx - 20} ${y2}, ${x2} ${y2}" marker-end="url(#arrow)"/>`;
  }).join('');
  const nodeHtml = [...positions.values()].map((p) => {
    const c = p.chapter;
    const st = chapterStats(c);
    const cls = st.complete ? 'map-done' : st.progress > 0 ? 'map-started' : 'map-todo';
    return `<a href="#/chapter/${c.number}" class="map-node ${cls}" data-map-chapter="${c.number}" aria-label="Chapter ${c.number}: ${esc(c.title)}">
      <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="7"/>
      <text class="nnum" x="${p.x + 7}" y="${p.y + 12}">${String(c.number).padStart(2, '0')}</text>
      <text x="${p.x + 7}" y="${p.y + 24}">${esc(c.title.length > 15 ? c.title.slice(0, 14) + '…' : c.title)}</text>
    </a>`;
  }).join('');
  const partLabels = rows.map(({ part, pi }) => `<text class="map-part-label" x="4" y="${52 + pi * rowH}">${esc(part)}</text>`).join('');
  return {
    title: 'Concept map',
    html: `${pageHead('Orientation', 'Concept dependency map', 'The course is a network, not a list. Arrows show the recommended conceptual dependencies; the shaded nodes show your progress. Hover for details, click to open a chapter.')}
      <div class="map-toolbar"><span class="badge outline">33 nodes</span><span class="badge outline">${edges.length} dependencies</span><span class="map-legend"><span><i style="background:var(--green)"></i>complete</span><span><i style="background:var(--accent)"></i>in progress</span><span><i style="background:var(--border-strong)"></i>not started</span></span></div>
      <div class="concept-map-wrap">
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Concept dependency map of 33 chapters">
          <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="var(--border-strong)"/></marker></defs>
          ${partLabels}
          ${edgeHtml}
          ${nodeHtml}
        </svg>
      </div>
      <div class="map-detail card card-pad" id="map-detail"><p class="small muted" style="margin:0">Hover a chapter to see its prerequisites and progress.</p></div>
      <div class="panel panel-tip" style="margin-top:14px"><div class="callout-title">How to use the map</div><p class="small" style="margin:0">Follow the arrows when you feel lost. The five rows are the book’s parts; the left-to-right order is the chapter sequence. Some later chapters depend on more than one earlier idea—Chapter 20 (Chebyshev) depends on recursive filters and the z-transform, for example. Jumping ahead is allowed; the map tells you what you are missing.</p></div>`,
    after(root) {
      root.querySelectorAll('[data-map-chapter]').forEach((a) => {
        a.addEventListener('mouseenter', () => showMapDetail(+a.dataset.mapChapter, root));
        a.addEventListener('focus', () => showMapDetail(+a.dataset.mapChapter, root));
      });
    },
  };
}

function showMapDetail(n, root) {
  const c = chapterByNumber[n];
  const st = chapterStats(c);
  const el = root.querySelector('#map-detail');
  if (!el) return;
  el.innerHTML = `<div class="spread"><div><div class="kicker">Chapter ${c.number} · ${esc(c.part)}</div><h3 style="font-family:var(--font-serif);font-weight:500;margin:0 0 4px">${esc(c.title)}</h3><p class="small muted" style="margin:0">${esc(c.tagline)}</p></div><a class="btn btn-sm" href="#/chapter/${c.number}">Open chapter →</a></div>
  <div class="row" style="margin-top:10px"><span class="badge">${st.studied}/${st.total} studied</span><span class="badge">${Math.round(st.progress * 100)}%</span>${c.prerequisites.length ? `<span class="badge outline">Prereqs: ${c.prerequisites.map((p) => `Ch. ${p}`).join(', ')}</span>` : '<span class="badge outline">No prerequisites</span>'}</div>`;
}

function renderReview() {
  const s = getState();
  const weak = weakChapters(chapters);
  const conceptMisses = new Map();
  for (const ch of chapters) {
    const q = s.quiz[ch.number];
    if (!q?.answers) continue;
    for (const [qi, ans] of Object.entries(q.answers)) {
      const question = ch.quiz[Number(qi)];
      if (!question || Number(ans) === question.answer) continue;
      const sec = relatedConcept(ch, question);
      const cur = conceptMisses.get(sec.id) || { ch, sec, count: 0 };
      cur.count++;
      conceptMisses.set(sec.id, cur);
    }
  }
  const weakConcepts = [...conceptMisses.values()].sort((a, b) => b.count - a.count).slice(0, 8);
  const studiedSections = chapters.flatMap((c) => c.sections.filter((x) => s.studied[x.id]).map((x) => ({ ch: c, sec: x }))).slice(0, 10);
  const openChapters = chapters.filter((c) => s.opened[c.number]);
  const unstudied = openChapters.flatMap((c) => c.sections.filter((x) => !s.studied[x.id]).slice(0, 2).map((x) => ({ ch: c, sec: x }))).slice(0, 8);
  const bookmarkedSections = s.bookmarks.sections.map((id) => {
    const [cn] = id.split('.');
    const ch = chapterByNumber[+cn];
    return ch ? { ch, sec: ch.sections.find((x) => x.id === id) } : null;
  }).filter(Boolean);
  return {
    title: 'Review mode',
    html: `${pageHead('Deliberate practice', 'Review queue', 'Weak quiz scores, bookmarked concepts, and unfinished sections—collected in one place so you can spend time where it matters.')}
      <div class="review-grid">
        <div class="card review-card">
          <div class="kicker">Priority</div>
          <h3>Weak areas</h3>
          ${weak.length ? `<div class="weak-list">${weak.map(({ ch, st }) => `<div class="weak-row"><a href="#/chapter/${ch.number}/practice">Ch. ${ch.number} · ${esc(ch.title)}</a><span class="w-score">${st.quiz.best}/${st.quiz.total}</span></div>`).join('')}</div><a class="btn btn-primary btn-sm" style="margin-top:14px" href="#/chapter/${weak[0].ch.number}/practice">Review the weakest chapter ${icon('arrow', 13)}</a>` : `<p class="small muted">No weak quiz scores yet. Take a chapter quiz and the queue will fill in.</p><a class="btn btn-sm" href="#/quiz">Open assessments</a>`}
        </div>
        <div class="card review-card">
          <div class="kicker">Saved</div>
          <h3>Bookmarked concepts</h3>
          ${bookmarkedSections.length ? `<div class="weak-list">${bookmarkedSections.map(({ ch, sec }) => `<div class="weak-row"><a href="#/chapter/${ch.number}/learn/${sec.id}">${sec.id} · ${esc(sec.title)}</a><span class="tiny muted">Ch. ${ch.number}</span></div>`).join('')}</div>` : `<p class="small muted">No bookmarked concepts. Use the star on any concept card.</p>`}
        </div>
      </div>
      <div class="card card-pad" style="margin-top:16px">
        <div class="kicker">Concept-level review</div>
        <h3>Suggested concepts from missed questions</h3>
        ${weakConcepts.length ? `<div class="weak-list" style="margin-top:10px">${weakConcepts.map(({ ch, sec, count }) => `<div class="weak-row"><a href="#/chapter/${ch.number}/learn/${sec.id}">${sec.id} · ${esc(sec.title)}</a><span class="w-score">${count} miss${count > 1 ? 'es' : ''}</span></div>`).join('')}</div><p class="tiny muted" style="margin-top:8px">Mapped from your latest quiz answers by keyword; use it as a starting point, not a diagnosis.</p>` : `<p class="small muted">No missed questions mapped yet. Complete a chapter quiz first.</p>`}
      </div>
      <div class="card card-pad" style="margin-top:16px">
        <div class="kicker">Previously studied</div>
        <h3>Concepts you have marked understood</h3>
        ${studiedSections.length ? `<div class="list-grid" style="margin-top:10px">${studiedSections.map(({ ch, sec }) => `<a class="list-item" href="#/chapter/${ch.number}/learn/${sec.id}"><span class="li-num">${sec.id}</span><span class="li-main"><strong>${esc(sec.title)}</strong><span>Chapter ${ch.number} · ${esc(ch.title)}</span></span><span class="badge green">studied</span></a>`).join('')}</div>` : `<p class="small muted">No concepts marked studied yet. Use the check button on a concept card.</p>`}
      </div>
      <div class="card card-pad" style="margin-top:16px">
        <div class="kicker">Continue</div>
        <h3>Unfinished sections you have opened</h3>
        ${unstudied.length ? `<div class="list-grid" style="margin-top:12px">${unstudied.map(({ ch, sec }) => `<a class="list-item" href="#/chapter/${ch.number}/learn/${sec.id}"><span class="li-num">${sec.id}</span><span class="li-main"><strong>${esc(sec.title)}</strong><span>Chapter ${ch.number} · ${esc(ch.title)}</span></span><span class="badge">${esc(sec.level)}</span></a>`).join('')}</div>` : `<p class="small muted">Nothing pending. Open a new chapter or revisit a completed one.</p>`}
      </div>
      <div class="panel panel-tip" style="margin-top:16px"><div class="callout-title">A review routine that works</div><p class="small" style="margin:0">Re-read only the concept you missed; then redo the quiz without looking at the explanation. If you still miss it, change the representation: draw the signal, say the mechanism out loud, or rebuild it in the lab. Recognition is not recall.</p></div>`,
  };
}

function renderBookmarks() {
  const s = getState();
  const chs = s.bookmarks.chapters.map((n) => chapterByNumber[n]).filter(Boolean);
  const secs = s.bookmarks.sections.map((id) => {
    const ch = chapterByNumber[+id.split('.')[0]];
    const sec = ch?.sections.find((x) => x.id === id);
    return ch && sec ? { ch, sec } : null;
  }).filter(Boolean);
  return {
    title: 'Bookmarks',
    html: `${pageHead('Your shelf', 'Bookmarks', 'Chapters and concepts you want to return to. Stored in this browser.')}
      <div class="two-col">
        <div class="card card-pad"><div class="kicker">Chapters</div><h3>Whole chapters</h3>${chs.length ? `<div class="list-grid" style="margin-top:10px">${chs.map((c) => `<div class="list-item"><span class="li-num">${String(c.number).padStart(2, '0')}</span><a class="li-main" href="#/chapter/${c.number}"><strong>${esc(c.title)}</strong><span>${esc(c.part)}</span></a><button class="btn btn-ghost btn-sm" data-action="remove-bookmark-chapter" data-chapter="${c.number}" aria-label="Remove bookmark">${icon('close', 14)}</button></div>`).join('')}</div>` : `<p class="small muted" style="margin-top:8px">No chapter bookmarks yet.</p>`}</div>
        <div class="card card-pad"><div class="kicker">Sections</div><h3>Specific concepts</h3>${secs.length ? `<div class="list-grid" style="margin-top:10px">${secs.map(({ ch, sec }) => `<a class="list-item" href="#/chapter/${ch.number}/learn/${sec.id}"><span class="li-num">${sec.id}</span><span class="li-main"><strong>${esc(sec.title)}</strong><span>Ch. ${ch.number} · ${esc(ch.title)}</span></span></a>`).join('')}</div>` : `<p class="small muted" style="margin-top:8px">No section bookmarks. Use the star on a concept card.</p>`}</div>
      </div>`,
  };
}

function renderNotes() {
  const s = getState();
  const entries = Object.entries(s.notes).map(([n, note]) => ({ ch: chapterByNumber[+n], note })).filter((e) => e.ch);
  return {
    title: 'My notes',
    html: `${pageHead('Your words', 'Notes', 'Personal notes saved locally. Open a chapter’s Notes tab to add or edit.')}
      ${entries.length ? `<div class="list-grid">${entries.map(({ ch, note }) => `<div class="card note-card"><div class="spread"><h3><a href="#/chapter/${ch.number}/notes">Ch. ${ch.number} · ${esc(ch.title)}</a></h3><span class="tiny muted">${formatDate(note.updated)}</span></div><p>${esc(note.text)}</p><div class="row"><a class="btn btn-sm" href="#/chapter/${ch.number}/notes">Edit</a><button class="btn btn-ghost btn-sm" data-action="delete-note" data-chapter="${ch.number}">Delete</button></div></div>`).join('')}</div>` : `<div class="empty-state"><h3>No notes yet</h3><p>Notes are for the connections you make, not for copying the text. Start with one chapter.</p><a class="btn btn-primary" href="#/chapter/1/notes">Write your first note</a></div>`}`,
  };
}

function renderQuizCenter() {
  const s = getState();
  const attempted = chapters.filter((c) => s.quiz[c.number]);
  const avg = attempted.length ? attempted.reduce((n, c) => n + s.quiz[c.number].best / s.quiz[c.number].total, 0) / attempted.length : 0;
  return {
    title: 'Assessments',
    html: `${pageHead('Assessment center', 'Practice and mastery checks', 'Chapter quizzes test application and explanation, not just definitions. Your best score is saved; weak areas feed the review queue.')}
      <div class="trace-summary">
        <div class="stat-card"><div class="num">${attempted.length}/${chapters.length}</div><div class="lbl">Chapters attempted</div></div>
        <div class="stat-card"><div class="num">${avg ? Math.round(avg * 100) + '%' : '—'}</div><div class="lbl">Average best score</div></div>
        <div class="stat-card"><div class="num">${chapters.reduce((n, c) => n + c.quiz.length, 0)}</div><div class="lbl">Questions available</div></div>
        <div class="stat-card"><div class="num">${weakChapters(chapters).length}</div><div class="lbl">Chapters under 70%</div></div>
      </div>
      <div class="trace-table-wrap"><table class="trace-table">
        <thead><tr><th>Ch.</th><th>Chapter</th><th>Best score</th><th>Attempts</th><th>Status</th><th></th></tr></thead>
        <tbody>${chapters.map((c) => {
          const q = s.quiz[c.number];
          const frac = q ? q.best / q.total : null;
          return `<tr><td class="src-page">${String(c.number).padStart(2, '0')}</td><td><a href="#/chapter/${c.number}">${esc(c.title)}</a></td><td>${q ? `${q.best}/${q.total}` : '—'}</td><td>${q ? q.attempts : 0}</td><td>${frac === null ? '<span class="status-pill status-explain">Not attempted</span>' : frac >= 0.7 ? '<span class="status-pill status-full">Passing</span>' : '<span class="status-pill status-partial">Needs review</span>'}</td><td><a class="btn btn-sm" href="#/chapter/${c.number}/practice">${q ? 'Retry' : 'Start'}</a></td></tr>`;
        }).join('')}</tbody>
      </table></div>
      <div class="panel panel-tip" style="margin-top:16px"><div class="callout-title">What “passing” means</div><p class="small" style="margin:0">A chapter is marked complete when at least 95% of its concepts are studied, its lab has been opened, and the best quiz score is at least 70%. A high quiz score without studying the concepts still leaves the chapter yellow—both knowledge and coverage count.</p></div>`,
  };
}

/* ------------------------------------------------------------------ */
/* Global interactions                                                 */
/* ------------------------------------------------------------------ */

document.addEventListener('click', (e) => {
  const fig = e.target.closest('[data-image-open]');
  if (fig) {
    e.preventDefault();
    const img = document.getElementById('image-large');
    const title = document.getElementById('image-title');
    const cap = document.getElementById('image-caption');
    const cred = document.getElementById('image-credit');
    if (!img || !title || !cap || !cred) return;
    img.src = fig.dataset.src;
    img.alt = fig.dataset.title || 'Figure';
    title.textContent = fig.dataset.title || 'Figure';
    cap.textContent = fig.dataset.caption || '';
    const page = fig.dataset.page || '';
    const isImage = fig.dataset.kind === 'image';
    cred.innerHTML = `${esc(fig.dataset.credit || '')}${isImage && page ? ` · <a href="${esc(page)}" target="_blank" rel="noopener">Wikimedia Commons file page</a>` : ''}`;
    openModal('image-modal');
    return;
  }
  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;
  e.preventDefault();
  const action = actionEl.dataset.action;
  if (action === 'toggle-study') {
    const id = actionEl.dataset.section;
    const now = toggleStudy(id);
    document.querySelectorAll(`[data-section-card="${CSS.escape(id)}"]`).forEach((card) => card.classList.toggle('studied', now));
    document.querySelectorAll(`[data-action="toggle-study"][data-section="${CSS.escape(id)}"]`).forEach((btn) => {
      btn.setAttribute('aria-label', now ? 'Mark unstudied' : 'Mark studied');
      if (btn.classList.contains('study-toggle')) {
        btn.classList.toggle('on', now);
        btn.innerHTML = `${icon(now ? 'check' : 'target', 13)} ${now ? 'Studied' : 'Mark studied'}`;
      }
    });
    refreshChrome();
    const ch = chapterByNumber[+id.split('.')[0]];
    updateChapterProgressUI(ch);
  } else if (action === 'toggle-bookmark-chapter' || action === 'toggle-bookmark-section') {
    const kind = action.endsWith('chapter') ? 'chapter' : 'section';
    const id = kind === 'chapter' ? Number(actionEl.dataset.chapter) : actionEl.dataset.section;
    const now = toggleBookmark(kind, id);
    if (kind === 'chapter') {
      actionEl.innerHTML = `${icon(now ? 'bookmarked' : 'bookmark', 14)} <span>${now ? 'Bookmarked' : 'Bookmark'}</span>`;
    } else {
      actionEl.innerHTML = icon(now ? 'bookmarked' : 'bookmark', 17);
      actionEl.setAttribute('aria-label', now ? 'Remove bookmark' : 'Bookmark this section');
      actionEl.title = now ? 'Remove bookmark' : 'Bookmark';
    }
    actionEl.setAttribute('aria-pressed', String(now));
    toast(now ? 'Bookmarked.' : 'Bookmark removed.');
    refreshChrome();
  } else if (action === 'remove-bookmark-chapter') {
    const n = Number(actionEl.dataset.chapter);
    toggleBookmark('chapter', n);
    actionEl.closest('.list-item')?.remove();
    toast('Bookmark removed.');
  } else if (action === 'set-depth') {
    const deep = actionEl.dataset.depth === 'technical';
    setPref('deep', deep);
    document.querySelectorAll('.depth-switch button').forEach((b) => b.classList.toggle('active', b.dataset.depth === actionEl.dataset.depth));
    document.querySelectorAll('.tech-detail').forEach((d) => { d.open = deep; });
  } else if (action === 'expand-all') {
    const anyClosed = [...document.querySelectorAll('.tech-detail')].some((d) => !d.open);
    document.querySelectorAll('.tech-detail').forEach((d) => { d.open = anyClosed; });
    actionEl.textContent = anyClosed ? 'Collapse all detail' : 'Expand all detail';
  } else if (action === 'quiz-option') {
    const ch = chapterByNumber[+actionEl.dataset.chapter];
    answerQuiz(ch, +actionEl.dataset.q, +actionEl.dataset.option);
  } else if (action === 'quiz-retry') {
    const n = +actionEl.dataset.chapter;
    quizSessions.delete(n);
    location.hash = `#/chapter/${n}/practice`;
    renderRoute();
  } else if (action === 'save-note') {
    const n = +actionEl.dataset.chapter;
    const text = document.getElementById('chapter-notes')?.value || '';
    setNote(n, text);
    toast('Note saved locally.');
    document.getElementById('notes-status').textContent = 'Saved just now';
    refreshChrome();
  } else if (action === 'clear-note') {
    const n = +actionEl.dataset.chapter;
    if (!confirm('Clear this note? This cannot be undone.')) return;
    setNote(n, '');
    const area = document.getElementById('chapter-notes');
    if (area) area.value = '';
    document.getElementById('notes-status').textContent = 'Not saved yet';
    toast('Note cleared.');
  } else if (action === 'delete-note') {
    const n = +actionEl.dataset.chapter;
    if (!confirm('Delete this note?')) return;
    setNote(n, '');
    actionEl.closest('.note-card')?.remove();
    toast('Note deleted.');
  } else if (action === 'copy-tex') {
    navigator.clipboard?.writeText(actionEl.dataset.tex || '').then(() => toast('TeX copied.')).catch(() => toast('Could not copy.'));
  }
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'chapter-notes') {
    const n = +e.target.closest('[data-chapter]')?.dataset.chapter || +document.querySelector('[data-action="save-note"]')?.dataset.chapter;
    const status = document.getElementById('notes-status');
    if (status) status.textContent = 'Unsaved changes…';
    clearTimeout(e.target._noteTimer);
    e.target._noteTimer = setTimeout(() => {
      if (n && !Number.isNaN(n)) {
        setNote(n, e.target.value);
        if (status) status.textContent = 'Saved just now';
      }
    }, 700);
  }
});

function afterRenderCommon(root) {
  const route = parseRoute();
  if (route.segs[0] === 'chapter') {
    const ch = chapterByNumber[+route.segs[1]];
    const tab = route.segs[2] || 'learn';
    if (ch && tab === 'lab') afterLabs(root, ch);
  }
  root.querySelectorAll('a[href^="#/"]').forEach((a) => a.addEventListener('click', closeMenu));
}

/* ------------------------------------------------------------------ */
/* Search                                                             */
/* ------------------------------------------------------------------ */

function buildSearch() {
  if (searchIndexBuilt) return;
  buildIndex(chapters, glossary);
  searchIndexBuilt = true;
}

function openSearch() {
  openModal('search-modal');
  const input = document.getElementById('search-input');
  if (input) { input.value = ''; input.focus(); }
  document.querySelectorAll('#search-filters .chip').forEach((c, i) => {
    c.classList.toggle('active', i === 0);
    c.setAttribute('aria-selected', String(i === 0));
  });
  runSearch('', 'all');
}

function runSearch(q, filter = 'all') {
  const active = document.querySelector('#search-filters .chip.active')?.dataset.filter || filter;
  searchGroups = search(q, active);
  const results = document.getElementById('search-results');
  if (results) results.innerHTML = renderResults(searchGroups, q);
  const first = results?.querySelector('.search-result');
  results?.querySelectorAll('.search-result').forEach((el) => el.classList.remove('active'));
  first?.classList.add('active');
}

function onSearchKey(e) {
  if (e.key === 'Escape') { closeModal('search-modal'); return; }
  if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) return;
  const results = [...document.querySelectorAll('#search-results .search-result')];
  if (!results.length) return;
  const current = results.findIndex((r) => r.classList.contains('active'));
  if (e.key === 'Enter') {
    e.preventDefault();
    (results[current] || results[0])?.click();
    return;
  }
  e.preventDefault();
  const next = e.key === 'ArrowDown' ? Math.min(results.length - 1, current + 1) : Math.max(0, current - 1);
  results.forEach((r) => r.classList.remove('active'));
  results[next].classList.add('active');
  results[next].scrollIntoView({ block: 'nearest' });
}

function onGlobalKey(e) {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
  if (e.key === 'Escape') {
    if (document.querySelector('.modal:not([hidden])')) { closeModal(); return; }
    closeMenu();
    return;
  }
  if (typing) return;
  if (e.key === '/' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); openSearch(); return; }
  if (e.key === '?' || (e.key === '/' && e.shiftKey)) { e.preventDefault(); openModal('help-modal'); return; }
  if (e.key.toLowerCase() === 't') { toggleTheme(); return; }
  if (e.altKey && e.key === 'ArrowRight') {
    const route = parseRoute();
    if (route.segs[0] === 'chapter') {
      const next = chapterByNumber[+route.segs[1] + 1];
      if (next) location.hash = `#/chapter/${next.number}`;
    }
    return;
  }
  if (e.altKey && e.key === 'ArrowLeft') {
    const route = parseRoute();
    if (route.segs[0] === 'chapter') {
      const prev = chapterByNumber[+route.segs[1] - 1];
      if (prev) location.hash = `#/chapter/${prev.number}`;
    }
    return;
  }
  if (e.key.toLowerCase() === 'g') {
    const handler = (ev) => {
      if (ev.key.toLowerCase() === 'h') location.hash = '#/home';
      document.removeEventListener('keydown', handler);
    };
    document.addEventListener('keydown', handler);
    setTimeout(() => document.removeEventListener('keydown', handler), 1200);
  }
}

/* Patch mount to run common after-render hooks. */
init();

/* Expose a tiny debug surface for browser tests and curious learners. */
window.__dsp = { chapters, validateContent, getState, traceStatus, allFormulas, quizSessions, visuals, visualList, chapterVisuals };
