"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getHistory } from "../../api/history";
import { Button } from "../../components/Button";
import { Spinner } from "../../components/Spinner";
import { formatChicagoDate, formatClock } from "../../date/chicago";
import { asTopPicks, TopPicksList } from "../watchlists/TopPicksList";

export function ActivityPicksModal({
  logId,
  onClose,
}: {
  logId: string;
  onClose: () => void;
}) {
  const detail = useQuery({
    queryKey: ["log", logId],
    queryFn: () => getHistory(logId),
    enabled: Boolean(logId),
  });
  const item = detail.data;
  const picks = asTopPicks(item?.topPicks);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-scrim p-3 backdrop-blur-[10px] sm:items-center sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-picks-title"
        className="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[14px] border border-hairline bg-surface shadow-[0_20px_60px_rgba(20,16,12,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Top picks</p>
            <h2 id="activity-picks-title" className="mt-1 font-serif text-2xl tracking-[-0.03em] text-ink">
              {item?.watchlistName || "Activity"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {[
                item?.username,
                item?.processingDate
                  ? formatChicagoDate(item.processingDate)
                  : formatChicagoDate(item?.completedAt || item?.startedAt),
                formatClock(item?.completedAt || item?.startedAt),
              ]
                .filter((part) => part && part !== "—")
                .join(" · ")}
            </p>
          </div>
          <Button variant="secondary" className="h-9 shrink-0 px-3" onClick={onClose}>
            Close
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {detail.isLoading ? <Spinner label="Loading picks" /> : null}
          {detail.error ? <p className="text-sm text-danger">{detail.error.message}</p> : null}
          {item && picks.length === 0 && !detail.isLoading ? (
            <p className="rounded-[10px] border border-dashed border-hairline bg-surface-muted px-4 py-8 text-center text-sm text-muted">
              No top picks stored for this run.
            </p>
          ) : null}
          <TopPicksList picks={picks} />
        </div>
      </div>
    </div>
  );
}
