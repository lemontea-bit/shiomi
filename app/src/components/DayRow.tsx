import type { DayRowData } from '../lib/engine';
import { scoreColor } from '../lib/engine';
import { WxIcon } from './WxIcon';

export function DayRow({ d, open, onToggle }: { d: DayRowData; open: boolean; onToggle: () => void }) {
  const color = scoreColor(d.score);
  return (
    <div
      onClick={onToggle}
      style={{
        cursor: 'pointer', borderRadius: 16, padding: '13px 14px', display: 'flex', flexDirection: 'column', gap: 11,
        background: open ? 'rgba(242,169,59,.07)' : '#101F26', border: `1px solid ${open ? 'rgba(242,169,59,.26)' : 'rgba(140,190,200,.1)'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 46, flex: 'none' }}>
          <div style={{ font: "700 13px/1 'JetBrains Mono',monospace", color: '#EAF2F4' }}>{d.date}</div>
          <div style={{ font: "500 10px/1 'JetBrains Mono',monospace", color: d.dow === 'SUN' ? 'var(--danger)' : d.dow === 'SAT' ? 'var(--info)' : 'rgba(234,242,244,.45)' }}>{d.dow}</div>
        </div>
        <WxIcon kind={d.icon} size={28} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, width: 70, flex: 'none' }}>
          <div style={{ font: "700 16px/1 'JetBrains Mono',monospace", color: '#EAF2F4' }}>{d.hi}</div>
          <div style={{ font: "500 12px/1 'JetBrains Mono',monospace", color: 'rgba(234,242,244,.45)' }}>{d.lo}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
          <div style={{ font: "500 10.5px/1 'JetBrains Mono',monospace", color: d.pop >= 50 ? 'var(--info)' : 'rgba(234,242,244,.6)' }}>
            {d.pop}% / {d.wind}
          </div>
          <div style={{ font: "400 10px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(234,242,244,.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.tide}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flex: 'none' }}>
          <div style={{ font: "700 18px/1 'JetBrains Mono',monospace", color }}>{d.score}</div>
          <div style={{ width: 46, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.08)' }}>
            <div style={{ height: '100%', borderRadius: 99, width: `${Math.max(4, Math.min(97, d.score))}%`, background: color }} />
          </div>
        </div>
      </div>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 10, borderTop: '1px solid rgba(140,190,200,.14)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, borderRadius: 12, background: 'rgba(242,169,59,.1)', padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ font: "400 9.5px/1 'JetBrains Mono',monospace", color: 'rgba(242,169,59,.8)', letterSpacing: '.08em' }}>BEST WINDOW</div>
              <div style={{ font: "500 12px/1 'JetBrains Mono',monospace", color: 'var(--amber)' }}>{d.best}</div>
            </div>
            <div style={{ flex: 1, borderRadius: 12, background: 'rgba(95,211,198,.08)', padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ font: "400 9.5px/1 'JetBrains Mono',monospace", color: 'rgba(95,211,198,.8)', letterSpacing: '.08em' }}>狙える魚</div>
              <div style={{ font: "500 11.5px/1.3 'Zen Kaku Gothic New',sans-serif", color: 'var(--teal)' }}>{d.fish}</div>
            </div>
          </div>
          <div style={{ font: "400 11.5px/1.6 'Zen Kaku Gothic New',sans-serif", color: 'rgba(234,242,244,.62)' }}>{d.note}</div>
        </div>
      )}
    </div>
  );
}
