import type { Spot } from '../types';
import { FIELD_META } from '../data/fieldMeta';

export function SpotPicker({
  spots,
  active,
  scores,
  onPick,
  onRemove,
}: {
  spots: Spot[];
  active: number;
  scores: number[];
  onPick: (i: number) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {spots.map((s, i) => {
        const on = i === active;
        return (
          <div key={`${i}-${s.name}`} style={{ position: 'relative', flex: '1 1 80px' }}>
            <button
              onClick={() => onPick(i)}
              style={{
                width: '100%', cursor: 'pointer', textAlign: 'left', borderRadius: 12, padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 4,
                background: on ? 'rgba(217,130,42,.12)' : '#FFFBF4', border: `1px solid ${on ? 'rgba(217,130,42,.3)' : 'rgba(43,32,22,.1)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingRight: spots.length > 1 ? 14 : 0, minWidth: 0 }}>
                <div style={{ font: "500 11px/1.3 'Zen Kaku Gothic New',sans-serif", color: on ? 'var(--amber)' : 'rgba(43,32,22,.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.short}</div>
                <div style={{ font: "700 9px/1 'Zen Kaku Gothic New',sans-serif", color: 'var(--teal)', background: 'rgba(47,133,119,.12)', borderRadius: 99, padding: '2px 5px', flex: 'none' }}>
                  {FIELD_META[s.kind].label.slice(0, 1)}
                </div>
              </div>
              <div style={{ font: "700 15px/1 'JetBrains Mono',monospace", color: on ? 'var(--amber)' : 'rgba(43,32,22,.6)' }}>{scores[i]}</div>
            </button>
            {spots.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`「${s.name}」を登録地点から削除しますか？`)) onRemove(i);
                }}
                aria-label={`${s.name}を削除`}
                style={{
                  position: 'absolute', top: 5, right: 5, width: 18, height: 18, borderRadius: '50%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.3)',
                  font: "500 11px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.5)',
                }}
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
