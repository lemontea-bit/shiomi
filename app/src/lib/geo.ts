import { useEffect, useState } from 'react';

export interface Coords {
  lat: number;
  lon: number;
}

/** Great-circle distance in km. */
export function distanceKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function nearestIndex(from: Coords, spots: Coords[]): number {
  let best = 0;
  let bestD = Infinity;
  spots.forEach((s, i) => {
    const d = distanceKm(from, s);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

export type GeoStatus = 'locating' | 'granted' | 'denied' | 'unsupported';

/** Requests the browser's geolocation once. Falls back silently (status becomes
 * 'denied'/'unsupported') so the app always has *a* coordinate to work with. */
export function useGeolocation(fallback: Coords) {
  const [state, setState] = useState<{ status: GeoStatus; coords: Coords }>({
    status: 'locating',
    coords: fallback,
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'unsupported', coords: fallback });
      return;
    }
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setState({ status: 'granted', coords: { lat: pos.coords.latitude, lon: pos.coords.longitude } });
      },
      () => {
        if (cancelled) return;
        setState({ status: 'denied', coords: fallback });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
