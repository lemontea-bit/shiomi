import { useState } from 'react';
import type { Field, Spot } from '../types';
import { SPOTS_BY_FIELD } from '../data/spots';
import { loadJSON, saveJSON } from './storage';

const KEY = 'shiomi:spots:v1';

interface StoredState {
  spots: Record<Field, Spot[]>;
  active: Record<Field, number>;
}

function defaultState(): StoredState {
  return {
    spots: { sea: [...SPOTS_BY_FIELD.sea], lake: [...SPOTS_BY_FIELD.lake], river: [...SPOTS_BY_FIELD.river] },
    active: { sea: 0, lake: 0, river: 0 },
  };
}

function loadInitial(): StoredState {
  const stored = loadJSON<StoredState>(KEY);
  if (!stored || !stored.spots || !stored.active) return defaultState();
  // Guard against a field ending up with an empty list (shouldn't happen — removeSpot
  // refuses to drop the last one — but a corrupted/edited localStorage value could do it).
  const fields: Field[] = ['sea', 'lake', 'river'];
  for (const f of fields) {
    if (!stored.spots[f]?.length) stored.spots[f] = [...SPOTS_BY_FIELD[f]];
    if (stored.active[f] == null || stored.active[f] >= stored.spots[f].length) stored.active[f] = 0;
  }
  return stored;
}

/** A per-field, persisted (localStorage), user-editable list of spots — seeded from the 3
 * curated ones per field, then whatever the viewer registers via search or removes. This
 * replaces GPS-based "nearest preset" auto-selection entirely: there's no location auto-
 * detection here, just a list you manage yourself. */
export function useSavedSpots() {
  const [state, setState] = useState<StoredState>(loadInitial);

  const persist = (next: StoredState) => {
    setState(next);
    saveJSON(KEY, next);
  };

  const selectSpot = (field: Field, index: number) => {
    persist({ ...state, active: { ...state.active, [field]: index } });
  };

  const addSpot = (field: Field, spot: Spot) => {
    const list = [...state.spots[field], spot];
    persist({ spots: { ...state.spots, [field]: list }, active: { ...state.active, [field]: list.length - 1 } });
  };

  const removeSpot = (field: Field, index: number) => {
    const list = state.spots[field];
    if (list.length <= 1) return; // always keep at least one spot per field
    const nextList = list.filter((_, i) => i !== index);
    const prevActive = state.active[field];
    const nextActive = prevActive === index ? 0 : prevActive > index ? prevActive - 1 : prevActive;
    persist({ spots: { ...state.spots, [field]: nextList }, active: { ...state.active, [field]: nextActive } });
  };

  return { spots: state.spots, active: state.active, selectSpot, addSpot, removeSpot };
}
