import { normalizePrefectureName, PREFECTURE_CITIES } from '../data/prefectureCities';
import { searchKnownWaters, type KnownWater } from '../data/knownWaters';

export interface GeocodeResult {
  id: number;
  name: string;
  admin1?: string; // 都道府県
  admin2?: string; // 市区町村
  lat: number;
  lon: number;
}

/** Forward geocoding via Open-Meteo's free, keyless geocoding API — used so a viewer can
 * jump to any 都道府県・市区町村 (or landmark) in Japan by name, not just the three curated
 * spots per field. There's no reverse-geocoding here (coords → place name), so this is a
 * search box, not an auto-detected address. */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (!q) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=ja&country=JP&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`geocoding ${res.status}`);
  const j = await res.json();
  const results: unknown[] = j.results ?? [];
  return results.map((r) => {
    const rr = r as { id: number; name: string; admin1?: string; admin2?: string; latitude: number; longitude: number };
    return { id: rr.id, name: rr.name, admin1: rr.admin1, admin2: rr.admin2, lat: rr.latitude, lon: rr.longitude };
  });
}

/** True when a result is a 都道府県 itself (e.g. searching "神奈川県" surfaces the
 * prefecture's own broad point) rather than a specific city/town within one. The
 * geocoding API has no "list everything inside this admin1" call, so this is what
 * triggers the follow-up searchCitiesInPrefecture() drill-down instead. */
export function isPrefectureLevel(r: GeocodeResult): boolean {
  return normalizePrefectureName(r.name) in PREFECTURE_CITIES;
}

/** For a prefecture name, looks up a handful of its well-known municipalities (see
 * data/prefectureCities.ts) via the same name search, in parallel, keeping only the match
 * that's actually inside that prefecture (a same-named city elsewhere in Japan is common —
 * e.g. 府中市 exists in both Tokyo and Hiroshima) and de-duplicating by coordinate. */
export async function searchCitiesInPrefecture(prefectureName: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const key = normalizePrefectureName(prefectureName);
  const cityNames = PREFECTURE_CITIES[key] ?? [];
  const settled = await Promise.allSettled(cityNames.map((n) => searchPlaces(n, signal)));

  const out: GeocodeResult[] = [];
  const seen = new Set<string>();
  for (const s of settled) {
    if (s.status !== 'fulfilled') continue;
    const match = s.value.find((r) => normalizePrefectureName(r.admin1 ?? '') === key) ?? s.value[0];
    if (!match) continue;
    const dedupeKey = `${match.lat.toFixed(2)},${match.lon.toFixed(2)}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push(match);
  }
  return out;
}

let knownWaterId = -1;
function knownWaterToResult(w: KnownWater): GeocodeResult {
  return { id: knownWaterId--, name: w.name, admin1: w.pref, lat: w.lat, lon: w.lon };
}

/** The search box's actual entry point: live geocoding plus the small curated lake
 * supplement above, merged with local matches first (this is a fishing app) and
 * de-duplicated by coordinate. Falls back to local-only results if the live API is
 * unreachable, and only surfaces as a hard error when neither has anything. */
export async function searchPlacesAugmented(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const local = searchKnownWaters(query).map(knownWaterToResult);
  let live: GeocodeResult[] = [];
  try {
    live = await searchPlaces(query, signal);
  } catch (err) {
    if (local.length === 0) throw err;
  }
  const seen = new Set<string>();
  const merged: GeocodeResult[] = [];
  for (const r of [...local, ...live]) {
    const key = `${r.lat.toFixed(2)},${r.lon.toFixed(2)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(r);
  }
  return merged;
}
