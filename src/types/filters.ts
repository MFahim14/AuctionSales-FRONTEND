export type RangeFilter = { min?: number; max?: number };

export type RecipeFilters = {
  // booleans
  clearTitle?: boolean;
  runAndDrive?: boolean;
  itemsWithSaleDate?: boolean;
  // ranges
  year?: RangeFilter;
  odometer?: RangeFilter;
  vehicleScore?: RangeFilter;
  buyNowPrice?: RangeFilter;
  // list filters — existing
  vehicleTypes?: string[];
  fuelTypes?: string[];
  transmissions?: string[];
  airbags?: string[];
  primaryDamages?: string[];
  // list filters — new
  startCodes?: string[];
  vehicleSubTypes?: string[];
  cylinders?: string[];
  drivelineTypes?: string[];
  bodyStyles?: string[];
  exteriorColors?: string[];
  interiorColors?: string[];
  countryOfOrigin?: string[];
  lossTypes?: string[];
  titleSaleDocs?: string[];
  featuredAuctions?: string[];
  whoCanBuy?: string[];
  regions?: string[];
};

export const RECIPE_BOOL_KEYS = ["clearTitle", "runAndDrive", "itemsWithSaleDate"] as const;
export const RECIPE_RANGE_KEYS = ["year", "odometer", "vehicleScore", "buyNowPrice"] as const;
export const RECIPE_LIST_KEYS = [
  "vehicleTypes",
  "fuelTypes",
  "transmissions",
  "airbags",
  "primaryDamages",
  "startCodes",
  "vehicleSubTypes",
  "cylinders",
  "drivelineTypes",
  "bodyStyles",
  "exteriorColors",
  "interiorColors",
  "countryOfOrigin",
  "lossTypes",
  "titleSaleDocs",
  "featuredAuctions",
  "whoCanBuy",
  "regions",
] as const;

export type RecipeBoolKey = (typeof RECIPE_BOOL_KEYS)[number];
export type RecipeRangeKey = (typeof RECIPE_RANGE_KEYS)[number];
export type RecipeListKey = (typeof RECIPE_LIST_KEYS)[number];

export const RECIPE_LABELS: Record<RecipeBoolKey | RecipeRangeKey | RecipeListKey, string> = {
  clearTitle: "Clear title",
  runAndDrive: "Run and drive",
  itemsWithSaleDate: "Has a sale date",
  year: "Year",
  odometer: "Odometer",
  vehicleScore: "Vehicle score",
  buyNowPrice: "Buy now price",
  vehicleTypes: "Vehicle types",
  fuelTypes: "Fuel",
  transmissions: "Transmission",
  airbags: "Airbags",
  primaryDamages: "Primary damage",
  startCodes: "Start code",
  vehicleSubTypes: "Vehicle sub-types",
  cylinders: "Cylinders",
  drivelineTypes: "Drive line",
  bodyStyles: "Body style",
  exteriorColors: "Exterior color",
  interiorColors: "Interior color",
  countryOfOrigin: "Country of origin",
  lossTypes: "Loss type",
  titleSaleDocs: "Title / sale doc",
  featuredAuctions: "Featured auctions",
  whoCanBuy: "Who can buy",
  regions: "Regions",
};
