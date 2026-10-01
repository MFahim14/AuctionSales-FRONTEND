import { describe, expect, it } from "vitest";
import { sliceClientPage } from "./clientPage";

describe("client page slice", () => {
  it("pages a fetched list without asking the API for a cursor", () => {
    const rows = Array.from({ length: 30 }, (_, index) => index + 1);
    const first = sliceClientPage(rows, 1, 25);
    expect(first.items).toEqual(rows.slice(0, 25));
    expect(first.pageCount).toBe(2);
    const second = sliceClientPage(rows, 2, 25);
    expect(second.items).toEqual(rows.slice(25));
    expect(second.page).toBe(2);
  });

  it("clamps past the last slice", () => {
    const next = sliceClientPage(["a", "b"], 9, 25);
    expect(next.page).toBe(1);
    expect(next.items).toEqual(["a", "b"]);
  });
});
