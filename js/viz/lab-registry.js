/** Registry shared by lab modules (avoids circular imports). */
const registry = new Map();
export function registerLab(id, mount) { registry.set(id, mount); }
export function getLab(id) { return registry.get(id); }
export function labIds() { return [...registry.keys()]; }
