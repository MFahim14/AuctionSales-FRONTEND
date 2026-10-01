import { describe, expect, it } from "vitest";
import { inventoryFacetCount, inventoryHasFilters, PAGE_SIZES, parseInventorySearch, toInventorySearch } from "./query";

describe("inventory query", () => {
  it("round-trips list filters and page size", () => {
    const parsed = parseInventorySearch("?limit=50&q=kia&vehicleTypes=SUVs,Automobiles&yearMin=2023");
    expect(parsed.limit).toBe(50);
    expect(parsed.modelContains).toBe("kia");
    expect(parsed.vehicleTypes).toEqual(["SUVs", "Automobiles"]);
    expect(parsed.yearMin).toBe("2023");
    const next = toInventorySearch({ ...parsed, cursor: "abc" }, false);
    expect(next.get("cursor")).toBeNull();
    expect(next.get("vehicleTypes")).toBe("SUVs,Automobiles");
  });

  it("clamps invalid limit to 25", () => {
    expect(parseInventorySearch("?limit=7").limit).toBe(25);
  });

  it("serializes one page at a time without a load-more cursor", () => {
    const first = toInventorySearch({ limit: 25 }, true);
    expect(first.get("cursor")).toBeNull();
    const next = toInventorySearch({ limit: 50, cursor: "page-2" }, false);
    expect(next.get("cursor")).toBeNull();
    expect(next.get("limit")).toBe("50");
  });

  it("treats search and range chips as active filters", () => {
    expect(inventoryHasFilters({ limit: 25 })).toBe(false);
    expect(inventoryHasFilters({ limit: 25, modelContains: "kia" })).toBe(true);
    expect(inventoryHasFilters({ limit: 25, yearMin: "2020" })).toBe(true);
  });

  it("counts facets without the search box", () => {
    expect(inventoryFacetCount({ limit: 25, modelContains: "kia" })).toBe(0);
    expect(inventoryFacetCount({ limit: 25, vehicleTypes: ["SUVs"], yearMin: "2020" })).toBe(2);
  });

  it("exposes 25 50 100 and drops the cursor when page size changes", () => {
    expect(PAGE_SIZES).toEqual([10, 25, 50, 100]);
    const next = toInventorySearch({ limit: 100, cursor: "page-2", yearMin: "2020" }, false);
    expect(next.get("cursor")).toBeNull();
    expect(next.get("limit")).toBe("100");
  });
});
