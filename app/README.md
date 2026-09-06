# 潮見 SHIOMI

Weather + "will I catch anything" forecasting for anglers — sea, lake and river.
Implemented from the `潮見：釣果予報アプリ` design handed off from Claude Design
(see `../README.md`, `../chats/chat1.md`, `../project/` at the repo root for the
original prototype this was built from).

## What this is

- A React + Vite mobile web app (works great installed to the home screen —
  it ships a manifest and the right meta tags for that).
- Three fields — 海 (sea) / 湖 (lake) / 川 (river) — each with its own set of
  spots, target species and condition model, switchable from the segmented
  control at the top.
- Four tabs: **ホーム** (today's score + current conditions), **時間ごと**
  (hour-by-hour, 18h out, with a tide/level/flow chart), **週間** (7-day), and
  **釣れる魚** (per-species bite probability with a tackle/technique sheet).

## Live data vs. estimates — read this before trusting a number

Temperature, precipitation probability, wind speed/direction and pressure are
fetched live from [Open-Meteo](https://open-meteo.com/) (no API key needed) for
whichever spot is selected, with browser geolocation used once on load to
auto-pick the nearest spot in each field.

There is no free public API for real tide tables or river/lake gauge data, so
tide state, lake level and river flow are **modeled, not measured**:

- **Tide** uses the real semidiurnal period (12.42h) and the real lunar
  spring/neap cycle (phase-anchored to an actual new moon), so 大潮/中潮/小潮
  timing is in the right ballpark — but it is not a substitute for an official
  tide table for a specific port.
- **River flow** runs a simple rainfall→runoff (linear reservoir) model driven
  by the *live* precipitation forecast, so a wet forecast visibly raises the
  estimated flow.
- **Lake level**, water temperature and turbidity are seeded, slowly-varying
  estimates.

The fishing-condition score (5-factor weighted average — water temp, tide/
level/flow, pressure trend, wind, turbidity) and the whole species list —
names, tackle, technique, best times — are the design's authored sample
content (`src/data/fish.ts`), nudged up/down by the live+modeled condition
delta rather than being independently sourced per species. This mirrors the
scope agreed for this build: live weather where a real API exists, clearly-
labelled estimates where one doesn't.

If the network call to Open-Meteo fails (offline, blocked, CORS), the app
falls back to a deterministic simulated forecast so it stays fully usable,
and shows a small "推定値で表示しています" banner while it's doing that.

> Note from the build session: the sandboxed environment this was built in
> blocks outbound requests to `api.open-meteo.com` by egress policy, so the
> live path could only be verified via its fallback behavior here. It's
> ordinary `fetch()` from the browser, so it will hit the real API fine once
> deployed / run somewhere with normal internet access — just double-check it
> after `npm run dev` on your own machine.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run preview  # serve the production build
```

## Structure

```
src/
  types.ts            shared types
  data/                authored sample content (spots, fish, field metadata)
  lib/
    geo.ts             geolocation + nearest-spot
    weather.ts         Open-Meteo client, types, simulated fallback
    tide.ts            tide / lake level / river flow models
    engine.ts          combines weather + models into the score & every
                        screen's render data ("the brain" — ports the
                        prototype's renderVals())
    wx.ts, hash.ts, clock.ts   small formatting/math helpers
  components/          one component per screen section
```
