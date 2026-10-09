"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPreset, listPresets } from "../../api/presets";
import { IconTool } from "../../components/IconTool";
import { FairOrb } from "../../components/orb/FairOrb";
import { Spinner } from "../../components/Spinner";
import type { InventoryQuery } from "./query";
import { recipeToQuery } from "./presetBridge";

export function FilterLoadModal({
  open,
  query,
  onLoad,
  onClose,
}: {
  open: boolean;
  query: InventoryQuery;
  onLoad: (next: InventoryQuery) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const watchlists = useQuery({
    queryKey: ["watchlists"],
    queryFn: () => listPresets(),
    staleTime: 15_000,
    enabled: open,
  });

  // Fetch the full watchlist detail (which includes payload) when user clicks
  const detailQuery = useQuery({
    queryKey: ["watchlist", loadingId],
    queryFn: () => getPreset(loadingId!),
    enabled: Boolean(loadingId),
    staleTime: 0,
  });

  useEffect(() => {
    if (detailQuery.data && loadingId) {
      const payload = detailQuery.data.payload;
      onLoad(recipeToQuery(payload as string | undefined, query));
      setLoadingId(null);
      onClose();
    }
  }, [detailQuery.data, loadingId, onLoad, query, onClose]);

  useEffect(() => {
    if (!open) { setLoadingId(null); return; }
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus(); };
  }, [open, onClose]);

  if (!open) return null;

  const active = (watchlists.data ?? []).filter((r) => r.isActive);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-scrim p-4 backdrop-blur-[10px]" role="presentation" onClick={onClose}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="load-wl-title"
        className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-[8px] border border-hairline bg-surface p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="load-wl-title" className="font-serif text-xl text-ink">Apply preset</h2>
            <p className="mt-1 text-sm text-muted">Select an active preset to apply its filters.</p>
          </div>
          <IconTool label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </IconTool>
        </div>
        <div className="mt-5">
          {watchlists.isLoading ? <FairOrb state="working" place="panel" /> : null}
          {watchlists.error ? <p className="text-sm text-danger">{watchlists.error.message}</p> : null}
          {detailQuery.error ? <p className="text-sm text-danger">Failed to load filters. Try again.</p> : null}
          {!watchlists.isLoading && active.length === 0 ? (
            <p className="text-sm text-muted">No active presets yet.</p>
          ) : null}
          {active.length > 0 ? (
            <ul className="space-y-1">
              {active.map((row) => (
                <li key={row.watchlistId}>
                  <button
                    type="button"
                    disabled={loadingId === row.watchlistId}
                    className="flex w-full items-center gap-3 rounded-[8px] border border-hairline bg-surface px-3 py-2.5 text-left hover:bg-surface-muted disabled:opacity-50"
                    onClick={() => setLoadingId(row.watchlistId)}
                  >
                    {loadingId === row.watchlistId ? (
                      <Spinner />
                    ) : (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">{row.name || "Untitled"}</span>
                    {row.filterCount ? (
                      <span className="shrink-0 text-[11px] tabular text-muted">{row.filterCount} filters</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
