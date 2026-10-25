/**
 * Lab registry entry point.
 * Each lab module registers itself on import; app.js calls mountLab(id, el).
 */

import { getLab } from './lab-registry.js';
import './labs-foundations.js';
import './labs-fourier.js';
import './labs-fourier2.js';
import './labs-filters.js';
import './labs-apps.js';
import './labs-apps2.js';
import './labs-complex.js';

export function mountLab(id, el, ctx) {
  const fn = getLab(id);
  if (!fn) {
    el.innerHTML = `<div class="lab-card"><div class="lab-head"><div class="kicker">Interactive lab</div><h2>Lab unavailable</h2><p>This interactive was not registered. The chapter text, formulas, and worked example are still available.</p></div></div>`;
    return () => {};
  }
  try {
    return fn(el, ctx) || (() => {});
  } catch (err) {
    console.error(`Lab ${id} failed`, err);
    el.innerHTML = `<div class="lab-card"><div class="lab-head"><h2>Lab error</h2><p>The simulation could not start. Check the browser console for details.</p><pre class="small" style="white-space:pre-wrap">${String(err.message || err)}</pre></div></div>`;
    return () => {};
  }
}
