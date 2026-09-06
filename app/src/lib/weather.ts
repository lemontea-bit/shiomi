import { useEffect, useRef, useState } from 'react';
import { seededRange } from './hash';

export interface Coords {
  lat: number;
  lon: number;
}

export interface WeatherHour {
  iso: string;
  hour: number;
  temp: number;
  pop: number;
  precipMm: number;
  windSpeed: number; // m/s
  windDir: number; // degrees
  pressure: number; // hPa
  code: number; // WMO weather code
}

export interface WeatherDay {
  iso: string;
  tMax: number;
  tMin: number;
  pop: number;
  windMax: number;
  precipSum: number;
  code: number;
}

export interface WeatherCurrent {
  iso: string;
  temp: number;
  precip: number;
  windSpeed: number;
  windDir: number;
  pressure: number;
  code: number;
}

export interface WeatherData {
  source: 'live' | 'simulated';
  timezone: string;
  current: WeatherCurrent;
  /** Forward-looking hours starting at (or just after) "now". */
  hourly: WeatherHour[];
  /** Hours before "now" — used for pressure-trend / recent-rain estimates. */
  pastHourly: WeatherHour[];
  /** 7 days starting today. */
  daily: WeatherDay[];
}

const HOURLY_VARS = 'temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure';
const DAILY_VARS = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,precipitation_sum';
const CURRENT_VARS = 'temperature_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure';

function coordKey(c: Coords) {
  return `${c.lat.toFixed(3)},${c.lon.toFixed(3)}`;
}

async function fetchLive(coords: Coords, signal: AbortSignal): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}` +
    `&current=${CURRENT_VARS}&hourly=${HOURLY_VARS}&daily=${DAILY_VARS}` +
    `&timezone=auto&wind_speed_unit=ms&past_days=1&forecast_days=8`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`open-meteo ${res.status}`);
  const j = await res.json();

  const times: string[] = j.hourly.time;
  const nowIso: string = j.current.time;
  const nowIdx = times.findIndex((t) => t >= nowIso);
  const anchor = nowIdx === -1 ? Math.max(0, times.length - 1) : nowIdx;

  const mkHour = (i: number): WeatherHour => ({
    iso: times[i],
    hour: new Date(times[i]).getHours(),
    temp: j.hourly.temperature_2m[i],
    pop: j.hourly.precipitation_probability[i] ?? 0,
    precipMm: j.hourly.precipitation[i] ?? 0,
    windSpeed: j.hourly.wind_speed_10m[i],
    windDir: j.hourly.wind_direction_10m[i],
    pressure: j.hourly.surface_pressure[i],
    code: j.hourly.weather_code[i],
  });

  const hourly: WeatherHour[] = [];
  for (let i = anchor; i < times.length; i++) hourly.push(mkHour(i));
  const pastHourly: WeatherHour[] = [];
  for (let i = Math.max(0, anchor - 12); i < anchor; i++) pastHourly.push(mkHour(i));

  const days: string[] = j.daily.time;
  const daily: WeatherDay[] = days.map((iso: string, i: number) => ({
    iso,
    tMax: j.daily.temperature_2m_max[i],
    tMin: j.daily.temperature_2m_min[i],
    pop: j.daily.precipitation_probability_max[i] ?? 0,
    windMax: j.daily.wind_speed_10m_max[i],
    precipSum: j.daily.precipitation_sum[i] ?? 0,
    code: j.daily.weather_code[i],
  }));

  return {
    source: 'live',
    timezone: j.timezone,
    current: {
      iso: j.current.time,
      temp: j.current.temperature_2m,
      precip: j.current.precipitation ?? 0,
      windSpeed: j.current.wind_speed_10m,
      windDir: j.current.wind_direction_10m,
      pressure: j.current.surface_pressure,
      code: j.current.weather_code,
    },
    hourly,
    pastHourly,
    daily,
  };
}

/** Deterministic fallback so the app stays fully usable when the live API is
 * unreachable (offline, blocked network, CORS). Seeded by coordinates + date so
 * it doesn't reshuffle on every render, and clearly labelled `source: 'simulated'`. */
function simulateWeather(coords: Coords, now: Date): WeatherData {
  const key = coordKey(coords);
  const baseTemp = seededRange(`${key}:t`, 18, 29);
  const basePressure = seededRange(`${key}:p`, 1006, 1019);
  const baseWind = seededRange(`${key}:w`, 1.5, 5.5);
  const rainSeed = seededRange(`${key}:r`, 0, 1);

  const codeFor = (popVal: number, windVal: number) => {
    if (windVal > 11 || popVal > 80) return 95;
    if (popVal > 55) return 63;
    if (popVal > 30) return 51;
    if (windVal > 6) return 3;
    if (popVal > 12) return 2;
    return 0;
  };

  // A slow-moving synthetic "weather system" so consecutive days actually differ (a plain
  // diurnal sine alone repeats identically every 24h). stormFactor 0..1 tracks a front
  // passing through over the ~8 forecast days; temp/wind/pop/pressure all react to it together.
  const synopticPhase = rainSeed * 12;
  const stormFactor = (hOffset: number) => Math.max(0, Math.sin(hOffset / 58 + synopticPhase * 1.3));

  const mk = (hOffset: number): WeatherHour => {
    const t = new Date(now.getTime() + hOffset * 3600_000);
    const hr = t.getHours() + t.getMinutes() / 60;
    const diurnal = Math.sin(((hr - 9) / 24) * Math.PI * 2);
    const dayWave = Math.sin(hOffset / 34 + synopticPhase) * 2.6 + Math.sin(hOffset / 85 + synopticPhase * 1.7) * 1.6;
    const storm = stormFactor(hOffset);
    const temp = baseTemp + diurnal * 2.8 + dayWave - storm * 2.2;
    const wind = Math.max(0.3, baseWind + Math.sin(hr / 3.2 + rainSeed * 6) * 1.5 + storm * 4.8);
    const pop = Math.round(Math.max(0, Math.min(100, storm * 88 + Math.sin(hOffset / 5) * 10)));
    return {
      iso: t.toISOString(),
      hour: t.getHours(),
      temp: Math.round(temp * 10) / 10,
      pop,
      precipMm: pop > 50 ? Math.round((pop - 50) / 10) * 0.4 : 0,
      windSpeed: Math.round(wind * 10) / 10,
      windDir: Math.round((seededRange(`${key}:d${Math.floor(hOffset / 6)}`, 0, 360) + hOffset) % 360),
      pressure: Math.round((basePressure - storm * 7 + Math.sin(hOffset / 9) * 1.2) * 10) / 10,
      code: codeFor(pop, wind),
    };
  };

  const hourly = Array.from({ length: 30 }, (_, i) => mk(i));
  const pastHourly = Array.from({ length: 12 }, (_, i) => mk(-12 + i));

  const daily: WeatherDay[] = Array.from({ length: 7 }, (_, d) => {
    const hrs = Array.from({ length: 24 }, (_, h) => mk(d * 24 + h));
    return {
      iso: new Date(now.getTime() + d * 86400_000).toISOString().slice(0, 10),
      tMax: Math.round(Math.max(...hrs.map((h) => h.temp))),
      tMin: Math.round(Math.min(...hrs.map((h) => h.temp))),
      pop: Math.round(Math.max(...hrs.map((h) => h.pop))),
      windMax: Math.round(Math.max(...hrs.map((h) => h.windSpeed)) * 10) / 10,
      precipSum: Math.round(hrs.reduce((s, h) => s + h.precipMm, 0) * 10) / 10,
      code: hrs[Math.min(13, hrs.length - 1)].code,
    };
  });

  const nowHour = mk(0);
  return {
    source: 'simulated',
    timezone: 'Asia/Tokyo',
    current: {
      iso: nowHour.iso,
      temp: nowHour.temp,
      precip: nowHour.precipMm,
      windSpeed: nowHour.windSpeed,
      windDir: nowHour.windDir,
      pressure: nowHour.pressure,
      code: nowHour.code,
    },
    hourly,
    pastHourly,
    daily,
  };
}

export type WeatherStatus = 'loading' | 'live' | 'simulated';

export function useWeather(coords: Coords) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<WeatherStatus>('loading');
  const cache = useRef(new Map<string, WeatherData>());

  useEffect(() => {
    const key = coordKey(coords);
    const cached = cache.current.get(key);
    if (cached) {
      setData(cached);
      setStatus(cached.source);
      return;
    }
    // `cancelled` (not the AbortController) is what gates the fallback: cleanup aborts the
    // fetch AND sets `cancelled` so we skip state updates on a stale/unmounted effect, while
    // our own watchdog timeout also aborts the fetch but leaves `cancelled` false so a hung
    // or silently-blocked request (e.g. a sandboxed host with no network access) still falls
    // through to the simulated forecast instead of leaving the app stuck on "loading" forever.
    let cancelled = false;
    const controller = new AbortController();
    const watchdog = setTimeout(() => controller.abort(), 7000);
    setStatus('loading');
    fetchLive(coords, controller.signal)
      .then((d) => {
        if (cancelled) return;
        cache.current.set(key, d);
        setData(d);
        setStatus('live');
      })
      .catch((err) => {
        if (cancelled) return;
        const d = simulateWeather(coords, new Date());
        cache.current.set(key, d);
        setData(d);
        setStatus('simulated');
        // eslint-disable-next-line no-console
        console.warn('[shiomi] live weather unavailable, using simulated fallback:', err);
      })
      .finally(() => clearTimeout(watchdog));
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(watchdog);
    };
    // Depend on the primitive lat/lon, not `coords` itself — callers pass a fresh object
    // literal each render, which would otherwise refetch every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords.lat, coords.lon]);

  return { data, status };
}
