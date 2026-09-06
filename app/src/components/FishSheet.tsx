import type { AdjustedFish } from '../lib/engine';
import { scoreColor } from '../lib/engine';

export function FishSheet({ fish, onClose }: { fish: AdjustedFish; onClose: () => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(4,10,12,.66)', animation: 'fadeIn .18s ease-out' }} />
      <div
        style={{
          position: 'relative', borderRadius: '26px 26px 0 0', background: '#0F1F26', borderTop: '1px solid rgba(140,190,200,.18)',
          padding: '12px 20px calc(24px + env(safe-area-inset-bottom, 0px))', maxHeight: '86%', overflowY: 'auto', animation: 'sheetUp .26s cubic-bezier(.2,.9,.25,1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 14 }}>
          <div style={{ width: 44, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.22)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, paddingBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ font: "900 24px/1.1 'Zen Kaku Gothic New',sans-serif", color: '#EAF2F4' }}>{fish.name}</div>
            <div style={{ font: "400 10.5px/1 'JetBrains Mono',monospace", color: 'rgba(234,242,244,.45)', letterSpacing: '.06em' }}>
              {fish.en}・{fish.size}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, justifyContent: 'flex-end' }}>
              <div style={{ font: "700 34px/1 'JetBrains Mono',monospace", color: fish.color }}>{fish.prob}</div>
              <div style={{ font: "400 14px/1 'JetBrains Mono',monospace", color: fish.color }}>%</div>
            </div>
            <div style={{ font: "400 10px/1.6 'Zen Kaku Gothic New',sans-serif", color: 'rgba(234,242,244,.42)' }}>今日 {fish.trend}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '14px 0', borderTop: '1px solid rgba(140,190,200,.14)' }}>
          <div style={{ font: "700 12px/1 'Zen Kaku Gothic New',sans-serif", color: '#EAF2F4' }}>確率の内訳</div>
          {fish.factors.map((f) => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ font: "400 11px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(234,242,244,.6)', width: 60, flex: 'none' }}>{f.label}</div>
              <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${Math.max(4, Math.min(97, f.value))}%`, background: scoreColor(f.value) }} />
              </div>
              <div style={{ font: "400 10px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(234,242,244,.5)', width: 76, textAlign: 'right', flex: 'none' }}>{f.note}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, padding: '14px 0', borderTop: '1px solid rgba(140,190,200,.14)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, borderRadius: 12, background: 'rgba(242,169,59,.1)', padding: '10px 11px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ font: "400 9.5px/1 'JetBrains Mono',monospace", color: 'rgba(242,169,59,.85)', letterSpacing: '.08em' }}>ベストタイム</div>
              <div style={{ font: "500 12px/1.3 'JetBrains Mono',monospace", color: 'var(--amber)' }}>{fish.best}</div>
            </div>
            <div style={{ flex: 1, borderRadius: 12, background: 'rgba(95,211,198,.08)', padding: '10px 11px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ font: "400 9.5px/1 'JetBrains Mono',monospace", color: 'rgba(95,211,198,.85)', letterSpacing: '.08em' }}>ポイント</div>
              <div style={{ font: "500 11.5px/1.3 'Zen Kaku Gothic New',sans-serif", color: 'var(--teal)' }}>{fish.where}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ font: "700 12px/1 'Zen Kaku Gothic New',sans-serif", color: '#EAF2F4' }}>釣り方</div>
            <div style={{ font: "400 12px/1.75 'Zen Kaku Gothic New',sans-serif", color: 'rgba(234,242,244,.68)' }}>{fish.how}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ font: "700 12px/1 'Zen Kaku Gothic New',sans-serif", color: '#EAF2F4' }}>タックル</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {fish.tackle.map((t) => (
                <div key={t} style={{ font: "500 10.5px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(234,242,244,.7)', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(140,190,200,.14)', borderRadius: 99, padding: '7px 10px' }}>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div onClick={onClose} style={{ cursor: 'pointer', marginTop: 6, borderRadius: 14, background: 'var(--amber)', padding: 14, textAlign: 'center', font: "700 13px/1 'Zen Kaku Gothic New',sans-serif", color: '#0B1418' }}>
          閉じる
        </div>
      </div>
    </div>
  );
}
