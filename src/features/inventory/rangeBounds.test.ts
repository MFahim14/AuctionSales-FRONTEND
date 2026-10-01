import { describe, expect, it } from "vitest";
import { formatRangeValue, patchRange, recipeRangeBounds, sliderPair } from "./rangeBounds";
import { toInventorySearch } from "./query";

describe("recipe range sliders", () => {
  it("falls back when the recipe has no range", () => {
    const year = recipeRangeBounds({}, "year");
    expect(year.min).toBe(1990);
    expect(year.max).toBeGreaterThanOrEqual(2026);
    expect(recipeRangeBounds({}, "odo")).toEqual({ min: 0, max: 250_000 });
    expect(recipeRangeBounds({}, "score")).toEqual({ min: 0, max: 50 });
  });

  it("uses recipe min and max when present", () => {
    expect(recipeRangeBounds({ year: { min: 2018, max: 2024 } }, "year")).toEqual({ min: 2018, max: 2024 });
  });

  it("omits URL params while thumbs sit on the bounds", () => {
    const bounds = { min: 2018, max: 2024 };
    const atBounds = patchRange({ limit: 25 }, bounds, "year", { lo: 2018, hi: 2024 });
    const params = toInventorySearch(atBounds, false);
    expect(params.get("yearMin")).toBeNull();
    expect(params.get("yearMax")).toBeNull();
    const moved = patchRange({ limit: 25 }, bounds, "year", { lo: 2020, hi: 2024 });
    expect(toInventorySearch(moved, false).get("yearMin")).toBe("2020");
    expect(toInventorySearch(moved, false).get("yearMax")).toBeNull();
  });

  it("reads stored thumbs or the recipe bounds", () => {
    const bounds = { min: 0, max: 50 };
    expect(sliderPair({ limit: 25 }, bounds, "score")).toEqual({ lo: 0, hi: 50 });
    expect(sliderPair({ limit: 25, scoreMin: "10", scoreMax: "40" }, bounds, "score")).toEqual({ lo: 10, hi: 40 });
  });

  it("formats odometer with miles", () => {
    expect(formatRangeValue("odo", 3402)).toBe("3,402 mi");
    expect(formatRangeValue("year", 2020)).toBe("2020");
  });
});
