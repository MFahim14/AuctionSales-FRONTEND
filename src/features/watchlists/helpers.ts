import type { MeUser } from "../../types/api";
import type { RecipeFilters } from "../../types/filters";
import { paths } from "../../routes/paths";

export function countFilters(payload?: RecipeFilters | string | null): number {
  if (!payload || typeof payload === "string") {
    return 0;
  }
  let total = 0;
  for (const value of Object.values(payload)) {
    if (value === true) {
      total += 1;
    } else if (typeof value === "string" && value) {
      total += 1;
    } else if (Array.isArray(value) && value.length > 0) {
      total += 1;
    } else if (
      value &&
      typeof value === "object" &&
      Object.values(value).some((part) => part !== undefined && part !== null && part !== "")
    ) {
      total += 1;
    }
  }
  return total;
}

export function watchlistCreateBlock(me?: MeUser): { blocked: boolean; reason?: string; href?: string } {
  if (!me) {
    return { blocked: true, reason: "Loading account…" };
  }
  if (me.isActive === false) {
    return { blocked: true, reason: "This account cannot create or activate watchlists. Ask an Admin." };
  }
  const cap = me.watchlistCap ?? 5;
  const active = me.activeWatchlistCount ?? 0;
  if (active >= cap) {
    return {
      blocked: true,
      reason: "Active watchlist cap is full. Turn one off, or ask an Admin to raise the cap.",
      href: paths.watchlists,
    };
  }
  return { blocked: false };
}

export const POLLING_STATUSES = new Set(["PROCESSING", "SCRAPED", "ANALYZING"]);
