import type { Spot } from '../types';

export function SpotPicker({ spots, active, scores, onPick }: { spots: Spot[]; active: number; scores: number[]; onPick: (i: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {spots.map((s, i) => {
        const on = i === active;
        return (
          <button
            key={s.short}
            onClick={() => onPick(i)}
            style={{
              flex: 1, cursor: 'pointer', textAlign: 'left', borderRadius: 12, padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 4,
              background: on ? 'rgba(242,169,59,.12)' : '#101F26', border: `1px solid ${on ? 'rgba(242,169,59,.3)' : 'rgba(140,190,200,.1)'}`,
            }}
          >
            <div style={{ font: "500 11px/1.3 'Zen Kaku Gothic New',sans-serif", color: on ? 'var(--amber)' : 'rgba(234,242,244,.6)' }}>{s.short}</div>
            <div style={{ font: "700 15px/1 'JetBrains Mono',monospace", color: on ? 'var(--amber)' : 'rgba(234,242,244,.6)' }}>{scores[i]}</div>
          </button>
        );
      })}
    </div>
  );
}
