import type { Snapshot } from '../lib/engine';
import { DayRow } from './DayRow';

export function WeekTab({ snap, openDay, onToggleDay }: { snap: Snapshot; openDay: number; onToggleDay: (i: number) => void }) {
  return (
    <div style={{ padding: '6px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
        <div style={{ font: "700 13px/1 'Zen Kaku Gothic New',sans-serif" }}>週間予報</div>
        <div style={{ font: "400 10px/1 'JetBrains Mono',monospace", color: 'rgba(234,242,244,.38)', letterSpacing: '.06em' }}>タップで好条件ウィンドウ</div>
      </div>
      {snap.days.map((d, i) => (
        <DayRow key={d.iso} d={d} open={openDay === i} onToggle={() => onToggleDay(i)} />
      ))}
    </div>
  );
}
