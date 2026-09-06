import type { NowStat } from '../lib/engine';
import type { WxKind } from '../types';
import { WxIcon } from './WxIcon';

export function NowWeatherGrid({
  stats,
  weatherLabel,
  weatherKind,
  onCycleWindUnit,
  source,
}: {
  stats: NowStat[];
  weatherLabel: string;
  weatherKind: WxKind;
  onCycleWindUnit: () => void;
  source: 'live' | 'simulated';
}) {
  return (
    <div style={{ borderRadius: 18, background: '#101F26', border: '1px solid rgba(140,190,200,.12)', padding: '16px 16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ font: "700 13px/1 'Zen Kaku Gothic New',sans-serif" }}>現在の天気</div>
          {source === 'simulated' && <div style={{ font: "500 9px/1 'JetBrains Mono',monospace", color: 'rgba(234,242,244,.35)' }}>推定値（オフライン）</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <WxIcon kind={weatherKind} size={26} />
          <div style={{ font: "400 11px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(234,242,244,.55)' }}>{weatherLabel}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 10px' }}>
        {stats.map((n) => {
          const isWind = n.label === 'WIND';
          return (
            <div key={n.label} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <div style={{ font: "400 10px/1 'JetBrains Mono',monospace", color: 'rgba(234,242,244,.42)', letterSpacing: '.08em' }}>{n.label}</div>
              <div
                style={{ display: 'flex', alignItems: 'baseline', gap: 3, cursor: isWind ? 'pointer' : 'default' }}
                onClick={isWind ? onCycleWindUnit : undefined}
                title={isWind ? '単位を切替' : undefined}
              >
                <div style={{ font: "700 20px/1 'JetBrains Mono',monospace", color: '#EAF2F4' }}>{n.value}</div>
                <div style={{ font: "400 10px/1 'JetBrains Mono',monospace", color: 'rgba(234,242,244,.45)' }}>{n.unit}</div>
              </div>
              <div style={{ font: "400 10px/1 'Zen Kaku Gothic New',sans-serif", color: n.noteColor }}>{n.note}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
