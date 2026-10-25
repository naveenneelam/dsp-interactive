import { part1 } from './part1.js';
import { part2 } from './part2.js';
import { part3 } from './part3.js';
import { part4 } from './part4.js';
import { part5 } from './part5.js';
import { sourceIndex } from '../data/source_index.js';

const authored = [...part1, ...part2, ...part3, ...part4, ...part5];

export const chapters = sourceIndex.map((src) => {
  const a = authored.find((c) => c.number === src.number) || {};
  const sections = src.sections.map((s) => {
    const found = (a.sections || []).find((x) => x.id === s.id);
    return {
      ...s,
      pdfPage: s.bookPage + (s.bookPage < 35 ? 14 : 38),
      intuition: found?.intuition || '',
      detail: found?.detail || '',
      advanced: found?.advanced || '',
      formulas: found?.formulas || [],
      keyPoints: found?.keyPoints || [],
      caveat: found?.caveat || '',
      application: found?.application || '',
      level: found?.level || 'core',
      authored: !!found,
    };
  });
  const labs = a.labs || [];
  return {
    ...src,
    ...a,
    sections,
    lab: labs[0]?.id || null,
    labs,
    quiz: a.quiz || [],
    authored: !!a.title,
  };
});

export const parts = ['Foundations', 'Fundamentals', 'Digital Filters', 'Applications', 'Complex Techniques'];

export const chapterByNumber = Object.fromEntries(chapters.map((c) => [c.number, c]));
export const sectionById = Object.fromEntries(chapters.flatMap((c) => c.sections.map((s) => [s.id, { ...s, chapter: c }])));

export function validateContent() {
  const missing = [];
  const tooShort = [];
  const extras = [];
  const allSectionIds = new Set(sourceIndex.flatMap((c) => c.sections.map((s) => s.id)));
  for (const ch of chapters) {
    for (const s of ch.sections) {
      if (!s.authored) missing.push(`${s.id} ${s.title}`);
      const words = `${s.intuition} ${s.detail}`.trim().split(/\s+/).filter(Boolean).length;
      if (s.authored && words < 35) tooShort.push(`${s.id} (${words} words)`);
    }
    for (const s of (authored.find((a) => a.number === ch.number)?.sections || [])) {
      if (!allSectionIds.has(s.id)) extras.push(s.id);
    }
  }
  return {
    chapters: chapters.length,
    sections: chapters.reduce((n, c) => n + c.sections.length, 0),
    missing, tooShort, extras,
    quizzes: chapters.reduce((n, c) => n + c.quiz.length, 0),
    labs: chapters.reduce((n, c) => n + c.labs.length, 0),
    formulas: chapters.reduce((n, c) => n + c.sections.reduce((m, s) => m + s.formulas.length, 0), 0),
  };
}
