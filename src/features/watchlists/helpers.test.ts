import { describe, expect, it } from "vitest";
import type { MeUser } from "../../types/api";
import { countFilters, watchlistCreateBlock } from "./helpers";
import { paths } from "../../routes/paths";

function me(overrides: Partial<MeUser> = {}): MeUser {
  return {
    userId: "u1",
    email: "a@b.c",
    role: "User",
    watchlistCap: 5,
    isActive: true,
    activeWatchlistCount: 0,
    emailOnZeroMatches: false,
    ...overrides,
  };
}

describe("watchlistCreateBlock", () => {
  it("does not require IAAI credentials", () => {
    expect(watchlistCreateBlock(me()).blocked).toBe(false);
  });

  it("blocks inactive accounts", () => {
    expect(watchlistCreateBlock(me({ isActive: false })).blocked).toBe(true);
  });

  it("blocks when the active cap is full", () => {
    const block = watchlistCreateBlock(me({ watchlistCap: 2, activeWatchlistCount: 2 }));
    expect(block.blocked).toBe(true);
    expect(block.href).toBe(paths.watchlists);
  });
});

describe("countFilters", () => {
  it("counts recipe lists, ranges, and true booleans", () => {
    expect(
      countFilters({
        vehicleTypes: ["SUVs"],
        fuelTypes: [],
        clearTitle: true,
        year: { min: 2022, max: 2026 },
      }),
    ).toBe(3);
  });
});
