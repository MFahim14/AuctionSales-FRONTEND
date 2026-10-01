import { describe, expect, it } from "vitest";
import { paths, recipeRedirectTo } from "./paths";

describe("historyLog", () => {
  it("puts logId in the query so # is not a hash fragment", () => {
    const href = paths.historyLog("exec#watchlist", "2026-09-21");
    expect(href.startsWith("/app/history?")).toBe(true);
    expect(href.includes("#")).toBe(false);
    const params = new URLSearchParams(href.slice(href.indexOf("?") + 1));
    expect(params.get("log")).toBe("exec#watchlist");
    expect(params.get("date")).toBe("2026-09-21");
  });
});

describe("inventory paths", () => {
  it("encodes stock numbers", () => {
    expect(paths.inventoryItem("12 3")).toBe("/app/inventory/12%203");
  });
});

describe("recipe redirect", () => {
  it("sends settings bookmarks toward crawler runs", () => {
    expect(paths.adminSettings).toBe("/admin/settings");
    expect(recipeRedirectTo()).toBe("/admin/schedules");
  });
});

