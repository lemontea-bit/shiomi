import type { FactorRow } from '../lib/engine';

export function ScoreCard({
  score,
  grade,
  tideState,
  headline,
  hazard,
  factors,
  showBreak,
  onToggle,
}: {
  score: number;
  grade: string;
  tideState: string;
  headline: string;
  hazard: boolean;
  factors: FactorRow[];
  showBreak: boolean;
  onToggle: () => void;
}) {
  const blocks = Array.from({ length: 10 }, (_, i) => i * 10 < score);
  return (
    <div
      onClick={onToggle}
      style={{
        borderRadius: 20, padding: '18px 18px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14,
        background: hazard ? 'linear-gradient(160deg,#FBE1DC,#F6CCC4 60%,#F2BEB4)' : 'linear-gradient(160deg,#FBEAD2,#F6DCC0 60%,#F3D2B2)',
        border: `1px solid ${hazard ? 'rgba(196,67,46,.32)' : 'rgba(217,130,42,.22)'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ font: "500 11px/1 'JetBrains Mono',monospace", color: 'rgba(43,32,22,.5)', letterSpacing: '.14em' }}>釣果期待度</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ font: "700 62px/1 'JetBrains Mono',monospace", color: hazard ? 'var(--danger)' : 'var(--amber)', letterSpacing: '-.03em' }}>{score}</div>
            <div style={{ font: "700 15px/1 'Zen Kaku Gothic New',sans-serif", color: hazard ? 'var(--danger)' : 'var(--amber)' }}>{grade}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ font: "500 10px/1 'JetBrains Mono',monospace", color: 'rgba(43,32,22,.4)', letterSpacing: '.1em', textAlign: 'right' }}>{tideState}</div>
          <div style={{ font: "400 10px/1.4 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.4)', textAlign: 'right' }}>
            タップで
            <br />
            算出根拠
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 3, height: 8 }}>
        {blocks.map((on, i) => (
          <div key={i} style={{ flex: 1, borderRadius: 2, background: on ? (i < 3 ? 'rgba(217,130,42,.45)' : 'var(--amber)') : 'rgba(43,32,22,.07)' }} />
        ))}
      </div>
      <div style={{ font: "400 12px/1.6 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.72)' }}>{headline}</div>
      {showBreak && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 12, borderTop: '1px solid rgba(43,32,22,.14)' }}>
          {factors.map((f) => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ font: "400 11px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.6)', width: 52, flex: 'none' }}>{f.label}</div>
              <div style={{ flex: 1, height: 5, borderRadius: 99, background: 'rgba(43,32,22,.07)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${Math.max(4, Math.min(97, f.value))}%`, background: f.value >= 70 ? 'var(--amber)' : f.value >= 50 ? 'var(--teal)' : 'var(--dim)' }} />
              </div>
              <div style={{ font: "500 11px/1 'JetBrains Mono',monospace", color: 'rgba(43,32,22,.75)', width: 26, textAlign: 'right', flex: 'none' }}>{f.value}</div>
              <div style={{ font: "400 10px/1 'JetBrains Mono',monospace", color: 'rgba(43,32,22,.4)', width: 92, flex: 'none', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.note}</div>
            </div>
          ))}
          <div style={{ font: "400 10.5px/1.6 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.38)' }}>
            水温・潮汐等・気圧・風速・濁りの5指標を重み付け平均でスコア化。気温・気圧・風速は現在地の実測予報、潮汐・水位・流量・水温・濁りは推定値です。
          </div>
        </div>
      )}
    </div>
  );
}
