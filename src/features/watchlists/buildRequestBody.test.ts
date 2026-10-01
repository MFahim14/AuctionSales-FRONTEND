import { describe, expect, it } from "vitest";
import { buildRequestBody } from "./buildRequestBody";
import { emptyFormState } from "./formState";
import type { RecipeFilters } from "../../types/filters";

const recipe: RecipeFilters = {
  clearTitle: true,
  year: { min: 2022, max: 2027 },
  odometer: { min: 0, max: 50000 },
  vehicleTypes: ["SUVs", "Automobiles"],
  fuelTypes: ["Gasoline"],
};

describe("buildRequestBody", () => {
  it("emits an empty payload from the empty form", () => {
    expect(buildRequestBody(emptyFormState(), recipe)).toEqual({});
  });

  it("keeps only recipe keys and omits empty lists", () => {
    const body = buildRequestBody(
      {
        ...emptyFormState(),
        clearTitle: true,
        vehicleTypes: ["SUVs", "Boat"],
        fuelTypes: [],
        year: { min: "2023", max: "" },
      },
      recipe,
    );
    expect(body.clearTitle).toBe(true);
    expect(body.vehicleTypes).toEqual(["SUVs"]);
    expect(body.fuelTypes).toBeUndefined();
    expect(body.year).toEqual({ min: 2023 });
    expect(body.runAndDrive).toBeUndefined();
  });
});
