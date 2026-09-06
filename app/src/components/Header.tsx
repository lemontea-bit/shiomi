import type { Spot } from '../types';
import { formatHeaderTime, useClock } from '../lib/clock';

export function Header({ spot, onOpenSearch }: { spot: Spot; onOpenSearch: () => void }) {
  const now = useClock();

  return (
    <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flex: 'none' }}>
      <button onClick={onOpenSearch} style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0, cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 8px var(--amber-glow)', flex: 'none' }} />
          <div style={{ font: "700 17px/1.2 'Zen Kaku Gothic New',sans-serif", letterSpacing: '.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spot.name}</div>
          <div style={{ font: "400 12px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(234,242,244,.35)', flex: 'none' }}>▾</div>
        </div>
        <div style={{ font: "400 11px/1.3 'JetBrains Mono',monospace", color: 'rgba(234,242,244,.45)', letterSpacing: '.04em' }}>{spot.meta}</div>
      </button>
      <div style={{ font: "500 11px/1 'JetBrains Mono',monospace", color: 'rgba(234,242,244,.4)', flex: 'none', paddingTop: 2 }}>{formatHeaderTime(now)}</div>
    </div>
  );
}
