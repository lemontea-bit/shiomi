import { clamp, seededRange } from './hash';
import type { WeatherHour } from './weather';

// There is no free, keyless public API for real tide predictions / river gauge flow, so
// this models them from first principles (real semidiurnal tide period + lunar spring/neap
// cycle for the sea; a simple linear-reservoir rainfall→flow model for rivers, driven by
// the *live* precipitation forecast). It's clearly an estimate, same spirit as the
// prototype's authored sample data — never presented as an official tide table or gauge.

const SEMIDIURNAL_HOURS = 12.4206;
const SYNODIC_DAYS = 29.530588;
// A real new moon (2000-01-06 18:14 UTC), used only as a phase anchor for the sine wave.
const NEW_MOON_EPOCH_MS = Date.UTC(2000, 0, 6, 18, 14);

function moonPhaseFrac(t: Date): number {
  const days = (t.getTime() - NEW_MOON_EPOCH_MS) / 86_400_000;
  return ((days % SYNODIC_DAYS) + SYNODIC_DAYS) % SYNODIC_DAYS / SYNODIC_DAYS; // 0..1
}

/** 0 (neap) .. 1 (spring) — peaks twice per lunar month, at new and full moon. */
function springNeapFactor(t: Date): number {
  return Math.abs(Math.cos(moonPhaseFrac(t) * 2 * Math.PI));
}

export function tideLabel(t: Date): string {
  const amp = springNeapFactor(t);
  const ampPrev = springNeapFactor(new Date(t.getTime() - 86_400_000));
  if (amp >= 0.82) return '大潮';
  if (amp >= 0.58) return '中潮';
  if (amp < 0.4) {
    if (Math.abs(amp - ampPrev) < 0.015) return '長潮';
    if (amp > ampPrev) return '若潮';
  }
  return '小潮';
}

/** Normalized tide height, roughly -1..1, at spot-local phase. */
function tideHeightNorm(t: Date, spotSeed: string): number {
  const phase = seededRange(`${spotSeed}:tidephase`, 0, 2 * Math.PI);
  const hours = t.getTime() / 3_600_000;
  return springNeapFactor(t) * Math.sin((2 * Math.PI * hours) / SEMIDIURNAL_HOURS + phase);
}

/** Tide state: is it currently flowing in (満ちてきている) or ebbing, and how fast (0..100). */
export function tideMotion(t: Date, spotSeed: string): { rising: boolean; speedScore: number; heightM: number } {
  const h0 = tideHeightNorm(t, spotSeed);
  const h1 = tideHeightNorm(new Date(t.getTime() + 10 * 60_000), spotSeed);
  const amp = 0.5 + springNeapFactor(t) * 1.3; // meters, flavor only
  return { rising: h1 > h0, speedScore: clamp(Math.abs(h1 - h0) * 4200, 8, 100), heightM: h0 * amp };
}

export function tideCurveToday(spotSeed: string, dayStart: Date): number[] {
  // 13 samples, every 2h across the local day, for the SVG chart.
  return Array.from({ length: 13 }, (_, i) => {
    const t = new Date(dayStart.getTime() + i * 2 * 3_600_000);
    return tideHeightNorm(t, spotSeed);
  });
}

// ---- Lake: near-flat reservoir level, slow week-to-week drift. ----
export function lakeLevelOffsetM(spotSeed: string, t: Date): number {
  const week = Math.floor(t.getTime() / (7 * 86_400_000));
  return seededRange(`${spotSeed}:lvl:${week}`, -0.45, 0.1);
}

export function lakeLevelLabel(offsetM: number): string {
  if (offsetM >= -0.05) return '満水';
  return `減水 ${offsetM.toFixed(1)}m`;
}

// ---- River: simple linear-reservoir rainfall → flow model, fed by live precip. ----
export function riverBaseFlow(spotSeed: string): number {
  return seededRange(`${spotSeed}:flow`, 11, 21);
}

/** hoursAgoToPrecip: array where index 0 = the most recent hour, further back after. */
export function riverFlow(baseFlow: number, hoursAgoToPrecip: number[]): number {
  let extra = 0;
  hoursAgoToPrecip.forEach((mm, i) => {
    extra += mm * 2.6 * Math.exp(-i / 14);
  });
  return baseFlow + extra;
}

export function riverFlowLabel(flow: number, base: number): string {
  const ratio = flow / base;
  if (ratio > 1.9) return `増水 +${(flow - base).toFixed(1)}m³/s`;
  if (ratio > 1.25) return `増水傾向 ${flow.toFixed(1)}m³/s`;
  if (ratio < 0.75) return `渇水気味 ${flow.toFixed(1)}m³/s`;
  return `平水 ${flow.toFixed(1)}m³/s`;
}

/** Builds a "recent hourly rainfall, most-recent-first" array from past+future weather hours
 * relative to a given timestamp, for feeding the river flow model at any point in the forecast. */
export function precipTrailFor(all: WeatherHour[], atIso: string, hoursBack = 36): number[] {
  const atMs = new Date(atIso).getTime();
  const out: number[] = [];
  for (let i = 1; i <= hoursBack; i++) {
    const targetMs = atMs - i * 3_600_000;
    let best: WeatherHour | null = null;
    let bestDiff = Infinity;
    for (const h of all) {
      const diff = Math.abs(new Date(h.iso).getTime() - targetMs);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = h;
      }
    }
    out.push(best ? best.precipMm : 0);
  }
  return out;
}
