import { useEffect, useState } from 'react';

const DOW_JA = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function useClock(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function formatHeaderTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${DOW_JA[d.getDay()]} ${hh}:${mm}`;
}
