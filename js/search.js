/** Full-text search over chapters, sections, glossary, and formulas. */

import { esc, highlight } from './ui.js';

let INDEX = [];

export function buildIndex(chapters, glossary) {
  const idx = [];
  for (const ch of chapters) {
    idx.push({
      type: 'chapter', id: `ch-${ch.number}`, chapter: ch.number,
      title: `Chapter ${ch.number}: ${ch.title}`,
      body: `${ch.tagline} ${ch.intro}`,
      href: `#/chapter/${ch.number}`,
      scoreBase: 45,
    });
    for (const s of ch.sections) {
      idx.push({
        type: 'concept', id: `sec-${s.id}`, chapter: ch.number, section: s.id,
        title: `${s.id} ${s.title}`,
        body: `${s.intuition} ${s.detail} ${(s.keyPoints || []).join(' ')} ${s.visual ? s.visual.title + ' ' + s.visual.caption : ''}`,
        href: `#/chapter/${ch.number}/learn/${s.id}`,
        scoreBase: 35,
      });
    }
    for (const f of ch.sections.flatMap((s) => (s.formulas || []).map((fm) => ({ ...fm, section: s.id, sectionTitle: s.title })))) {
      idx.push({
        type: 'formula', id: `f-${f.section}-${f.label}`, chapter: ch.number,
        title: f.label, body: `${f.tex} ${f.vars || ''} ${f.sectionTitle}`,
        href: `#/formulas?q=${encodeURIComponent(f.label)}`,
        scoreBase: 20,
      });
    }
  }
  for (const g of glossary) {
    idx.push({
      type: 'glossary', id: `g-${g.term}`, chapter: g.chapters?.[0] || 1,
      title: g.term, body: g.def,
      href: `#/glossary?q=${encodeURIComponent(g.term)}`,
      scoreBase: 40,
    });
  }
  INDEX = idx;
  return idx;
}

export function search(query, filter = 'all', limit = 24) {
  const q = query.trim().toLowerCase();
  if (!q) {
    const defaults = INDEX.filter((e) => e.type === 'chapter').slice(0, 8);
    return groupResults(defaults);
  }
  const terms = q.split(/\s+/).filter(Boolean);
  const scored = [];
  for (const e of INDEX) {
    if (filter !== 'all' && e.type !== filter && !(filter === 'concept' && e.type === 'chapter')) continue;
    const title = e.title.toLowerCase();
    const body = e.body.toLowerCase();
    let score = 0;
    for (const t of terms) {
      const ti = title.indexOf(t), bi = body.indexOf(t);
      if (ti >= 0) score += 80 + (ti === 0 ? 40 : 0);
      if (bi >= 0) score += 22;
      if (ti < 0 && bi < 0) { score = -1; break; }
    }
    if (score >= 0) scored.push({ ...e, score: score + e.scoreBase });
  }
  scored.sort((a, b) => b.score - a.score);
  return groupResults(scored.slice(0, limit));
}

function groupResults(items) {
  const labels = { chapter: 'Chapters', concept: 'Concepts', glossary: 'Glossary', formula: 'Formulas' };
  const order = ['chapter', 'concept', 'glossary', 'formula'];
  const groups = [];
  for (const type of order) {
    const list = items.filter((i) => i.type === type);
    if (list.length) groups.push({ type, label: labels[type], items: list });
  }
  return groups;
}

export function renderResults(groups, query) {
  if (!groups.length) {
    return `<div class="search-empty">No matches for “${esc(query)}”. Try a shorter term, a chapter number, or a synonym such as “sampling” for aliasing.</div>`;
  }
  return groups.map((g) => `
    <div class="search-group">
      <div class="search-group-label">${g.label}</div>
      ${g.items.map((r, i) => `
        <a class="search-result" href="${r.href}" data-result data-index="${i}" role="option">
          <span class="sr-ico">${r.type === 'chapter' ? '§' : r.type === 'concept' ? '¶' : r.type === 'glossary' ? 'Aa' : '∑'}</span>
          <span class="sr-main">
            <strong>${highlight(r.title, query)}</strong>
            <span>${highlight(snippet(r.body, query), query)}</span>
          </span>
          ${r.chapter ? `<span class="badge outline">Ch ${r.chapter}</span>` : ''}
        </a>`).join('')}
    </div>`).join('');
}

function snippet(body, query) {
  const q = query.trim().toLowerCase();
  if (!q) return body.slice(0, 120);
  const i = body.toLowerCase().indexOf(q);
  if (i < 0) return body.slice(0, 120);
  const start = Math.max(0, i - 40);
  const end = Math.min(body.length, i + q.length + 90);
  return `${start > 0 ? '…' : ''}${body.slice(start, end)}${end < body.length ? '…' : ''}`;
}
