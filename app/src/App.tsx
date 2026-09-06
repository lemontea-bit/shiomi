import { useEffect, useMemo, useRef, useState } from 'react';
import type { Field, Tab, WindUnit } from './types';
import { SPOTS_BY_FIELD } from './data/spots';
import { useGeolocation, nearestIndex } from './lib/geo';
import { useWeather } from './lib/weather';
import { useClock } from './lib/clock';
import { buildSnapshot, adjustFish } from './lib/engine';
import { Header } from './components/Header';
import { FieldSwitcher } from './components/FieldSwitcher';
import { TabBar } from './components/TabBar';
import { HomeTab } from './components/HomeTab';
import { HoursTab } from './components/HoursTab';
import { WeekTab } from './components/WeekTab';
import { FishTab } from './components/FishTab';
import { FishSheet } from './components/FishSheet';

const NEXT_WIND_UNIT: Record<WindUnit, WindUnit> = { 'm/s': 'kt', kt: 'km/h', 'km/h': 'm/s' };

export default function App() {
  const [field, setField] = useState<Field>('sea');
  const [spotByField, setSpotByField] = useState<Record<Field, number>>({ sea: 0, lake: 0, river: 0 });
  const [tab, setTab] = useState<Tab>('home');
  const [showBreak, setShowBreak] = useState(false);
  const [openHour, setOpenHour] = useState(-1);
  const [openDay, setOpenDay] = useState(-1);
  const [openFish, setOpenFish] = useState<number | null>(null);
  const [windUnit, setWindUnit] = useState<WindUnit>('m/s');
  const manualSpotRef = useRef(false);

  const fallbackCoords = { lat: SPOTS_BY_FIELD.sea[0].lat, lon: SPOTS_BY_FIELD.sea[0].lon };
  const geo = useGeolocation(fallbackCoords);

  // Auto-pick the nearest spot in every field once we know where the user actually is —
  // unless they've already tapped a spot themselves.
  useEffect(() => {
    if (geo.status !== 'granted' || manualSpotRef.current) return;
    setSpotByField({
      sea: nearestIndex(geo.coords, SPOTS_BY_FIELD.sea),
      lake: nearestIndex(geo.coords, SPOTS_BY_FIELD.lake),
      river: nearestIndex(geo.coords, SPOTS_BY_FIELD.river),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.status]);

  const spots = SPOTS_BY_FIELD[field];
  const spotIndex = Math.min(spotByField[field], spots.length - 1);
  const spot = spots[spotIndex];

  const { data: weather, status: weatherStatus } = useWeather({ lat: spot.lat, lon: spot.lon });
  const now = useClock(30_000);

  const snap = useMemo(() => {
    if (!weather) return null;
    return buildSnapshot({ field, spot, weather, windUnit, now });
  }, [field, spot, weather, windUnit, now]);

  // Scores for the 3-way spot picker on the home tab (each needs its own snapshot's hero score).
  const [spotScores, setSpotScores] = useState<number[]>([0, 0, 0]);
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
  }, [field, spotIndex, weather, snap?.heroScore, windUnit]);

  const fishes = useMemo(() => (snap ? adjustFish(field, snap.liveDelta) : []), [field, snap]);

  const pickField = (f: Field) => {
    setField(f);
    setTab('home');
    setShowBreak(false);
    setOpenHour(-1);
    setOpenDay(-1);
    setOpenFish(null);
  };
  const pickSpot = (i: number) => {
    manualSpotRef.current = true;
    setSpotByField((prev) => ({ ...prev, [field]: i }));
    setOpenFish(null);
  };

  if (!snap) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(234,242,244,.5)', font: "500 13px/1 'Zen Kaku Gothic New',sans-serif" }}>
        天気を取得しています…
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--ink)', position: 'relative', overflow: 'hidden' }}>
      <Header spot={spot} geoStatus={geo.status} />
      <FieldSwitcher field={field} onPick={pickField} />

      {weatherStatus === 'simulated' && (
        <div
          style={{
            margin: '0 20px 12px', textAlign: 'center', flex: 'none',
            font: "500 10px/1.6 'Zen Kaku Gothic New',sans-serif", color: 'rgba(234,242,244,.5)', background: 'rgba(15,31,38,.9)', border: '1px solid rgba(140,190,200,.16)',
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
            spots={spots}
            spotScores={spotScores}
            spotIndex={spotIndex}
            onPickSpot={pickSpot}
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
    </div>
  );
}
