"use client";

import { FacetChips } from "../watchlists/FacetChips";
import { FacetRange } from "../watchlists/FacetRange";
import type { RecipeFilters } from "../../types/filters";
import {
  RECIPE_BOOL_KEYS,
  RECIPE_LABELS,
  RECIPE_LIST_KEYS,
  RECIPE_RANGE_KEYS,
} from "../../types/filters";
import type { RecipeFormState } from "../watchlists/formState";

const RANGE_BOUNDS = {
  year: { min: 1990, max: 2030 },
  odometer: { min: 0, max: 200000 },
  vehicleScore: { min: 0, max: 50 },
  buyNowPrice: { min: 0, max: 100000 },
};

export function RecipeEditor({
  state,
  onChange,
}: {
  state: RecipeFormState;
  onChange: (next: RecipeFormState) => void;
}) {
  function patch(next: Partial<RecipeFormState>) {
    onChange({ ...state, ...next });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="font-serif text-lg">Musts</h3>
        {RECIPE_BOOL_KEYS.map((key) => (
          <label key={key} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--accent)]"
              checked={state[key]}
              onChange={(event) => patch({ [key]: event.target.checked })}
            />
            {RECIPE_LABELS[key]}
          </label>
        ))}
      </section>
      <section className="space-y-4">
        <h3 className="font-serif text-lg">Ranges</h3>
        {RECIPE_RANGE_KEYS.map((key) => (
          <FacetRange
            key={key}
            label={RECIPE_LABELS[key]}
            value={state[key]}
            minBound={RANGE_BOUNDS[key].min}
            maxBound={RANGE_BOUNDS[key].max}
            onChange={(next) => patch({ [key]: next })}
          />
        ))}
      </section>
      <section className="space-y-4">
        <h3 className="font-serif text-lg">Lists</h3>
        {RECIPE_LIST_KEYS.map((key) => (
          <FacetChips
            key={key}
            label={RECIPE_LABELS[key]}
            value={state[key]}
            onChange={(next) => patch({ [key]: next })}
            placeholder={`Add ${RECIPE_LABELS[key].toLowerCase()}`}
          />
        ))}
      </section>
    </div>
  );
}

function parseRange(draft: { min: string; max: string }) {
  const min = draft.min.trim() ? Number(draft.min) : undefined;
  const max = draft.max.trim() ? Number(draft.max) : undefined;
  if (min === undefined && max === undefined) {
    return undefined;
  }
  const range: { min?: number; max?: number } = {};
  if (min !== undefined && Number.isFinite(min)) {
    range.min = min;
  }
  if (max !== undefined && Number.isFinite(max)) {
    range.max = max;
  }
  return Object.keys(range).length ? range : undefined;
}

export function serializeCatalog(state: RecipeFormState): RecipeFilters {
  const body: RecipeFilters = {};
  for (const key of RECIPE_BOOL_KEYS) {
    if (state[key]) {
      body[key] = true;
    }
  }
  for (const key of RECIPE_RANGE_KEYS) {
    const range = parseRange(state[key]);
    if (range) {
      body[key] = range;
    }
  }
  for (const key of RECIPE_LIST_KEYS) {
    if (state[key].length > 0) {
      body[key] = [...state[key]];
    }
  }
  return body;
}
