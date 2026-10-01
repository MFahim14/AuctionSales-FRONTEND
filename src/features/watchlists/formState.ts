import type { RangeFilter, RecipeFilters } from "../../types/filters";
import {
  RECIPE_BOOL_KEYS,
  RECIPE_LIST_KEYS,
  RECIPE_RANGE_KEYS,
} from "../../types/filters";

export type RangeDraft = { min: string; max: string };

export type RecipeFormState = {
  // booleans
  clearTitle: boolean;
  runAndDrive: boolean;
  itemsWithSaleDate: boolean;
  // ranges
  year: RangeDraft;
  odometer: RangeDraft;
  vehicleScore: RangeDraft;
  buyNowPrice: RangeDraft;
  // list — existing
  vehicleTypes: string[];
  fuelTypes: string[];
  transmissions: string[];
  airbags: string[];
  primaryDamages: string[];
  // list — new
  startCodes: string[];
  vehicleSubTypes: string[];
  cylinders: string[];
  drivelineTypes: string[];
  bodyStyles: string[];
  exteriorColors: string[];
  interiorColors: string[];
  countryOfOrigin: string[];
  lossTypes: string[];
  titleSaleDocs: string[];
  featuredAuctions: string[];
  whoCanBuy: string[];
  regions: string[];
};

function rangeOrEmpty(value: RangeFilter | undefined): RangeDraft {
  return {
    min: value?.min !== undefined ? String(value.min) : "",
    max: value?.max !== undefined ? String(value.max) : "",
  };
}

export function emptyFormState(): RecipeFormState {
  return {
    clearTitle: false,
    runAndDrive: false,
    itemsWithSaleDate: false,
    year: { min: "", max: "" },
    odometer: { min: "", max: "" },
    vehicleScore: { min: "", max: "" },
    buyNowPrice: { min: "", max: "" },
    vehicleTypes: [],
    fuelTypes: [],
    transmissions: [],
    airbags: [],
    primaryDamages: [],
    startCodes: [],
    vehicleSubTypes: [],
    cylinders: [],
    drivelineTypes: [],
    bodyStyles: [],
    exteriorColors: [],
    interiorColors: [],
    countryOfOrigin: [],
    lossTypes: [],
    titleSaleDocs: [],
    featuredAuctions: [],
    whoCanBuy: [],
    regions: [],
  };
}

export function hydrateFormState(payload: RecipeFilters): RecipeFormState {
  const empty = emptyFormState();
  return {
    ...empty,
    clearTitle: payload.clearTitle === true,
    runAndDrive: payload.runAndDrive === true,
    itemsWithSaleDate: payload.itemsWithSaleDate === true,
    year: rangeOrEmpty(payload.year),
    odometer: rangeOrEmpty(payload.odometer),
    vehicleScore: rangeOrEmpty(payload.vehicleScore),
    buyNowPrice: rangeOrEmpty(payload.buyNowPrice),
    vehicleTypes: [...(payload.vehicleTypes || [])],
    fuelTypes: [...(payload.fuelTypes || [])],
    transmissions: [...(payload.transmissions || [])],
    airbags: [...(payload.airbags || [])],
    primaryDamages: [...(payload.primaryDamages || [])],
    startCodes: [...(payload.startCodes || [])],
    vehicleSubTypes: [...(payload.vehicleSubTypes || [])],
    cylinders: [...(payload.cylinders || [])],
    drivelineTypes: [...(payload.drivelineTypes || [])],
    bodyStyles: [...(payload.bodyStyles || [])],
    exteriorColors: [...(payload.exteriorColors || [])],
    interiorColors: [...(payload.interiorColors || [])],
    countryOfOrigin: [...(payload.countryOfOrigin || [])],
    lossTypes: [...(payload.lossTypes || [])],
    titleSaleDocs: [...(payload.titleSaleDocs || [])],
    featuredAuctions: [...(payload.featuredAuctions || [])],
    whoCanBuy: [...(payload.whoCanBuy || [])],
    regions: [...(payload.regions || [])],
  };
}

export function recipeHasBool(recipe: RecipeFilters, key: (typeof RECIPE_BOOL_KEYS)[number]): boolean {
  return key in recipe;
}

export function recipeHasRange(recipe: RecipeFilters, key: (typeof RECIPE_RANGE_KEYS)[number]): boolean {
  return key in recipe;
}

export function recipeHasList(recipe: RecipeFilters, key: (typeof RECIPE_LIST_KEYS)[number]): boolean {
  return Array.isArray(recipe[key]) && (recipe[key] as string[]).length > 0;
}
