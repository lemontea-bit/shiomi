import type { CustomLocation, Spot } from '../types';

// Ported from the Claude Design prototype (TsuriWeather.dc.html). Names, coordinates and
// per-spot handicaps ("baseDelta") are authored sample content — the numbers Open-Meteo
// actually returns for these coordinates drive the live weather figures on top of this.
//
// One flat seed list, not one per field: a spot is just a place. 海/湖/川 is purely which
// scoring lens (tide vs. level vs. flow model, which species list) you're viewing it
// through — switching it never changes which spot is selected. The spot's descriptive
// "headline" is generated from that lens at view-time (lib/engine.ts's detailPhrase)
// rather than stored here, since it no longer belongs to the place itself.
export const SEED_SPOTS: Spot[] = [
  {
    short: '江ノ島',
    name: '江ノ島・片瀬西浜',
    meta: '35.30N 139.48E ・ 相模湾',
    lat: 35.3,
    lon: 139.48,
    baseDelta: 0,
  },
  {
    short: '城ヶ島',
    name: '三浦・城ヶ島',
    meta: '35.13N 139.61E ・ 相模灘',
    lat: 35.13,
    lon: 139.61,
    baseDelta: -6,
  },
  {
    short: '大黒',
    name: '横浜・大黒海づり',
    meta: '35.46N 139.68E ・ 東京湾',
    lat: 35.46,
    lon: 139.68,
    baseDelta: -12,
  },
];

/** Turns a searched place (any 都道府県・市区町村, via lib/geocode.ts) into a Spot so it can
 * slot into the same picker/scoring pipeline as the seed spots. It carries no authored
 * local knowledge — baseDelta stays neutral (0). */
export function customLocationToSpot(loc: CustomLocation): Spot {
  const admin = [loc.admin1, loc.admin2].filter(Boolean).join(' ');
  return {
    short: loc.name.length > 6 ? `${loc.name.slice(0, 5)}…` : loc.name,
    name: loc.name,
    meta: `${loc.lat.toFixed(2)}N ${loc.lon.toFixed(2)}E${admin ? ` ・ ${admin}` : ''}`,
    lat: loc.lat,
    lon: loc.lon,
    baseDelta: 0,
  };
}
