const PREFIX = 'gems-v2:';

export function loadNumber(key: string, fallback = 0): number {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    const n = raw == null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

export function saveNumber(key: string, value: number) {
  try {
    localStorage.setItem(PREFIX + key, String(value));
  } catch {
    // Storage can be unavailable (private mode); scores just won't persist.
  }
}
