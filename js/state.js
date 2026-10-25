/** Local-first learner state. No backend, no account. */

const KEY = 'dsp-fieldbook-state-v1';

const DEFAULT = {
  version: 1,
  theme: null,
  prefs: { reducedMotion: false, deep: false, showSource: true },
  studied: {},          // section id -> true
  labs: {},             // "chapter:lab" -> true
  quiz: {},             // chapter number -> { best, total, attempts, last, answers }
  quizHistory: [],      // { chapter, score, total, at }
  bookmarks: { chapters: [], sections: [] },
  notes: {},            // chapter number -> { text, updated }
  visits: [],           // ISO dates
  lastChapter: 1,
  lastRoute: '#/home',
  opened: {},           // chapter -> true
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT), ...parsed, prefs: { ...DEFAULT.prefs, ...(parsed.prefs || {}) }, bookmarks: { ...DEFAULT.bookmarks, ...(parsed.bookmarks || {}) } };
  } catch {
    return structuredClone(DEFAULT);
  }
}

let state = load();
const listeners = new Set();
let saveTimer = null;

function emit() {
  for (const fn of listeners) {
    try { fn(state); } catch (err) { console.error(err); }
  }
}
function save() {
  clearTimeout(saveTimer);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full/blocked */ }
}

export function getState() { return state; }
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function update(mutator) {
  mutator(state);
  save();
  emit();
}

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function recordVisit(chapter) {
  update((s) => {
    const t = todayKey();
    if (!s.visits.includes(t)) s.visits.push(t);
    if (chapter) { s.lastChapter = chapter; s.opened[chapter] = true; }
  });
}

export function setTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  save(); emit();
}

export function setPref(key, value) {
  update((s) => { s.prefs[key] = value; });
}

export function toggleStudy(sectionId) {
  update((s) => {
    if (s.studied[sectionId]) delete s.studied[sectionId];
    else s.studied[sectionId] = true;
  });
  return !!state.studied[sectionId];
}

export function markLabVisited(chapter, labId) {
  const key = `${chapter}:${labId}`;
  if (state.labs[key]) return;
  update((s) => { s.labs[key] = true; });
}

export function recordQuiz(chapter, score, total, answers) {
  update((s) => {
    const prev = s.quiz[chapter];
    const best = prev ? Math.max(prev.best, score) : score;
    s.quiz[chapter] = {
      best, total, attempts: (prev?.attempts || 0) + 1,
      last: score, lastAt: new Date().toISOString(),
      answers: answers || prev?.answers || {},
    };
    s.quizHistory.push({ chapter, score, total, at: new Date().toISOString() });
    if (s.quizHistory.length > 200) s.quizHistory.shift();
  });
}

export function toggleBookmark(kind, id) {
  const list = kind === 'chapter' ? state.bookmarks.chapters : state.bookmarks.sections;
  const i = list.indexOf(id);
  if (i >= 0) list.splice(i, 1); else list.push(id);
  save(); emit();
  return list.includes(id);
}

export function isBookmarked(kind, id) {
  return (kind === 'chapter' ? state.bookmarks.chapters : state.bookmarks.sections).includes(id);
}

export function setNote(chapter, text) {
  update((s) => {
    if (!text.trim()) delete s.notes[chapter];
    else s.notes[chapter] = { text, updated: new Date().toISOString() };
  });
}

export function saveLastRoute(route) {
  state.lastRoute = route;
  save();
}

export function resetProgress() {
  const keep = { theme: state.theme, prefs: state.prefs };
  state = { ...structuredClone(DEFAULT), ...keep };
  save(); emit();
}

/* ------------------------------------------------------------------ */
/* Derived progress                                                    */
/* ------------------------------------------------------------------ */

export function chapterStats(ch, s = state) {
  const total = ch.sections.length;
  const studied = ch.sections.filter((sec) => s.studied[sec.id]).length;
  const labs = ch.labs || [];
  const labsDone = labs.filter((l) => s.labs[`${ch.number}:${l.id}`]).length;
  const q = s.quiz[ch.number];
  const quizFrac = q ? Math.min(1, q.best / (q.total || 1)) : 0;
  const coverage = total ? studied / total : 0;
  const labFrac = labs.length ? labsDone / labs.length : 1;
  const progress = 0.5 * coverage + 0.25 * labFrac + 0.25 * quizFrac;
  const complete = coverage >= 0.95 && (!ch.quiz?.length || quizFrac >= 0.7) && (!labs.length || labsDone >= 1);
  return {
    total, studied, coverage, labsTotal: labs.length, labsDone, labFrac,
    quiz: q || null, quizFrac, progress, complete,
  };
}

export function globalStats(chapters, s = state) {
  let sum = 0, complete = 0, studied = 0, sections = 0, quizSum = 0, quizN = 0;
  for (const ch of chapters) {
    const st = chapterStats(ch, s);
    sum += st.progress; studied += st.studied; sections += st.total;
    if (st.complete) complete++;
    if (st.quiz) { quizSum += st.quizFrac; quizN++; }
  }
  return {
    progress: chapters.length ? sum / chapters.length : 0,
    complete, studied, sections,
    quizAvg: quizN ? quizSum / quizN : 0,
    chapters: chapters.length,
    bookmarks: s.bookmarks.chapters.length + s.bookmarks.sections.length,
    notes: Object.keys(s.notes).length,
  };
}

export function streak(s = state) {
  if (!s.visits.length) return 0;
  const set = new Set(s.visits);
  let n = 0;
  const d = new Date();
  // allow the streak to start yesterday if today has not been logged yet
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1);
  while (set.has(todayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export function weakChapters(chapters, s = state) {
  return chapters
    .map((ch) => ({ ch, st: chapterStats(ch, s) }))
    .filter(({ st }) => st.quiz && st.quizFrac < 0.7)
    .sort((a, b) => a.st.quizFrac - b.st.quizFrac);
}
