import { useState } from 'react';
import type { Spot } from '../types';
import { SEED_SPOTS } from '../data/spots';
import { loadJSON, saveJSON } from './storage';

const KEY = 'shiomi:spots:v2';

interface StoredState {
  spots: Spot[];
  active: number;
}

function defaultState(): StoredState {
  return { spots: [...SEED_SPOTS], active: 0 };
}

function loadInitial(): StoredState {
  const stored = loadJSON<StoredState>(KEY);
  if (!stored?.spots?.length) return defaultState();
  if (stored.active == null || stored.active >= stored.spots.length) stored.active = 0;
  return stored;
}

/** A single, persisted (localStorage), user-editable list of spots — seeded with 3 curated
 * ones, then whatever the viewer registers via search or removes. One list shared across
 * 海/湖/川: a spot is just a place, not tied to a field. There's no GPS-based auto-selection
 * here either, just a list you manage yourself. */
export function useSavedSpots() {
  const [state, setState] = useState<StoredState>(loadInitial);

  const persist = (next: StoredState) => {
    setState(next);
    saveJSON(KEY, next);
  };

  const selectSpot = (index: number) => {
    persist({ ...state, active: index });
  };

  const addSpot = (spot: Spot) => {
    const list = [...state.spots, spot];
    persist({ spots: list, active: list.length - 1 });
  };

  const removeSpot = (index: number) => {
    if (state.spots.length <= 1) return; // always keep at least one spot
    const nextList = state.spots.filter((_, i) => i !== index);
    const nextActive = state.active === index ? 0 : state.active > index ? state.active - 1 : state.active;
    persist({ spots: nextList, active: nextActive });
  };

  return { spots: state.spots, active: state.active, selectSpot, addSpot, removeSpot };
}
