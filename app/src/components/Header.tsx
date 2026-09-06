import type { Spot } from '../types';
import { FIELD_META } from '../data/fieldMeta';
import { formatHeaderTime, useClock } from '../lib/clock';

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flex: 'none' }}>
      <circle cx="8" cy="8" r="6" stroke="rgba(43,32,22,.55)" strokeWidth="1.8" />
      <line x1="12.3" y1="12.3" x2="16.5" y2="16.5" stroke="rgba(43,32,22,.55)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Header({ spot, onOpenSearch }: { spot: Spot; onOpenSearch: () => void }) {
  const now = useClock();

  return (
    <div style={{ padding: '18px 20px 10px', display: 'flex', flexDirection: 'column', gap: 9, flex: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 8px var(--amber-glow)' }} />
        <div style={{ font: "500 11px/1 'JetBrains Mono',monospace", color: 'rgba(43,32,22,.4)' }}>{formatHeaderTime(now)}</div>
      </div>
      <button
        onClick={onOpenSearch}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%', cursor: 'pointer', textAlign: 'left',
          background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 999, padding: '10px 16px',
          boxShadow: '0 1px 3px rgba(43,32,22,.07)',
        }}
      >
        <SearchIcon />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
            <div style={{ font: "700 15px/1.3 'Zen Kaku Gothic New',sans-serif", letterSpacing: '.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spot.name}</div>
            <div style={{ font: "700 9.5px/1 'Zen Kaku Gothic New',sans-serif", color: 'var(--teal)', background: 'rgba(47,133,119,.12)', borderRadius: 99, padding: '3px 7px', flex: 'none' }}>{FIELD_META[spot.kind].label}</div>
          </div>
          <div style={{ font: "400 10.5px/1.2 'JetBrains Mono',monospace", color: 'rgba(43,32,22,.42)', letterSpacing: '.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spot.meta}</div>
        </div>
        <div style={{ font: "400 12px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.35)', flex: 'none' }}>検索</div>
      </button>
    </div>
  );
}
