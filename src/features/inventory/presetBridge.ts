import type { RecipeFilters } from "../../types/filters";
import { RECIPE_LIST_KEYS } from "../../types/filters";
import { defaultInventoryQuery, type InventoryQuery } from "./query";

export function queryToRecipe(query: InventoryQuery, _recipe: RecipeFilters): RecipeFilters {
  const out: RecipeFilters = {};
  for (const key of RECIPE_LIST_KEYS) {
    const vals = query[key];
    if (vals && vals.length > 0) {
      out[key] = [...vals];
    }
  }
  const yearMin = query.yearMin ? Number(query.yearMin) : undefined;
  const yearMax = query.yearMax ? Number(query.yearMax) : undefined;
  if (yearMin !== undefined || yearMax !== undefined) {
    out.year = { min: yearMin, max: yearMax };
  }
  const odoMin = query.odoMin ? Number(query.odoMin) : undefined;
  const odoMax = query.odoMax ? Number(query.odoMax) : undefined;
  if (odoMin !== undefined || odoMax !== undefined) {
    out.odometer = { min: odoMin, max: odoMax };
  }
  const scoreMin = query.scoreMin ? Number(query.scoreMin) : undefined;
  const scoreMax = query.scoreMax ? Number(query.scoreMax) : undefined;
  if (scoreMin !== undefined || scoreMax !== undefined) {
    out.vehicleScore = { min: scoreMin, max: scoreMax };
  }
  return out;
}

export function recipeToQuery(payload: RecipeFilters | string | undefined, base: InventoryQuery): InventoryQuery {
  const parsed: RecipeFilters =
    typeof payload === "string"
      ? (() => { try { return JSON.parse(payload) as RecipeFilters; } catch { return {}; } })()
      : (payload ?? {});
  const next: InventoryQuery = { ...defaultInventoryQuery(), limit: base.limit };
  for (const key of RECIPE_LIST_KEYS) {
    const vals = parsed[key];
    if (Array.isArray(vals) && vals.length > 0) {
      next[key] = vals as string[];
    }
  }
  if (parsed.year) {
    if (parsed.year.min !== undefined) next.yearMin = String(parsed.year.min);
    if (parsed.year.max !== undefined) next.yearMax = String(parsed.year.max);
  }
  if (parsed.odometer) {
    if (parsed.odometer.min !== undefined) next.odoMin = String(parsed.odometer.min);
    if (parsed.odometer.max !== undefined) next.odoMax = String(parsed.odometer.max);
  }
  if (parsed.vehicleScore) {
    if (parsed.vehicleScore.min !== undefined) next.scoreMin = String(parsed.vehicleScore.min);
    if (parsed.vehicleScore.max !== undefined) next.scoreMax = String(parsed.vehicleScore.max);
  }
  return next;
}
