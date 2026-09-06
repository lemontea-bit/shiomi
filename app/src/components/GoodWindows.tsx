import type { WindowSlot } from '../lib/engine';
import { scoreColor } from '../lib/engine';

export function GoodWindows({ windows }: { windows: WindowSlot[] }) {
  if (!windows.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div style={{ font: "700 13px/1 'Zen Kaku Gothic New',sans-serif" }}>次の好条件タイム</div>
      <div style={{ display: 'flex', gap: 9 }}>
        {windows.map((w, i) => (
          <div
            key={`${w.day}-${w.time}`}
            style={{
              flex: 1, borderRadius: 14, padding: '11px 11px 10px', display: 'flex', flexDirection: 'column', gap: 6,
              background: i === 0 ? 'rgba(242,169,59,.12)' : '#101F26', border: `1px solid ${i === 0 ? 'rgba(242,169,59,.3)' : 'rgba(140,190,200,.12)'}`,
            }}
          >
            <div style={{ font: "400 9.5px/1 'JetBrains Mono',monospace", color: 'rgba(234,242,244,.45)', letterSpacing: '.08em' }}>{w.day}</div>
            <div style={{ font: "500 12px/1 'JetBrains Mono',monospace", color: '#EAF2F4' }}>{w.time}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <div style={{ font: "700 17px/1 'JetBrains Mono',monospace", color: scoreColor(w.score) }}>{w.score}</div>
              <div style={{ font: "400 9.5px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(234,242,244,.45)' }}>{w.tag}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
