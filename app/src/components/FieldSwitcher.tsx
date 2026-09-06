import type { Field } from '../types';
import { FIELD_META } from '../data/fieldMeta';

const ORDER: Field[] = ['sea', 'lake', 'river'];

export function FieldSwitcher({ field, onPick }: { field: Field; onPick: (f: Field) => void }) {
  return (
    <div style={{ flex: 'none', padding: '4px 20px 12px' }}>
      <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 12, background: 'rgba(43,32,22,.05)', border: '1px solid rgba(43,32,22,.12)' }}>
        {ORDER.map((k) => {
          const on = field === k;
          return (
            <button
              key={k}
              onClick={() => onPick(k)}
              style={{
                flex: 1, cursor: 'pointer', textAlign: 'center', padding: '8px 0', borderRadius: 9, border: 'none',
                background: on ? 'var(--amber)' : 'transparent', color: on ? '#F6EEDF' : 'rgba(43,32,22,.55)',
                font: "700 12px/1 'Zen Kaku Gothic New',sans-serif",
              }}
            >
              {FIELD_META[k].label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
