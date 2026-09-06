import type { AdjustedFish } from '../lib/engine';

export function FishCard({ f, onOpen }: { f: AdjustedFish; onOpen: () => void }) {
  return (
    <div onClick={onOpen} style={{ cursor: 'pointer', borderRadius: 16, background: '#101F26', border: '1px solid rgba(140,190,200,.12)', padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 13 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: f.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
        <div style={{ width: 18, height: 18, background: f.color, transform: 'rotate(45deg)', borderRadius: 3, opacity: 0.9 }} />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <div style={{ font: "700 15px/1 'Zen Kaku Gothic New',sans-serif", color: '#EAF2F4' }}>{f.name}</div>
          <div style={{ font: "400 10px/1 'JetBrains Mono',monospace", color: 'rgba(234,242,244,.4)' }}>{f.en}</div>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {f.chips.map((c) => (
            <div key={c} style={{ font: "500 9.5px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(234,242,244,.6)', background: 'rgba(255,255,255,.05)', borderRadius: 99, padding: '5px 8px' }}>
              {c}
            </div>
          ))}
        </div>
        <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,.07)' }}>
          <div style={{ height: '100%', borderRadius: 99, width: f.pct, background: f.color }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <div style={{ font: "700 22px/1 'JetBrains Mono',monospace", color: f.color }}>{f.prob}</div>
          <div style={{ font: "400 11px/1 'JetBrains Mono',monospace", color: f.color }}>%</div>
        </div>
        <div style={{ font: "500 9.5px/1.6 'Zen Kaku Gothic New',sans-serif", color: 'rgba(234,242,244,.42)' }}>{f.trend}</div>
      </div>
    </div>
  );
}
