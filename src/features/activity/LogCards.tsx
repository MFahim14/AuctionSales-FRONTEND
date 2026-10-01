"use client";

import { StatusBadge } from "../watchlists/StatusBadge";
import { formatClock } from "../../date/chicago";
import type { ActivityLog } from "../../types/api";

export function LogCards({
  rows,
  showOwner,
  onView,
}: {
  rows: ActivityLog[];
  showOwner: boolean;
  onView: (row: ActivityLog) => void;
}) {
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.logId} className="rounded-[8px] border border-hairline bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium">
                {row.watchlistName || row.watchlistId.slice(0, 8)}
              </p>
              {showOwner ? (
                <p className="truncate text-xs text-muted">{row.username || row.userId}</p>
              ) : null}
              <p className="mt-1 text-xs tabular text-muted">
                {formatClock(row.completedAt || row.startedAt)}
              </p>
            </div>
            <StatusBadge status={row.status} />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className={row.emailSent ? "text-success" : "text-muted"}>
              {row.emailSent ? "Email sent" : "No email"}
            </span>
            {row.status === "COMPLETED" ? (
              <button
                type="button"
                className="rounded-[8px] px-2 py-1 text-sm font-medium text-accent hover:bg-surface-muted"
                onClick={() => onView(row)}
              >
                Picks
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
