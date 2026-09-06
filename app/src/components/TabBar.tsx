import type { Tab } from '../types';
import { TAB_SHAPES } from '../data/fieldMeta';

const TABS: { key: Tab; label: string }[] = [
  { key: 'home', label: 'ホーム' },
  { key: 'hours', label: '時間ごと' },
  { key: 'week', label: '週間' },
  { key: 'fish', label: '釣れる魚' },
];

export function TabBar({ tab, onPick }: { tab: Tab; onPick: (t: Tab) => void }) {
  return (
    <div style={{ flex: 'none', display: 'flex', padding: '6px 8px calc(10px + env(safe-area-inset-bottom, 0px))', background: 'rgba(11,20,24,.92)', borderTop: '1px solid rgba(140,190,200,.12)', backdropFilter: 'blur(12px)' }}>
      {TABS.map((t) => {
        const on = tab === t.key;
        const [w, h, r, rot] = TAB_SHAPES[t.key];
        const color = on ? 'var(--amber)' : 'rgba(234,242,244,.38)';
        return (
          <button
            key={t.key}
            onClick={() => onPick(t.key)}
            style={{ flex: 1, cursor: 'pointer', background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '8px 0 4px' }}
          >
            <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: w, height: h, borderRadius: r, background: color, transform: `rotate(${rot})` }} />
            </div>
            <div style={{ font: "500 10px/1 'Zen Kaku Gothic New',sans-serif", color }}>{t.label}</div>
          </button>
        );
      })}
    </div>
  );
}
