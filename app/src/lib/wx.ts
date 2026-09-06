import type { WindUnit, WxKind } from '../types';

/** WMO weather code → the 5 icon kinds the WxIcon component knows how to draw. */
export function wmoToKind(code: number): WxKind {
  if (code === 0 || code === 1) return 'sun';
  if (code === 2) return 'pcloud';
  if (code === 3 || code === 45 || code === 48) return 'cloud';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'cloud';
  if ([95, 96, 99].includes(code)) return 'storm';
  return 'cloud';
}

export function wmoLabel(code: number): string {
  if (code === 0) return '快晴';
  if (code === 1) return '晴れ';
  if (code === 2) return '晴れ時々曇り';
  if (code === 3) return '曇り';
  if (code === 45 || code === 48) return '霧';
  if ([51, 53, 55, 56, 57].includes(code)) return '小雨';
  if ([61, 63, 65, 66, 67].includes(code)) return '雨';
  if ([80, 81, 82].includes(code)) return 'にわか雨';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '雪';
  if ([95, 96, 99].includes(code)) return '雷雨';
  return '曇り';
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
export function degToCompass(deg: number): string {
  const idx = Math.round(((deg % 360) + 360) % 360 / 45) % 8;
  return COMPASS[idx];
}

export function windNumber(v: number, unit: WindUnit): string {
  if (unit === 'kt') return (v * 1.943844).toFixed(1);
  if (unit === 'km/h') return (v * 3.6).toFixed(0);
  return v.toFixed(1);
}

export function windFull(v: number, unit: WindUnit): string {
  return `${windNumber(v, unit)}${unit}`;
}
