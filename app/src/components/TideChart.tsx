export function TideChart({
  points,
  nowFrac,
  title,
  sub,
  meta,
}: {
  points: number[];
  nowFrac: number;
  title: string;
  sub: string;
  meta: string;
}) {
  const W = 340;
  const H = 76;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const toY = (v: number) => 68 - ((v - min) / range) * 58;
  const step = W / (points.length - 1);
  const coords = points.map((v, i) => [Math.round(i * step), Math.round(toY(v) * 10) / 10] as const);
  const line = coords.map(([x, y]) => `${x},${y}`).join(' ');
  const fill = `${line} ${W},${H} 0,${H}`;
  const nowX = Math.round(nowFrac * W);

  return (
    <div style={{ borderRadius: 18, background: '#FFFBF4', border: '1px solid rgba(43,32,22,.12)', padding: '15px 16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ font: "700 13px/1 'Zen Kaku Gothic New',sans-serif" }}>
          {title} <span style={{ font: "400 11px/1 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.45)' }}>{sub}</span>
        </div>
        <div style={{ font: "400 10px/1 'JetBrains Mono',monospace", color: 'rgba(43,32,22,.45)', letterSpacing: '.06em', textAlign: 'right' }}>{meta}</div>
      </div>
      <div style={{ position: 'relative', height: 76 }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <polyline points={line} fill="none" stroke="var(--teal)" strokeWidth={2} strokeLinecap="round" />
          <polyline points={fill} fill="rgba(47,133,119,.10)" stroke="none" />
          <line x1={nowX} y1={0} x2={nowX} y2={H} stroke="rgba(217,130,42,.5)" strokeWidth={1} strokeDasharray="3 3" />
        </svg>
        <div style={{ position: 'absolute', left: `${Math.min(88, Math.max(0, nowFrac * 100))}%`, top: 0, font: "500 9.5px/1 'JetBrains Mono',monospace", color: 'var(--amber)' }}>NOW</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', font: "400 9.5px/1 'JetBrains Mono',monospace", color: 'rgba(43,32,22,.35)' }}>
        <div>00</div>
        <div>06</div>
        <div>12</div>
        <div>18</div>
        <div>24</div>
      </div>
    </div>
  );
}
