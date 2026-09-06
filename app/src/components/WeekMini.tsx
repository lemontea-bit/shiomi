import type { DayRowData } from '../lib/engine';
import { scoreColor } from '../lib/engine';
import { WxIcon } from './WxIcon';

export function WeekMini({ days, onOpen }: { days: DayRowData[]; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      style={{ borderRadius: 18, background: '#FFFBF4', border: '1px solid rgba(43,32,22,.12)', padding: '14px 14px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ font: "700 13px/1 'Zen Kaku Gothic New',sans-serif" }}>週間</div>
        <div style={{ font: "400 11px/1 'Zen Kaku Gothic New',sans-serif", color: 'var(--amber)' }}>詳しく見る →</div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {days.map((d) => {
          const color = scoreColor(d.score);
          return (
            <div key={d.iso} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
              <div style={{ font: "500 10px/1 'JetBrains Mono',monospace", color: d.dow === 'SUN' ? 'var(--danger)' : d.dow === 'SAT' ? 'var(--info)' : 'rgba(43,32,22,.45)' }}>{d.dow}</div>
              <WxIcon kind={d.icon} size={22} />
              <div style={{ font: "500 10px/1 'JetBrains Mono',monospace", color: 'rgba(43,32,22,.75)' }}>{d.hi}</div>
              <div style={{ width: 22, height: 4, borderRadius: 99, background: color }} />
              <div style={{ font: "700 10px/1 'JetBrains Mono',monospace", color }}>{d.score}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
