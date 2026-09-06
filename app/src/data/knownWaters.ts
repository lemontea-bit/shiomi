export interface KnownWater {
  name: string;
  pref: string;
  lat: number;
  lon: number;
}

// A small hand-authored supplement of well-known Japanese lakes — added because
// Open-Meteo's geocoding API (backed by a general place-name gazetteer) doesn't reliably
// index smaller natural features like crater lakes, even when they're well-known fishing
// destinations (e.g. 赤城大沼, 榛名湖). Not remotely exhaustive — just the ones an angler is
// likely to search for that the general search tends to miss.
export const KNOWN_WATERS: KnownWater[] = [
  { name: '赤城大沼', pref: '群馬県', lat: 36.556, lon: 139.192 },
  { name: '榛名湖', pref: '群馬県', lat: 36.474, lon: 138.851 },
  { name: '琵琶湖', pref: '滋賀県', lat: 35.3, lon: 136.17 },
  { name: '中禅寺湖', pref: '栃木県', lat: 36.737, lon: 139.483 },
  { name: '猪苗代湖', pref: '福島県', lat: 37.5, lon: 140.1 },
  { name: '洞爺湖', pref: '北海道', lat: 42.583, lon: 140.833 },
  { name: '支笏湖', pref: '北海道', lat: 42.767, lon: 141.333 },
  { name: '屈斜路湖', pref: '北海道', lat: 43.6, lon: 144.35 },
  { name: '摩周湖', pref: '北海道', lat: 43.583, lon: 144.567 },
  { name: '十和田湖', pref: '青森県・秋田県', lat: 40.467, lon: 140.883 },
  { name: '田沢湖', pref: '秋田県', lat: 39.717, lon: 140.667 },
  { name: '諏訪湖', pref: '長野県', lat: 36.048, lon: 138.108 },
  { name: '浜名湖', pref: '静岡県', lat: 34.733, lon: 137.6 },
  { name: '宍道湖', pref: '島根県', lat: 35.45, lon: 132.9 },
  { name: '霞ヶ浦', pref: '茨城県', lat: 36.017, lon: 140.4 },
  { name: '印旛沼', pref: '千葉県', lat: 35.767, lon: 140.233 },
  { name: '手賀沼', pref: '千葉県', lat: 35.85, lon: 140.05 },
  { name: '中善寺湖', pref: '栃木県', lat: 36.737, lon: 139.483 }, // common misspelling of 中禅寺湖
];

export function searchKnownWaters(query: string): KnownWater[] {
  const q = query.trim();
  if (!q) return [];
  return KNOWN_WATERS.filter((w) => w.name.includes(q) || q.includes(w.name));
}
