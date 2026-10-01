"use client";

import type { ReactNode } from "react";
import { useNavigate } from "@/compat/router";
import { Table, type Column } from "../../components/Table";
import { formatClock } from "../../date/chicago";
import { paths } from "../../routes/paths";
import type { ActivityLog } from "../../types/api";
import { StatusBadge } from "../watchlists/StatusBadge";
import { LogCards } from "./LogCards";

export function LogTable({
  rows,
  showOwner,
}: {
  rows: ActivityLog[];
  showOwner: boolean;
}) {
  const navigate = useNavigate();
  const columns: Array<Column<ActivityLog>> = [
    {
      key: "when",
      header: "Chicago time",
      cell: (row) => (
        <span className="tabular">{formatClock(row.completedAt || row.startedAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Result",
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];
  if (showOwner) {
    columns.push({
      key: "owner",
      header: "Desk",
      cell: (row) => (
        <span>
          {row.username || "—"}
          <span className="block text-xs text-muted">{row.userId}</span>
        </span>
      ),
    });
  }
  columns.push(
    {
      key: "watchlist",
      header: "Watchlist",
      cell: (row) => (
        <span className="font-medium">{row.watchlistName || row.watchlistId.slice(0, 8)}</span>
      ),
    },
    {
      key: "email",
      header: "Email sent",
      cell: (row) => (
        <span className={row.emailSent ? "text-success" : "text-muted"}>
          {row.emailSent ? "Sent" : "No"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <span className="flex justify-end gap-1">
          {row.status === "COMPLETED" ? (
            <RowIcon label="View top picks" onClick={() => navigate(paths.activityLog(row.logId, row.processingDate))}>
              <path d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7z" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" />
            </RowIcon>
          ) : null}
        </span>
      ),
    },
  );

  return (
    <>
      <div className="lg:hidden">
        <LogCards
          rows={rows}
          showOwner={showOwner}
          onView={(row) => navigate(paths.activityLog(row.logId, row.processingDate))}
        />
      </div>
      <div className="hidden min-w-0 lg:block">
        <Table columns={columns} rows={rows} rowKey={(row) => row.logId} />
      </div>
    </>
  );
}

function RowIcon({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-muted hover:bg-surface-muted hover:text-ink"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        {children}
      </svg>
    </button>
  );
}
