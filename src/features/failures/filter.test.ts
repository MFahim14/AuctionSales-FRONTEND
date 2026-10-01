import { describe, expect, it } from "vitest";
import { toFailureSearch } from "../../api/scrape";
import { PAGE_SIZES } from "../inventory/query";
import { failureFilterLabel } from "./query";

describe("page sizes", () => {
  it("exposes 25 50 100 for inventory and presets", () => {
    expect(PAGE_SIZES).toEqual([10, 25, 50, 100]);
  });
});

describe("failures filter params", () => {
  it("omits All and empty status", () => {
    const params = toFailureSearch({ source: "all" });
    expect(params.toString()).toBe("");
  });

  it("sends source and status to GET /admin/failures", () => {
    const params = toFailureSearch({ source: "scrape", status: "FAILED", cursor: "abc" });
    expect(params.get("source")).toBe("scrape");
    expect(params.get("status")).toBe("FAILED");
    expect(params.get("cursor")).toBe("abc");
  });

  it("labels the pill All, Desk, or Scrape · FAILED", () => {
    expect(failureFilterLabel("all", "")).toBe("All");
    expect(failureFilterLabel("desk", "")).toBe("Desk");
    expect(failureFilterLabel("scrape", "FAILED")).toBe("Scrape · FAILED");
  });
});
