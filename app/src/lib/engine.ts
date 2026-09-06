import type { Field, FishSpec, Spot, WindUnit, WxKind } from '../types';
import { FIELD_META, FIELD_FLOW } from '../data/fieldMeta';
import { FISH_BY_FIELD } from '../data/fish';
import { bellScore, clamp } from './hash';
import { degToCompass, windFull, windNumber, wmoLabel, wmoToKind } from './wx';
import type { WeatherData, WeatherHour } from './weather';
import {
  lakeLevelLabel,
  lakeLevelOffsetM,
  precipTrailFor,
  riverBaseFlow,
  riverFlow,
  riverFlowLabel,
  tideLabel,
  tideMotion,
  tideCurveToday,
} from './tide';

const WEIGHTS = { water: 0.22, factor3: 0.26, pressure: 0.16, wind: 0.21, turbidity: 0.15 };

export function scoreColor(v: number): string {
  return v >= 70 ? 'var(--amber)' : v >= 50 ? 'var(--teal)' : 'var(--dim)';
}

export function scoreGrade(v: number): string {
  if (v >= 75) return '好';
  if (v >= 58) return '良';
  if (v >= 38) return '並';
  return '注意';
}

interface FiveFactors {
  water: number;
  factor3: number;
  pressure: number;
  wind: number;
  turbidity: number;
}

function combine(f: FiveFactors): number {
  return f.water * WEIGHTS.water + f.factor3 * WEIGHTS.factor3 + f.pressure * WEIGHTS.pressure + f.wind * WEIGHTS.wind + f.turbidity * WEIGHTS.turbidity;
}

const NEUTRAL_REFERENCE = combine({ water: 88, factor3: 75, pressure: 83, wind: 88, turbidity: 78 });

function pressureScore(trendHpa: number): number {
  return bellScore(trendHpa, -1.2, 2.3);
}
function windScore(ms: number): number {
  const s = bellScore(ms, 2.6, 2.4);
  return ms > 12 ? Math.min(s, 15) : s;
}
function waterScore(field: Field, airTemp: number): { score: number; waterTemp: number } {
  const m = FIELD_META[field];
  const waterTemp = clamp(m.waterBaseline + (airTemp - 27) * 0.15, m.waterBaseline - 3, m.waterBaseline + 3);
  const center = (m.idealWaterMin + m.idealWaterMax) / 2;
  const width = (m.idealWaterMax - m.idealWaterMin) / 2 + 2.5;
  return { score: bellScore(waterTemp, center, width), waterTemp };
}
function turbidityScore(field: Field, recentRainMm: number): { score: number; level: number; label: string } {
  const baseClear = field === 'river' ? 30 : field === 'lake' ? 15 : 25;
  const level = clamp(baseClear + recentRainMm * 6, 5, 95);
  const score = bellScore(level, 45, 28);
  const label = level < 22 ? '澄み' : level < 40 ? '弱' : level < 62 ? 'ささ濁り' : '強め';
  return { score, level, label };
}
function waveHeightM(windMs: number): number {
  return Math.round(0.09 * Math.pow(windMs, 1.5) * 10) / 10;
}

export interface FactorRow {
  label: string;
  value: number;
  note: string;
}
export interface NowStat {
  label: string;
  value: string;
  unit: string;
  note: string;
  noteColor: string;
}
export interface WindowSlot {
  day: string;
  time: string;
  score: number;
  tag: string;
}
export interface HourRowData {
  iso: string;
  time: string;
  icon: WxKind;
  temp: string;
  pop: number;
  dir: string;
  wind: string;
  score: number;
  hazard: boolean;
  detail: string;
  chips: { text: string; fg: string; bg: string }[];
}
export interface DayRowData {
  iso: string;
  date: string;
  dow: string;
  icon: WxKind;
  hi: string;
  lo: string;
  pop: number;
  wind: string;
  tide: string;
  score: number;
  best: string;
  fish: string;
  note: string;
  hazard: boolean;
}

export interface Snapshot {
  heroScore: number;
  grade: string;
  tideStateLabel: string;
  headline: string;
  hazard: boolean;
  factors: FactorRow[];
  nowStats: NowStat[];
  windows: WindowSlot[];
  weatherLabel: string;
  weatherKind: WxKind;
  cond: string;
  hours: HourRowData[];
  days: DayRowData[];
  tideChart: { points: number[]; nowFrac: number; title: string; sub: string; meta: string };
  liveDelta: number;
  weatherSource: WeatherData['source'];
}

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function fmtHM(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function fmtMD(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
function sameLocalDate(iso: string, ref: Date, dayOffset: number): boolean {
  const d = new Date(iso);
  const target = new Date(ref);
  target.setDate(target.getDate() + dayOffset);
  return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth() && d.getDate() === target.getDate();
}

function fieldFactor3(
  field: Field,
  spotSeed: string,
  at: Date,
  allHours: WeatherHour[],
  atIso: string
): { score: number; label: string } {
  if (field === 'sea') {
    const motion = tideMotion(at, spotSeed);
    return { score: motion.speedScore, label: `${tideLabel(at)} / ${motion.rising ? '上げ' : '下げ'}` };
  }
  if (field === 'lake') {
    const offset = lakeLevelOffsetM(spotSeed, at);
    return { score: clamp(100 - Math.abs(offset) * 180, 10, 96), label: lakeLevelLabel(offset) };
  }
  const base = riverBaseFlow(spotSeed);
  const trail = precipTrailFor(allHours, atIso, 48);
  const flow = riverFlow(base, trail);
  const ratio = flow / base;
  return { score: bellScore(ratio, 1.15, 0.55), label: riverFlowLabel(flow, base) };
}

function pressureTrendAt(all: WeatherHour[], iso: string): number {
  const t = new Date(iso).getTime();
  let cur: WeatherHour | null = null;
  let past: WeatherHour | null = null;
  let curDiff = Infinity;
  let pastDiff = Infinity;
  for (const h of all) {
    const ht = new Date(h.iso).getTime();
    const d = Math.abs(ht - t);
    if (d < curDiff) {
      curDiff = d;
      cur = h;
    }
    const d2 = Math.abs(ht - (t - 3 * 3_600_000));
    if (d2 < pastDiff) {
      pastDiff = d2;
      past = h;
    }
  }
  if (!cur || !past) return 0;
  return cur.pressure - past.pressure;
}

function detailPhrase(field: Field, score: number): string {
  const p = FIELD_META[field].phrases;
  return score >= 70 ? p[0] : score >= 45 ? p[1] : p[2];
}

export function buildSnapshot(params: {
  field: Field;
  spot: Spot;
  weather: WeatherData;
  windUnit: WindUnit;
  now: Date;
}): Snapshot {
  const { field, spot, weather, windUnit, now } = params;
  const m = FIELD_META[field];
  const spotSeed = `${field}:${spot.short}`;
  const allHours = [...weather.pastHourly, ...weather.hourly];
  const nowIso = weather.current.iso;

  const curPressureTrend = pressureTrendAt(allHours, nowIso);
  const { score: wScore, waterTemp } = waterScore(field, weather.current.temp);
  const recentRainTrail = precipTrailFor(allHours, nowIso, 12);
  const recentRain = recentRainTrail.reduce((a, b) => a + b, 0);
  const { score: turbScore, label: turbLabel } = turbidityScore(field, recentRain);
  const factor3Now = fieldFactor3(field, spotSeed, now, allHours, nowIso);

  const factorsNow: FiveFactors = {
    water: wScore,
    factor3: factor3Now.score,
    pressure: pressureScore(curPressureTrend),
    wind: windScore(weather.current.windSpeed),
    turbidity: turbScore,
  };
  const rawScore = combine(factorsNow);
  const liveDelta = rawScore - NEUTRAL_REFERENCE;
  const heroScore = clamp(Math.round(rawScore + spot.baseDelta), 5, 99);

  const windSafety = weather.current.windSpeed > 12 || [95, 96, 99].includes(weather.current.code);
  const headline = windSafety
    ? '強風・荒天の予測です。安全のため釣行は見合わせを検討してください。'
    : spot.headline;

  const factors: FactorRow[] = [
    { label: '水温', value: Math.round(factorsNow.water), note: `${waterTemp.toFixed(1)}℃` },
    { label: m.factor3Label, value: Math.round(factorsNow.factor3), note: factor3Now.label },
    { label: '気圧', value: Math.round(factorsNow.pressure), note: `${Math.round(weather.current.pressure)}hPa` },
    { label: '風速', value: Math.round(factorsNow.wind), note: windFull(weather.current.windSpeed, windUnit) },
    { label: '濁り', value: Math.round(factorsNow.turbidity), note: turbLabel },
  ];

  const pressTrendNote = `${curPressureTrend >= 0 ? '↗ 上昇' : '↘ 下降'} ${curPressureTrend >= 0 ? '+' : ''}${curPressureTrend.toFixed(1)}`;
  const windDesc = weather.current.windSpeed < 2 ? '穏やか' : weather.current.windSpeed < 5.5 ? '適度' : weather.current.windSpeed < 8.5 ? 'やや強い' : '強い';
  const extraValue = field === 'river' ? riverFlow(riverBaseFlow(spotSeed), precipTrailFor(allHours, nowIso, 48)).toFixed(1) : field === 'sea' ? waveHeightM(weather.current.windSpeed).toFixed(1) : Math.min(1.2, waveHeightM(weather.current.windSpeed)).toFixed(1);

  const nowStats: NowStat[] = [
    { label: 'TEMP', value: Math.round(weather.current.temp).toString(), unit: '℃', note: `体感 ${Math.round(weather.current.temp + (weather.current.windSpeed > 4 ? -1 : 1))}`, noteColor: 'rgba(43,32,22,.4)' },
    { label: 'RAIN', value: (weather.hourly[0]?.pop ?? 0).toString(), unit: '%', note: weather.current.precip > 0 ? '降水あり' : (weather.hourly[0]?.pop ?? 0) >= 50 ? '雨の可能性' : '無降水', noteColor: 'rgba(43,32,22,.4)' },
    { label: 'WIND', value: windNumber(weather.current.windSpeed, windUnit), unit: windUnit, note: `${degToCompass(weather.current.windDir)} ・ ${windDesc}`, noteColor: weather.current.windSpeed < 5.5 ? 'var(--teal)' : 'var(--danger)' },
    { label: 'PRESS', value: Math.round(weather.current.pressure).toString(), unit: 'hPa', note: pressTrendNote, noteColor: 'rgba(43,32,22,.4)' },
    { label: m.extraLabel, value: extraValue, unit: m.extraUnit, note: field === 'sea' ? '推定' : field === 'lake' ? '推定' : riverFlowLabel(riverBaseFlow(spotSeed), riverBaseFlow(spotSeed)).split(' ')[0], noteColor: 'var(--teal)' },
    { label: m.waterLabel, value: waterTemp.toFixed(1), unit: '℃', note: `平年 ${waterTemp >= m.waterBaseline ? '+' : ''}${(waterTemp - m.waterBaseline).toFixed(1)}`, noteColor: 'var(--amber)' },
  ];

  // ---- hourly rows ----
  const hours: HourRowData[] = weather.hourly.slice(0, 18).map((h) => {
    const trend = pressureTrendAt(allHours, h.iso);
    const f3 = fieldFactor3(field, spotSeed, new Date(h.iso), allHours, h.iso);
    const rain = precipTrailFor(allHours, h.iso, 12).reduce((a, b) => a + b, 0);
    const { score: turb } = turbidityScore(field, rain);
    const { score: wtr, waterTemp: wt } = waterScore(field, h.temp);
    const fac: FiveFactors = { water: wtr, factor3: f3.score, pressure: pressureScore(trend), wind: windScore(h.windSpeed), turbidity: turb };
    const score = clamp(Math.round(combine(fac) + spot.baseDelta), 5, 99);
    const hazard = h.windSpeed > 12 || [95, 96, 99].includes(h.code);
    const flow = FIELD_FLOW[field];
    const rising = field === 'sea' ? tideMotion(new Date(h.iso), spotSeed).rising : true;
    return {
      iso: h.iso,
      time: fmtHM(h.iso),
      icon: wmoToKind(h.code),
      temp: `${Math.round(h.temp)}°`,
      pop: h.pop,
      dir: degToCompass(h.windDir),
      wind: windFull(h.windSpeed, windUnit),
      score,
      hazard,
      detail: hazard
        ? `釣果 ${score}。荒天警戒 — 風 ${windFull(h.windSpeed, windUnit)}、降水確率 ${h.pop}%。安全のため釣行は避けてください。`
        : `釣果 ${score}。水温 ${wt.toFixed(1)}℃、${degToCompass(h.windDir)}の風 ${windFull(h.windSpeed, windUnit)}、降水確率 ${h.pop}%。${detailPhrase(field, score)}`,
      chips: [
        { text: `${m.flowChip} ${rising ? flow.a : flow.b}`, fg: 'var(--teal)', bg: 'rgba(47,133,119,.1)' },
        { text: h.windSpeed >= 5.5 ? '風 強い' : '風 穏やか', fg: h.windSpeed >= 5.5 ? 'var(--danger)' : 'rgba(43,32,22,.7)', bg: 'rgba(43,32,22,.05)' },
        { text: hazard ? '見合わせ' : score >= 70 ? '狙い目' : '様子見', fg: hazard ? 'var(--danger)' : score >= 70 ? 'var(--amber)' : 'rgba(43,32,22,.55)', bg: hazard ? 'rgba(196,67,46,.14)' : score >= 70 ? 'rgba(217,130,42,.12)' : 'rgba(43,32,22,.05)' },
      ],
    };
  });

  // ---- windows: next 3 upcoming good-condition slots ----
  const slotDefs: { offset: number; start: number; end: number; tag: string }[] = [
    { offset: 0, start: 4, end: 9, tag: '朝まづめ' },
    { offset: 0, start: 16, end: 21, tag: '夕まづめ' },
    { offset: 1, start: 4, end: 9, tag: '朝まづめ' },
    { offset: 1, start: 16, end: 21, tag: '夕まづめ' },
    { offset: 2, start: 4, end: 9, tag: '朝まづめ' },
  ];
  const windows: WindowSlot[] = [];
  for (const s of slotDefs) {
    if (windows.length >= 3) break;
    const target = new Date(now);
    target.setDate(target.getDate() + s.offset);
    // skip a slot that has already fully elapsed today
    if (s.offset === 0 && now.getHours() >= s.end) continue;
    const inRange = hours.filter((h) => sameLocalDate(h.iso, now, s.offset) && new Date(h.iso).getHours() >= s.start && new Date(h.iso).getHours() < s.end);
    if (inRange.length === 0) continue;
    const peak = inRange.reduce((a, b) => (b.score > a.score ? b : a));
    const peakHour = new Date(peak.iso).getHours();
    const lo = Math.max(s.start, peakHour - 1);
    const hi = Math.min(s.end, peakHour + 1);
    windows.push({
      day: s.offset === 0 ? 'TODAY' : s.offset === 1 ? 'TOMORROW' : DOW[target.getDay()],
      time: `${String(lo).padStart(2, '0')}:00–${String(hi).padStart(2, '0')}:00`,
      score: peak.score,
      tag: peak.hazard ? '荒天注意' : s.tag,
    });
  }

  const topFishLabel = FISH_BY_FIELD[field]
    .slice()
    .sort((a, b) => b.prob - a.prob)
    .slice(0, 3)
    .map((f) => f.name)
    .join('・');

  // ---- daily rows ----
  const days: DayRowData[] = weather.daily.slice(0, 7).map((d) => {
    const noonIso = `${d.iso}T12:00:00`;
    const noon = new Date(noonIso);
    const inHourly = weather.hourly.filter((h) => h.iso.slice(0, 10) === d.iso);
    const avgWind = inHourly.length ? inHourly.reduce((a, h) => a + h.windSpeed, 0) / inHourly.length : d.windMax * 0.55;
    const trend = inHourly.length >= 2 ? inHourly[inHourly.length - 1].pressure - inHourly[0].pressure : 0;
    const f3 = fieldFactor3(field, spotSeed, noon, allHours, noonIso);
    const rainTrail = inHourly.length ? precipTrailFor(allHours, `${d.iso}T23:00:00`, 24) : Array(24).fill(d.precipSum / 24);
    const rain = rainTrail.reduce((a, b) => a + b, 0);
    const { score: turb, label: turbLabelDay } = turbidityScore(field, rain);
    const { score: wtr, waterTemp: wt } = waterScore(field, (d.tMax + d.tMin) / 2);
    const fac: FiveFactors = { water: wtr, factor3: f3.score, pressure: pressureScore(trend), wind: windScore(avgWind), turbidity: turb };
    const hazard = d.windMax > 13 || ([95, 96, 99].includes(d.code) && d.pop > 60);
    const score = hazard ? clamp(Math.round(combine(fac) + spot.baseDelta) - 25, 5, 40) : clamp(Math.round(combine(fac) + spot.baseDelta), 5, 99);

    let best = '見合わせ推奨';
    if (!hazard) {
      const morning = inHourly.filter((h) => h.hour >= 4 && h.hour < 9);
      const evening = inHourly.filter((h) => h.hour >= 16 && h.hour < 21);
      const pickBest = (arr: WeatherHour[], lo0: number, hi0: number) => {
        if (!arr.length) return null;
        const peakH = arr[0].hour;
        return `${String(Math.max(lo0, peakH - 1)).padStart(2, '0')}:00–${String(Math.min(hi0, peakH + 1)).padStart(2, '0')}:00`;
      };
      best = pickBest(morning, 4, 9) || pickBest(evening, 16, 21) || (field === 'sea' ? tideLabel(noon) : '終日');
    }

    return {
      iso: d.iso,
      date: fmtMD(d.iso),
      dow: DOW[new Date(`${d.iso}T00:00:00`).getDay()],
      icon: wmoToKind(d.code),
      hi: `${Math.round(d.tMax)}°`,
      lo: `${Math.round(d.tMin)}°`,
      pop: Math.round(d.pop),
      wind: windFull(avgWind, windUnit),
      tide: field === 'sea' ? tideLabel(noon) : field === 'lake' ? lakeLevelLabel(lakeLevelOffsetM(spotSeed, noon)) : riverFlowLabel(riverFlow(riverBaseFlow(spotSeed), rainTrail), riverBaseFlow(spotSeed)),
      score,
      best,
      fish: score <= 25 || hazard ? '—' : topFishLabel,
      note: hazard ? '悪天候の接近が予測されます。増水・強風に注意し、無理な釣行は控えてください。' : `水温 ${wt.toFixed(1)}℃・濁り ${turbLabelDay}。${detailPhrase(field, score)}`,
      hazard,
    };
  });

  const chartPoints = tideCurveToday(spotSeed, new Date(new Date(now).setHours(0, 0, 0, 0)));
  const nowFrac = (now.getHours() + now.getMinutes() / 60) / 24;

  return {
    heroScore,
    grade: windSafety ? '注意' : scoreGrade(heroScore),
    tideStateLabel: field === 'sea' ? `${tideLabel(now)} / ${factor3Now.label.split(' / ')[1] ?? ''}` : factor3Now.label,
    headline,
    hazard: windSafety,
    factors,
    nowStats,
    windows,
    weatherLabel: wmoLabel(weather.current.code),
    weatherKind: wmoToKind(weather.current.code),
    cond: `水温 ${waterTemp.toFixed(1)}℃・濁り ${turbLabel}・${factor3Now.label}`,
    hours,
    days,
    tideChart: {
      points: chartPoints,
      nowFrac,
      title: m.chartTitle,
      sub: field === 'sea' ? tideLabel(now) : field === 'lake' ? lakeLevelLabel(lakeLevelOffsetM(spotSeed, now)) : riverFlowLabel(riverFlow(riverBaseFlow(spotSeed), precipTrailFor(allHours, nowIso, 48)), riverBaseFlow(spotSeed)),
      meta:
        field === 'sea'
          ? `推定満潮・干潮は水域により異なります（概算）`
          : field === 'lake'
          ? `水位 ${lakeLevelOffsetM(spotSeed, now) >= 0 ? '+' : ''}${lakeLevelOffsetM(spotSeed, now).toFixed(2)}m / 風波 ${waveHeightM(weather.current.windSpeed).toFixed(1)}m`
          : `流量 ${riverFlow(riverBaseFlow(spotSeed), precipTrailFor(allHours, nowIso, 48)).toFixed(1)}m³/s`,
    },
    liveDelta,
    weatherSource: weather.source,
  };
}

export interface AdjustedFish extends FishSpec {
  prob: number;
  pct: string;
  color: string;
  tint: string;
}

/** Nudges each species' authored sample probability by the live/estimated condition
 * delta for the current spot, then re-sorts by probability (highest first). */
export function adjustFish(field: Field, liveDelta: number): AdjustedFish[] {
  return FISH_BY_FIELD[field]
    .map((f) => {
      const prob = clamp(Math.round(f.prob + liveDelta * 0.5), 4, 97);
      return { ...f, prob, pct: `${prob}%`, color: scoreColor(prob), tint: prob >= 70 ? 'rgba(217,130,42,.14)' : prob >= 50 ? 'rgba(47,133,119,.12)' : 'rgba(43,32,22,.05)' };
    })
    .sort((a, b) => b.prob - a.prob);
}
