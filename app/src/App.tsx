import { useEffect, useMemo, useState } from 'react';
import type { Field, Tab, WindUnit } from './types';
import { customLocationToSpot } from './data/spots';
import { useSavedSpots } from './lib/spotsStore';
import { useWeather } from './lib/weather';
import { useClock } from './lib/clock';
import { buildSnapshot, adjustFish } from './lib/engine';
import type { GeocodeResult } from './lib/geocode';
import { Header } from './components/Header';
import { FieldSwitcher } from './components/FieldSwitcher';
import { SpotPicker } from './components/SpotPicker';
import { TabBar } from './components/TabBar';
import { HomeTab } from './components/HomeTab';
import { HoursTab } from './components/HoursTab';
import { WeekTab } from './components/WeekTab';
import { FishTab } from './components/FishTab';
import { FishSheet } from './components/FishSheet';
import { LocationSearchSheet } from './components/LocationSearchSheet';

const NEXT_WIND_UNIT: Record<WindUnit, WindUnit> = { 'm/s': 'kt', kt: 'km/h', 'km/h': 'm/s' };

export default function App() {
  const [field, setField] = useState<Field>('sea');
  const [searchOpen, setSearchOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('home');
  const [showBreak, setShowBreak] = useState(false);
  const [openHour, setOpenHour] = useState(-1);
  const [openDay, setOpenDay] = useState(-1);
  const [openFish, setOpenFish] = useState<number | null>(null);
  const [windUnit, setWindUnit] = useState<WindUnit>('m/s');

  // One shared, persisted (localStorage) spot list — not one per field. A spot is just a
  // place; 海/湖/川 only changes which scoring lens/species list is applied to whichever
  // spot is currently selected, so switching it never changes the selection. No GPS
  // auto-detection either. See lib/spotsStore.ts.
  const saved = useSavedSpots();
  const spots = saved.spots;
  const spotIndex = Math.min(saved.active, spots.length - 1);
  const spot = spots[spotIndex];

  const { data: weather, status: weatherStatus } = useWeather({ lat: spot.lat, lon: spot.lon });
  const now = useClock(30_000);

  const snap = useMemo(() => {
    if (!weather) return null;
    return buildSnapshot({ field, spot, weather, windUnit, now });
  }, [field, spot, weather, windUnit, now]);

  // Scores for the spot picker (each needs its own snapshot's hero score, under the
  // currently active field's lens).
  const [spotScores, setSpotScores] = useState<number[]>([]);
  useEffect(() => {
    if (!weather || !snap) return;
    // Cheap approximation: reuse this spot's live weather for the sibling spots' scores too
    // (they're all nearby, so conditions are close) but keep each one's own baseDelta/tide seed.
    setSpotScores(
      spots.map((s, i) => {
        if (i === spotIndex) return snap.heroScore;
        const alt = buildSnapshot({ field, spot: s, weather, windUnit, now });
        return alt.heroScore;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field, spotIndex, spots, weather, snap?.heroScore, windUnit]);

  const fishes = useMemo(() => (snap ? adjustFish(field, snap.liveDelta) : []), [field, snap]);

  const pickField = (f: Field) => {
    setField(f);
    setShowBreak(false);
    setOpenHour(-1);
    setOpenDay(-1);
    setOpenFish(null);
  };
  const pickSpot = (i: number) => {
    saved.selectSpot(i);
    setOpenFish(null);
  };
  const removeSpot = (i: number) => saved.removeSpot(i);
  const pickPlace = (r: GeocodeResult) => {
    const newSpot = customLocationToSpot({ name: r.name, admin1: r.admin1, admin2: r.admin2, lat: r.lat, lon: r.lon });
    saved.addSpot(newSpot);
    setOpenFish(null);
    setSearchOpen(false);
  };

  if (!snap) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(43,32,22,.5)', font: "500 13px/1 'Zen Kaku Gothic New',sans-serif" }}>
        天気を取得しています…
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--ink)', position: 'relative', overflow: 'hidden' }}>
      <Header spot={spot} onOpenSearch={() => setSearchOpen(true)} />
      <FieldSwitcher field={field} onPick={pickField} />

      {/* Global, not tab-scoped: the current spot and its quick-switch list should be
          visible/changeable from 時間ごと・週間・釣れる魚 too, not just ホーム. */}
      <div style={{ padding: '0 20px 12px', flex: 'none' }}>
        <SpotPicker spots={spots} active={spotIndex} scores={spotScores} onPick={pickSpot} onRemove={removeSpot} />
      </div>

      {weatherStatus === 'simulated' && (
        <div
          style={{
            margin: '0 20px 12px', textAlign: 'center', flex: 'none',
            font: "500 10px/1.6 'Zen Kaku Gothic New',sans-serif", color: 'rgba(43,32,22,.6)', background: 'rgba(255,251,244,.92)', border: '1px solid rgba(43,32,22,.16)',
            borderRadius: 10, padding: '6px 10px',
          }}
        >
          天気データを取得できないため、推定値で表示しています
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 0 14px' }}>
        {tab === 'home' && (
          <HomeTab
            snap={snap}
            showBreak={showBreak}
            onToggleBreak={() => setShowBreak((v) => !v)}
            onCycleWindUnit={() => setWindUnit((u) => NEXT_WIND_UNIT[u])}
            onGoTab={setTab}
          />
        )}
        {tab === 'hours' && <HoursTab snap={snap} openHour={openHour} onToggleHour={(i) => setOpenHour((v) => (v === i ? -1 : i))} />}
        {tab === 'week' && <WeekTab snap={snap} openDay={openDay} onToggleDay={(i) => setOpenDay((v) => (v === i ? -1 : i))} />}
        {tab === 'fish' && <FishTab field={field} cond={snap.cond} fishes={fishes} onOpen={setOpenFish} />}
      </div>

      <TabBar tab={tab} onPick={setTab} />

      {openFish !== null && fishes[openFish] && <FishSheet fish={fishes[openFish]} onClose={() => setOpenFish(null)} />}
      {searchOpen && <LocationSearchSheet onPick={pickPlace} onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
