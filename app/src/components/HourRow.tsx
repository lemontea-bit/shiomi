import type { HourRowData } from '../lib/engine';
import { scoreColor } from '../lib/engine';
import { WxIcon } from './WxIcon';

export function HourRow({ h, open, onToggle }: { h: HourRowData; open: boolean; onToggle: () => void }) {
  const color = scoreColor(h.score);
  const timeColor = open ? 'var(--amber)' : 'rgba(43,32,22,.8)';
  return (
    <div
      onClick={onToggle}
      style={{
        cursor: 'pointer', borderRadius: 14, padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: 9,
        background: open ? 'rgba(217,130,42,.09)' : '#FFFBF4', border: `1px solid ${open ? 'rgba(217,130,42,.28)' : 'rgba(43,32,22,.1)'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ font: "500 13px/1 'JetBrains Mono',monospace", color: timeColor, width: 38, flex: 'none' }}>{h.time}</div>
        <WxIcon kind={h.icon} size={24} />
        <div style={{ font: "700 15px/1 'JetBrains Mono',monospace", color: '#2B2016', width: 38, flex: 'none' }}>{h.temp}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, width: 44, flex: 'none' }}>
          <div style={{ font: "500 12px/1 'JetBrains Mono',monospace", color: h.pop >= 50 ? 'var(--info)' : 'rgba(43,32,22,.7)' }}>{h.pop}</div>
          <div style={{ font: "400 9px/1 'JetBrains Mono',monospace", color: 'rgba(43,32,22,.4)' }}>%</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0 }}>
          <div style={{ font: "500 11px/1 'JetBrains Mono',monospace", color: 'rgba(43,32,22,.6)' }}>{h.dir}</div>
          <div style={{ font: "500 11px/1 'JetBrains Mono',monospace", color: h.hazard ? 'var(--danger)' : 'rgba(43,32,22,.8)' }}>{h.wind}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, width: 42, flex: 'none' }}>
          <div style={{ font: "700 13px/1 'JetBrains Mono',monospace", color }}>{h.score}</div>
          <div style={{ width: 42, height: 3, borderRadius: 99, background: 'rgba(43,32,22,.08)' }}>
            <div style={{ height: '100%', borderRadius: 99, width: `${Math.max(4, Math.min(97, h.score))}%`, background: color }} />
          </div>
        </div>
      </div>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 9, borderTop: '1px solid rgba(43,32,22,.14)' }}>
          <div style={{ font: "400 11.5px/1.6 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.7)' }}>{h.detail}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {h.chips.map((c) => (
              <div key={c.text} style={{ font: "500 10px/1 'Zen Kaku Gothic New',sans-serif", color: c.fg, background: c.bg, borderRadius: 99, padding: '6px 9px' }}>
                {c.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
