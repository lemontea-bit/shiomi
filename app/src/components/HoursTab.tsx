import type { Snapshot } from '../lib/engine';
import { TideChart } from './TideChart';
import { HourRow } from './HourRow';

export function HoursTab({ snap, openHour, onToggleHour }: { snap: Snapshot; openHour: number; onToggleHour: (i: number) => void }) {
  return (
    <div style={{ padding: '6px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <TideChart points={snap.tideChart.points} nowFrac={snap.tideChart.nowFrac} title={snap.tideChart.title} sub={snap.tideChart.sub} meta={snap.tideChart.meta} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
        <div style={{ font: "700 13px/1 'Zen Kaku Gothic New',sans-serif" }}>時間ごとの詳細</div>
        <div style={{ font: "400 10px/1 'JetBrains Mono',monospace", color: 'rgba(234,242,244,.38)', letterSpacing: '.06em' }}>気温 / 降水確率 / 風速 / 釣果</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {snap.hours.map((h, i) => (
          <HourRow key={h.iso} h={h} open={openHour === i} onToggle={() => onToggleHour(i)} />
        ))}
      </div>
    </div>
  );
}
