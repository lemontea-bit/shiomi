/** Thin localStorage wrapper — every call is wrapped in try/catch since storage can throw
 * (private browsing, disabled site data, etc.) and callers should just fall back silently. */
export function loadJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore — e.g. private browsing, storage disabled, quota exceeded
  }
}
