import type { RecipeListKey, RecipeRangeKey } from "../../types/filters";

/** Hardcoded known IAAI option values for every list filter.
 *  Used by RecipePage so checkboxes appear even when the recipe
 *  doesn't yet carry a preselected list for that field.
 */
export const IAAI_OPTIONS: Partial<Record<RecipeListKey, string[]>> = {
  vehicleTypes: [
    "Automobiles", "SUVs", "Pick-up Trucks", "Vans", "Light Trucks",
    "Heavy Duty Trucks", "Fleet Vehicles", "Rental Vehicles",
  ],
  vehicleSubTypes: [
    "ATV", "Motor Home", "Travel Trailer", "Side By Side",
    "Snowmobile", "Personal Watercraft", "Dirt Bike",
  ],
  startCodes: ["Run & Drive", "Starts", "Stationary", "Can't Test"],
  fuelTypes: ["Gasoline", "Hybrid", "Electric", "Diesel", "Flexible Fuel"],
  cylinders: ["3 Cyl", "4 Cyl", "6 Cyl", "8 Cyl", "10 Cyl", "12 Cyl"],
  transmissions: ["Automatic", "CVT", "Manual", "Missing", "Unknown"],
  drivelineTypes: [
    "All-Wheel Drive", "Four Wheel Drive", "Front Wheel Drive", "Rear Wheel Drive",
  ],
  bodyStyles: [
    "Sedan", "SUV", "Coupe", "Crew Cab", "Hatchback",
    "Cargo Van", "Minivan", "Regular Cab", "Convertible",
  ],
  exteriorColors: [
    "Black", "White", "Silver", "Blue", "Red", "Gray",
    "Green", "Beige", "Burgundy", "Gold", "Orange", "Yellow",
  ],
  interiorColors: ["Black", "Gray", "Beige", "Brown", "Tan", "White", "Red"],
  countryOfOrigin: [
    "United States", "Japan", "Germany", "South Korea",
    "Mexico", "Canada", "United Kingdom", "Sweden",
  ],
  airbags: ["Intact", "Deployed"],
  lossTypes: ["Collision", "Hail", "Flood", "Theft", "Fire", "Water", "Vandalism", "Other"],
  titleSaleDocs: ["Clear", "Salvage", "Repairable", "Non-Repairable", "Parts Only", "Bill Of Sale"],
  primaryDamages: [
    "Rear", "Front End", "Front & Rear", "Hail", "Left & Right Side",
    "Left Front", "Left Rear", "Left Side", "Normal Wear & Tear",
    "Right Front", "Right Rear", "Right Side", "All Over",
    "Undercarriage", "Rollover", "Flood", "Mechanical", "Electrical",
  ],
  featuredAuctions: [
    "Gov Auctions", "Dream Rides", "Electric Vehicle Auctions",
    "Rec Rides", "Specialty", "Virtual Lane",
  ],
  whoCanBuy: [
    "Available to the public", "Dealer", "Dismantler",
    "Exporter", "Rebuilder", "Scrapper",
  ],
  regions: [
    "East", "Midwest", "North", "Northeast", "Northwest",
    "South", "Southeast", "Southwest", "West", "Alaska", "Hawaii",
  ],
};

export const IAAI_RANGE_BOUNDS: Partial<Record<RecipeRangeKey, { min: number; max: number; step: number }>> = {
  year: { min: 1990, max: 2030, step: 1 },
  odometer: { min: 0, max: 250000, step: 500 },
  vehicleScore: { min: 0, max: 50, step: 1 },
  buyNowPrice: { min: 0, max: 100000, step: 500 },
};

export function fmtRange(key: RecipeRangeKey, val: number): string {
  if (key === "odometer") return `${val.toLocaleString("en-US")} mi`;
  if (key === "buyNowPrice") return `$${val.toLocaleString("en-US")}`;
  return String(val);
}
