import type { AdjustedFish } from '../lib/engine';
import { FIELD_META } from '../data/fieldMeta';
import type { Field } from '../types';
import { FishCard } from './FishCard';

export function FishTab({ field, cond, fishes, onOpen }: { field: Field; cond: string; fishes: AdjustedFish[]; onOpen: (i: number) => void }) {
  return (
    <div style={{ padding: '6px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ borderRadius: 16, background: 'linear-gradient(150deg,#E9F4F1,#DCEBE6)', border: '1px solid rgba(47,133,119,.22)', padding: '13px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ font: "400 10px/1 'JetBrains Mono',monospace", color: 'rgba(43,32,22,.45)', letterSpacing: '.1em' }}>{FIELD_META[field].areaLabel}</div>
          <div style={{ font: "700 12.5px/1 'Zen Kaku Gothic New',sans-serif", color: '#2B2016' }}>{cond}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ font: "700 20px/1 'JetBrains Mono',monospace", color: 'var(--teal)' }}>{fishes.length}</div>
          <div style={{ font: "400 9.5px/1.4 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.45)' }}>魚種</div>
        </div>
      </div>
      <div style={{ font: "400 10px/1 'JetBrains Mono',monospace", color: 'rgba(43,32,22,.38)', letterSpacing: '.06em', padding: '0 2px' }}>釣れる確率（自動計算）— タップで詳細</div>
      {fishes.map((f, i) => (
        <FishCard key={f.name} f={f} onOpen={() => onOpen(i)} />
      ))}
    </div>
  );
}
