# 潮見 SHIOMI

Weather + "will I catch anything" forecasting for anglers — sea, lake and river.
Implemented from the `潮見：釣果予報アプリ` design handed off from Claude Design
(see `../README.md`, `../chats/chat1.md`, `../project/` at the repo root for the
original prototype this was built from).

## What this is

- A React + Vite mobile web app (works great installed to the home screen —
  it ships a manifest and the right meta tags for that).
- Three fields — 海 (sea) / 湖 (lake) / 川 (river), switchable from the
  segmented control at the top — each its own scoring lens (tide vs. level
  vs. flow model) and target species list. A spot isn't tied to a field: it's
  just a place, and switching fields re-scores whichever spot is currently
  selected under that lens rather than changing the selection.
- Four tabs: **ホーム** (today's score + current conditions), **時間ごと**
  (hour-by-hour, 18h out, with a tide/level/flow chart), **週間** (7-day), and
  **釣れる魚** (per-species bite probability with a tackle/technique sheet).
  The current spot and its quick-switch list sit above all four, not just ホーム.
- One shared, `localStorage`-persisted spot list (seeded with 3 curated
  spots) — tap the search bar in the header to search any 都道府県・市区町村・
  地名 in Japan (lib/geocode.ts, Open-Meteo's free geocoding API + a small
  curated fallback for well-known lakes it tends to miss) and register it, or
  tap a spot's **×** to remove it. There is deliberately no GPS/geolocation
  auto-detection — it only ever "worked" for the 3 original Kanagawa-area
  spots, and searching covers all of Japan.

## Live data vs. estimates — read this before trusting a number

Temperature, precipitation probability, wind speed/direction and pressure are
fetched live from [Open-Meteo](https://open-meteo.com/) (no API key needed)
for whichever spot is selected.

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

## Deployment

Pushing to `main` builds and deploys automatically to GitHub Pages via
`.github/workflows/deploy-pages.yml`, at:

```
https://<github-username>.github.io/shiomi/
```

That's a real hosted origin (unlike a sandboxed Artifact preview), so live
weather and the geocoding search work normally there — open it on a phone
and use "Add to Home Screen" to install it like an app.

The build's `base` path (`vite.config.ts`) is set to `/shiomi/` to match a
GitHub Pages *project* site (`username.github.io/shiomi/`) — if the repo is
ever renamed, or moved to a custom domain / a `username.github.io` *user*
site, update `base` (and `public/manifest.webmanifest`'s `start_url`/`scope`
stay `.`-relative, so those don't need touching) to match.

The workflow's first run enables Pages automatically
(`actions/configure-pages` with `enablement: true`); if your organization's
GitHub settings block that, enable it once manually instead: repo **Settings
→ Pages → Source: GitHub Actions**, then re-run the workflow.

## Structure

```
src/
  types.ts            shared types
  data/                authored sample content (spots, fish, field metadata)
  lib/
    geocode.ts         place search (Open-Meteo geocoding + known-waters fallback)
    spotsStore.ts      shared saved-spot list, persisted to localStorage
    weather.ts         Open-Meteo client, types, simulated fallback
    tide.ts            tide / lake level / river flow models
    engine.ts          combines weather + models into the score & every
                        screen's render data ("the brain" — ports the
                        prototype's renderVals())
    wx.ts, hash.ts, clock.ts   small formatting/math helpers
  components/          one component per screen section
```
