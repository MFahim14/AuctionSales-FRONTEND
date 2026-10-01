import { describe, expect, it } from "vitest";
import { DEFAULT_CARD_FIELDS, allCardFieldIds, formatCardValue } from "./cardFields";

describe("card fields", () => {
  it("defaults to the important sale-critical set", () => {
    expect(DEFAULT_CARD_FIELDS).toEqual([
      "stockNumber",
      "year",
      "titleDoc",
      "primaryDamage",
      "odometer",
      "vehicleScore",
      "startCode",
      "extColor",
      "intColor",
      "engine",
      "fuelType",
      "vin",
      "branch",
      "seller",
      "acv",
      "auctionDate",
      "buyNowPrice",
    ]);
  });

  it("covers every customize-list field once", () => {
    const ids = allCardFieldIds();
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("vin");
    expect(ids).toContain("titleDoc");
    expect(ids).toContain("acv");
  });

  it("formats odometer and money", () => {
    expect(formatCardValue({ stockNumber: "1", odometer: 3402 }, "odometer")).toBe("3,402 mi");
    expect(formatCardValue({ stockNumber: "1", acv: 19889 }, "acv")).toBe("$19,889");
  });
});
