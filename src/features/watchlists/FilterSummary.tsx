"use client";

import type { RecipeFilters } from "../../types/filters";
import { Pill } from "../../components/Pill";
import { RECIPE_LABELS } from "../../types/filters";

export function FilterSummary({ payload }: { payload?: RecipeFilters | string }) {
  if (!payload || typeof payload === "string") {
    return <p className="text-sm text-muted">Filters unavailable.</p>;
  }
  const chips: string[] = [];
  for (const [key, value] of Object.entries(payload)) {
    const label = RECIPE_LABELS[key as keyof typeof RECIPE_LABELS] || key;
    if (Array.isArray(value) && value.length > 0) {
      chips.push(`${label}: ${value.join(", ")}`);
    } else if (typeof value === "string" && value) {
      chips.push(`${label}: ${value}`);
    } else if (value && typeof value === "object") {
      const lo = "min" in value ? value.min : undefined;
      const hi = "max" in value ? value.max : undefined;
      chips.push(`${label}: ${lo ?? "…"}–${hi ?? "…"}`);
    } else if (value === true) {
      chips.push(label);
    }
  }
  if (chips.length === 0) {
    return <p className="text-sm text-muted">No extra filters — recipe defaults.</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <Pill key={chip}>{chip}</Pill>
      ))}
    </div>
  );
}
