export type Field = 'sea' | 'lake' | 'river';
export type Tab = 'home' | 'hours' | 'week' | 'fish';
export type WindUnit = 'm/s' | 'kt' | 'km/h';
export type WxKind = 'sun' | 'pcloud' | 'cloud' | 'rain' | 'storm';

export interface Spot {
  short: string;
  name: string;
  meta: string;
  lat: number;
  lon: number;
  /** Authored per-spot handicap (exposure/access/etc.) — sample flavor, not derived from any API. */
  baseDelta: number;
  headline: string;
}

export interface FishFactor {
  label: string;
  value: number; // 0-100
  note: string;
}

export interface FishSpec {
  name: string;
  en: string;
  prob: number; // baseline sample probability, 0-100
  size: string;
  trend: string;
  chips: string[];
  best: string;
  where: string;
  how: string;
  tackle: string[];
  factors: FishFactor[];
}

export interface FieldMeta {
  label: string;
  chartTitle: string;
  factor3Label: string;
  flowChip: string;
  areaLabel: string;
  extraLabel: string;
  extraUnit: string;
  waterLabel: string;
  waterBaseline: number; // sample baseline water temp / equivalent, deg C
  idealWaterMin: number;
  idealWaterMax: number;
  phrases: [string, string, string];
}

export interface DayTemplate {
  date: string;
  dow: string;
  fishSea: string;
}
