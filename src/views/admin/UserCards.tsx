"use client";

import { Pill } from "../../components/Pill";
import type { PublicUser } from "../../types/api";

export function UserCards({
  rows,
  onOpen,
}: {
  rows: PublicUser[];
  onOpen: (user: PublicUser) => void;
}) {
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.userId}>
          <button
            type="button"
            className="w-full rounded-[8px] border border-hairline bg-surface p-4 text-left hover:bg-surface-muted"
            onClick={() => onOpen(row)}
          >
            <p className="truncate font-medium break-words">{row.email}</p>
            <p className="truncate text-sm text-muted">{row.name || "No name"}{row.phoneNumber ? ` • ${row.phoneNumber}` : ""}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{row.role}</span>
              {row.isActive ? <Pill tone="success">Active</Pill> : <Pill tone="danger">Inactive</Pill>}
              <span className="tabular">
                {row.activeWatchlistCount ?? 0} / {row.watchlistCap} presets
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
