"use client";

import { useQuery } from "@tanstack/react-query";
import { listPresets } from "../../api/presets";
import { FairOrb } from "../../components/orb/FairOrb";
import type { InventoryQuery } from "./query";
import { recipeToQuery } from "./presetBridge";

export function FilterLoadPanel({
  query,
  onLoad,
}: {
  query: InventoryQuery;
  onLoad: (next: InventoryQuery) => void;
}) {
  const watchlists = useQuery({
    queryKey: ["watchlists"],
    queryFn: () => listPresets(),
    staleTime: 15_000,
  });

  const rows = watchlists.data ?? [];

  if (watchlists.isLoading) {
    return <FairOrb state="working" place="panel" />;
  }
  if (watchlists.error) {
    return <p className="text-xs text-danger">{watchlists.error.message}</p>;
  }
  if (rows.length === 0) {
    return <p className="text-xs text-muted">No presets yet.</p>;
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-ink">Apply preset</p>
      <ul className="max-h-40 overflow-y-auto rounded-[8px] border border-hairline bg-canvas p-1">
        {rows.map((row) => (
          <li key={row.watchlistId}>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-left hover:bg-surface-muted"
              onClick={() => onLoad(recipeToQuery((row as { payload?: unknown }).payload as string | undefined, query))}
            >
              <span className="truncate text-[13px] text-ink">{row.name || "Untitled"}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
