import type { Spot } from '../types';
import type { GeoStatus } from '../lib/geo';
import { formatHeaderTime, useClock } from '../lib/clock';

export function Header({ spot, geoStatus }: { spot: Spot; geoStatus: GeoStatus }) {
  const now = useClock();
  const gps = geoStatus === 'granted' ? { text: 'GPS 更新済', color: 'var(--teal)' } : geoStatus === 'locating' ? { text: '位置情報 取得中…', color: 'rgba(234,242,244,.4)' } : { text: 'サンプル位置', color: 'rgba(234,242,244,.4)' };

  return (
    <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flex: 'none' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 8px var(--amber-glow)' }} />
          <div style={{ font: "700 17px/1.2 'Zen Kaku Gothic New',sans-serif", letterSpacing: '.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spot.name}</div>
        </div>
        <div style={{ font: "400 11px/1.3 'JetBrains Mono',monospace", color: 'rgba(234,242,244,.45)', letterSpacing: '.04em' }}>{spot.meta}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flex: 'none' }}>
        <div style={{ font: "500 11px/1 'JetBrains Mono',monospace", color: 'rgba(234,242,244,.4)' }}>{formatHeaderTime(now)}</div>
        <div style={{ font: "500 10px/1 'JetBrains Mono',monospace", color: gps.color, letterSpacing: '.08em' }}>{gps.text}</div>
      </div>
    </div>
  );
}
