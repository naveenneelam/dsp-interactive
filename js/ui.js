/** UI primitives: escaping, rich text, icons, toasts, dialogs. */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

export function rich(text = '') {
  let s = esc(text);
  // inline code first (protect its contents from emphasis)
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const safe = /^(#|\/|https?:|mailto:)/.test(href) ? href : '#';
    return `<a href="${safe}">${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`);
  const paras = s.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return paras.map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}

export function math(tex, display = true) {
  if (typeof katex === 'undefined') return `<code>${esc(tex)}</code>`;
  try {
    return katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore', trust: false });
  } catch {
    return `<code>${esc(tex)}</code>`;
  }
}

export function renderMath(root = document.body) {
  if (typeof renderMathInElement === 'undefined') return;
  try {
    renderMathInElement(root, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
      throwOnError: false,
      strict: 'ignore',
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option'],
    });
  } catch (err) { console.warn('Math rendering:', err); }
}

const ICONS = {
  bookmark: '<path d="M6 3h12v18l-6-4.5L6 21Z"/>',
  bookmarked: '<path d="M6 3h12v18l-6-4.5L6 21Z" fill="currentColor"/>',
  check: '<path d="m4 12.5 5 5L20 6.5"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  play: '<path d="M7 4v16l13-8Z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M7 4h4v16H7zM14 4h4v16h-4z" fill="currentColor" stroke="none"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  left: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"/>',
  note: '<path d="M4 4h16v12l-4 4H4z"/><path d="M16 20v-4h4"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9Z"/>',
  lab: '<path d="M9 3h6M10 3v6l-5.5 9.2A1.5 1.5 0 0 0 5.8 21h12.4a1.5 1.5 0 0 0 1.3-2.3L14 9V3"/><path d="M7.5 15h9"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.5 2.5 0 1 1 3.7 2.3c-.9.5-1.3 1.1-1.3 2.1"/><circle cx="12" cy="17.4" r=".8" fill="currentColor" stroke="none"/>',
  map: '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 7l3.5 9M17 7l-3.5 9M7 6h10"/>',
  source: '<path d="M5 3h9l5 5v13H5z"/><path d="M14 3v5h5M8 13h8M8 17h6"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  spark: '<path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.8 2.8M16.2 16.2 19 19M19 5l-2.8 2.8M7.8 16.2 5 19"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  warn: '<path d="M12 3 2.5 20h19Z"/><path d="M12 9v5M12 17.5v.5"/>',
};

export function icon(name, size = 16) {
  return `<svg class="ui-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

export function sourceRef(bookPage, pdfPage, section) {
  const title = section ? `${section} — book page ${bookPage}` : `Book page ${bookPage}`;
  return `<span class="concept-src" title="${esc(title)}">§ p. ${bookPage}${pdfPage ? ` · PDF ${pdfPage}` : ''}</span>`;
}

export function progressBar(value, cls = '') {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return `<div class="bar ${cls}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div>`;
}

export function toast(message, ms = 2600) {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    el.style.transition = 'opacity .2s, transform .2s';
    setTimeout(() => el.remove(), 220);
  }, ms);
}

export function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.hidden = false;
  document.body.style.overflow = 'hidden';
  if (id === 'search-modal') setTimeout(() => document.getElementById('search-input')?.focus(), 30);
  else m.querySelector('button, [href], input, select, textarea')?.focus();
}

export function closeModal(id) {
  const m = id ? document.getElementById(id) : document.querySelector('.modal:not([hidden])');
  if (!m) return;
  m.hidden = true;
  if (!document.querySelector('.modal:not([hidden])')) document.body.style.overflow = '';
}

export function debounce(fn, ms = 120) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export function highlight(text, query) {
  if (!query) return esc(text);
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return esc(text);
  return `${esc(text.slice(0, i))}<mark>${esc(text.slice(i, i + query.length))}</mark>${esc(text.slice(i + query.length))}`;
}

export function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
}
