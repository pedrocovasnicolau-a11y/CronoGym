// Helpers de localStorage. Todas las claves usan el prefijo `cg_`.

export function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

/**
 * Lee un objeto de configuración y lo fusiona con los valores por defecto.
 * Así, añadir un campo nuevo a `defaults` no rompe a quien tenga guardada
 * una versión anterior del objeto (evita `undefined` → `NaN`).
 */
export function loadConfig(key, defaults) {
  const stored = lsGet(key, null);
  if (!stored || typeof stored !== 'object') return { ...defaults };
  return { ...defaults, ...stored };
}
