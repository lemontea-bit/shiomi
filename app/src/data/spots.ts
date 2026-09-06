import type { CustomLocation, Field, Spot } from '../types';

// Ported from the Claude Design prototype (TsuriWeather.dc.html). Names, coordinates and
// per-spot handicaps ("baseDelta") are authored sample content — the numbers Open-Meteo
// actually returns for these coordinates drive the live weather figures on top of this.
export const SPOTS_BY_FIELD: Record<Field, Spot[]> = {
  sea: [
    {
      short: '江ノ島',
      name: '江ノ島・片瀬西浜',
      meta: '35.30N 139.48E ・ 相模湾',
      lat: 35.3,
      lon: 139.48,
      baseDelta: 0,
      headline: '朝まづめ 5:20–7:00 が本命。南寄りの風が上がる正午以降は失速します。',
    },
    {
      short: '城ヶ島',
      name: '三浦・城ヶ島',
      meta: '35.13N 139.61E ・ 相模灘',
      lat: 35.13,
      lon: 139.61,
      baseDelta: -6,
      headline: '潮通しは良好。うねり 1.2m で足場によっては注意が必要です。',
    },
    {
      short: '大黒',
      name: '横浜・大黒海づり',
      meta: '35.46N 139.68E ・ 東京湾',
      lat: 35.46,
      lon: 139.68,
      baseDelta: -12,
      headline: '濁りが強め。上げ潮の 14:00 前後に短時間の食いが期待できます。',
    },
  ],
  lake: [
    {
      short: '芦ノ湖',
      name: '芦ノ湖・湖尻ワンド',
      meta: '35.21N 139.01E ・ 標高 723m',
      lat: 35.21,
      lon: 139.01,
      baseDelta: 0,
      headline: 'ベタ凪で表層は静か。倒木周りの朝一と、風が吹き始める10時前後が勝負。',
    },
    {
      short: '河口湖',
      name: '河口湖・大石ワンド',
      meta: '35.52N 138.75E ・ 標高 833m',
      lat: 35.52,
      lon: 138.75,
      baseDelta: -6,
      headline: '減水でウィードが薄く、魚はブレイクに落ちています。深めを狙うのが得策。',
    },
    {
      short: '山中湖',
      name: '山中湖・平野沖',
      meta: '35.42N 138.87E ・ 標高 981m',
      lat: 35.42,
      lon: 138.87,
      baseDelta: -14,
      headline: '水温が低めで活性は控えめ。日射で温まる午後に一時的なチャンス。',
    },
  ],
  river: [
    {
      short: '相模川',
      name: '相模川・磯部堰下',
      meta: '35.50N 139.36E ・ 中流域',
      lat: 35.5,
      lon: 139.36,
      baseDelta: 0,
      headline: 'ささ濁りで条件は上向き。堰下の流れ込みが朝夕ともに有望です。',
    },
    {
      short: '酒匂川',
      name: '酒匂川・飯泉取水堰',
      meta: '35.30N 139.16E ・ 中流域',
      lat: 35.3,
      lon: 139.16,
      baseDelta: -6,
      headline: '澄み気味で見切られやすい状況。ライトなラインと小さめの餌が有効です。',
    },
    {
      short: '多摩川',
      name: '多摩川・是政橋',
      meta: '35.65N 139.49E ・ 下流域',
      lat: 35.65,
      lon: 139.49,
      baseDelta: -13,
      headline: '前日の雨で流量やや多め。流芯を避け、緩流帯を丁寧に探ってください。',
    },
  ],
};

const CUSTOM_HEADLINE: Record<Field, string> = {
  sea: '検索した地点の周辺海況です。潮位・水温・濁りは実測ではなく推定値としてご覧ください。',
  lake: '検索した地点の湖況です。水位・水温・濁りは実測ではなく推定値としてご覧ください。',
  river: '検索した地点の川況です。水位・流量・濁りは実測ではなく推定値としてご覧ください。',
};

/** Turns a searched place (any 都道府県・市区町村, via lib/geocode.ts) into a Spot so it can
 * slot into the same picker/scoring pipeline as the three curated spots per field. Unlike
 * those, it carries no authored local knowledge — baseDelta stays neutral (0) and the
 * headline says plainly that this is a generic estimate for the searched place. */
export function customLocationToSpot(loc: CustomLocation, field: Field): Spot {
  const admin = [loc.admin1, loc.admin2].filter(Boolean).join(' ');
  return {
    short: loc.name.length > 6 ? `${loc.name.slice(0, 5)}…` : loc.name,
    name: loc.name,
    meta: `${loc.lat.toFixed(2)}N ${loc.lon.toFixed(2)}E${admin ? ` ・ ${admin}` : ''}`,
    lat: loc.lat,
    lon: loc.lon,
    baseDelta: 0,
    headline: CUSTOM_HEADLINE[field],
  };
}
