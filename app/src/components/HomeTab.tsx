import type { Snapshot } from '../lib/engine';
import type { Spot, Tab } from '../types';
import { ScoreCard } from './ScoreCard';
import { SpotPicker } from './SpotPicker';
import { NowWeatherGrid } from './NowWeatherGrid';
import { GoodWindows } from './GoodWindows';
import { WeekMini } from './WeekMini';

export function HomeTab({
  snap,
  spots,
  spotScores,
  spotIndex,
  onPickSpot,
  showBreak,
  onToggleBreak,
  onCycleWindUnit,
  onGoTab,
}: {
  snap: Snapshot;
  spots: Spot[];
  spotScores: number[];
  spotIndex: number;
  onPickSpot: (i: number) => void;
  showBreak: boolean;
  onToggleBreak: () => void;
  onCycleWindUnit: () => void;
  onGoTab: (t: Tab) => void;
}) {
  return (
    <div style={{ padding: '6px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ScoreCard
        score={snap.heroScore}
        grade={snap.grade}
        tideState={snap.tideStateLabel}
        headline={snap.headline}
        hazard={snap.hazard}
        factors={snap.factors}
        showBreak={showBreak}
        onToggle={onToggleBreak}
      />
      <SpotPicker spots={spots} active={spotIndex} scores={spotScores} onPick={onPickSpot} />
      <NowWeatherGrid stats={snap.nowStats} weatherLabel={snap.weatherLabel} weatherKind={snap.weatherKind} onCycleWindUnit={onCycleWindUnit} source={snap.weatherSource === 'live' ? 'live' : 'simulated'} />
      <GoodWindows windows={snap.windows} />
      <WeekMini days={snap.days} onOpen={() => onGoTab('week')} />
    </div>
  );
}
