import { chicagoTodayDate } from "../../date/chicago";
import type { RecipeFilters } from "../../types/filters";
import type { InventoryQuery } from "./query";

export type RangeKind = "year" | "odo" | "score";

export type RangeBounds = { min: number; max: number };

const RANGE_KEYS: Record<RangeKind, { min: "yearMin" | "odoMin" | "scoreMin"; max: "yearMax" | "odoMax" | "scoreMax" }> = {
  year: { min: "yearMin", max: "yearMax" },
  odo: { min: "odoMin", max: "odoMax" },
  score: { min: "scoreMin", max: "scoreMax" },
};

export function recipeRangeBounds(recipe: RecipeFilters, kind: RangeKind): RangeBounds {
  const yearNow = Number(chicagoTodayDate().slice(0, 4));
  if (kind === "year") {
    return normalizeBounds(recipe.year?.min ?? 1990, recipe.year?.max ?? yearNow);
  }
  if (kind === "odo") {
    return normalizeBounds(recipe.odometer?.min ?? 0, recipe.odometer?.max ?? 250_000);
  }
  return normalizeBounds(recipe.vehicleScore?.min ?? 0, recipe.vehicleScore?.max ?? 50);
}

export function sliderPair(query: InventoryQuery, bounds: RangeBounds, kind: RangeKind): { lo: number; hi: number } {
  const keys = RANGE_KEYS[kind];
  const lo = clamp(Number(query[keys.min] ?? bounds.min), bounds.min, bounds.max);
  const hi = clamp(Number(query[keys.max] ?? bounds.max), bounds.min, bounds.max);
  return { lo: Math.min(lo, hi), hi: Math.max(lo, hi) };
}

export function patchRange(
  query: InventoryQuery,
  bounds: RangeBounds,
  kind: RangeKind,
  next: { lo: number; hi: number },
): InventoryQuery {
  const keys = RANGE_KEYS[kind];
  const patched: InventoryQuery = { ...query };
  if (next.lo === bounds.min) {
    delete patched[keys.min];
  } else {
    patched[keys.min] = String(next.lo);
  }
  if (next.hi === bounds.max) {
    delete patched[keys.max];
  } else {
    patched[keys.max] = String(next.hi);
  }
  return patched;
}

export function formatRangeValue(kind: RangeKind, value: number): string {
  if (kind === "odo") {
    return `${value.toLocaleString("en-US")} mi`;
  }
  return String(value);
}

function normalizeBounds(min: number, max: number): RangeBounds {
  if (min > max) {
    return { min: max, max: min };
  }
  return { min, max };
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}
