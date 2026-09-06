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
