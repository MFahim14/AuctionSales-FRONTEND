import type { RangeFilter, RecipeFilters } from "../../types/filters";
import { RECIPE_BOOL_KEYS, RECIPE_LIST_KEYS, RECIPE_RANGE_KEYS } from "../../types/filters";
import type { RangeDraft, RecipeFormState } from "./formState";

function parseIntOrUndefined(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return undefined;
  }
  return value;
}

function rangeBody(draft: RangeDraft): RangeFilter | undefined {
  const min = parseIntOrUndefined(draft.min);
  const max = parseIntOrUndefined(draft.max);
  if (min === undefined && max === undefined) {
    return undefined;
  }
  const range: RangeFilter = {};
  if (min !== undefined) {
    range.min = min;
  }
  if (max !== undefined) {
    range.max = max;
  }
  return range;
}

export function buildRequestBody(state: RecipeFormState, recipe: RecipeFilters): RecipeFilters {
  const body: RecipeFilters = {};
  for (const key of RECIPE_BOOL_KEYS) {
    if (!(key in recipe)) {
      continue;
    }
    if (state[key]) {
      body[key] = true;
    }
  }
  for (const key of RECIPE_RANGE_KEYS) {
    if (!(key in recipe)) {
      continue;
    }
    const range = rangeBody(state[key]);
    if (range) {
      body[key] = range;
    }
  }
  for (const key of RECIPE_LIST_KEYS) {
    const allowed = new Set(recipe[key] || []);
    const wanted = state[key].filter((value) => allowed.has(value));
    if (wanted.length > 0) {
      body[key] = wanted;
    }
  }
  return body;
}
