"use client";

import { Link } from "@/compat/router";
import { IconPencil, IconTrash } from "../../components/icons";
import { PowerToggle } from "../../components/PowerToggle";
import { Pill } from "../../components/Pill";
import { formatChicagoDate } from "../../date/chicago";
import { paths } from "../../routes/paths";
import type { WatchlistSummary } from "../../types/api";

export function WatchlistCards({
  rows,
  showOwner,
  onToggle,
  onSchedule,
  onEdit,
  onDelete,
}: {
  rows: WatchlistSummary[];
  showOwner?: boolean;
  onToggle: (row: WatchlistSummary) => void;
  onSchedule: (row: WatchlistSummary) => void;
  onEdit: (row: WatchlistSummary) => void;
  onDelete: (row: WatchlistSummary) => void;
}) {
  return (
    <ul className="space-y-2">
      {rows.map((row) => {
        const label = row.name || "Untitled";
        return (
          <li key={row.watchlistId} className="rounded-[8px] border border-hairline bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-medium text-ink">
                  {label.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <Link
                    to={paths.watchlist(row.watchlistId)}
                    className="block truncate font-medium hover:text-accent"
                  >
                    {label}
                  </Link>
                  {showOwner ? (
                    <p className="truncate text-xs text-muted">{row.username || row.userId}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted">
                    {row.filterCount ?? "—"} filters · {formatChicagoDate(row.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <PowerToggle
                  on={row.isActive}
                  label={row.isActive ? `Disable ${label}` : `Enable ${label}`}
                  onClick={() => onToggle(row)}
                />
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-muted hover:bg-surface-muted hover:text-ink"
                  aria-label={`Schedule ${label}`}
                  onClick={() => onSchedule(row)}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <circle cx="12" cy="12" r="8" />
                    <path d="M12 8v4.5l3 2" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-muted hover:bg-surface-muted hover:text-ink"
                  aria-label={`Edit ${label}`}
                  onClick={() => onEdit(row)}
                >
                  <IconPencil />
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-danger hover:bg-danger/10"
                  aria-label={`Delete ${label}`}
                  onClick={() => onDelete(row)}
                >
                  <IconTrash />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className={row.isActive ? "text-success" : "text-danger"}>{row.isActive ? "Active" : "Inactive"}</span>
              <WatchlistLastRun row={row} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function WatchlistLastRun({ row }: { row: WatchlistSummary }) {
  if (row.lastLogId) {
    return (
      <Link
        to={paths.activityLog(row.lastLogId, row.lastProcessingDate)}
        className="inline-flex"
        aria-label={`View latest activity for ${row.name || "watchlist"}`}
      >
        <Pill tone="neutral">View</Pill>
      </Link>
    );
  }
  if (row.lastRunStatus === "FAILED" || row.lastRunStatus === "ANALYSIS_FAILED") {
    return <span className="text-sm text-danger">Failed</span>;
  }
  return <span className="text-sm text-muted">Yet to run</span>;
}
