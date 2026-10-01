"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@/compat/router";
import { deletePreset, patchPreset } from "../../api/presets";
import { Dialog } from "../../components/Dialog";
import { PowerToggle } from "../../components/PowerToggle";
import { IconPencil, IconTrash } from "../../components/icons";
import { Table, type Column } from "../../components/Table";
import { formatChicagoDate } from "../../date/chicago";
import { paths } from "../../routes/paths";
import type { WatchlistSummary } from "../../types/api";
import { PresetScheduleDialog } from "./PresetScheduleDialog";
import { WatchlistCards, WatchlistLastRun } from "./WatchlistCards";

export function WatchlistTable({
  rows,
  showOwner = false,
}: {
  rows: WatchlistSummary[];
  showOwner?: boolean;
  allowReorder?: boolean;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<WatchlistSummary | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [scheduleRow, setScheduleRow] = useState<WatchlistSummary | null>(null);
  const remove = useMutation({
    mutationFn: (watchlistId: string) => deletePreset(watchlistId),
    onSuccess: async () => {
      setPending(null);
      setDeleteError("");
      await queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => setDeleteError(err instanceof Error ? err.message : "Could not delete the preset."),
  });
  const toggle = useMutation({
    mutationFn: (row: WatchlistSummary) => {
      const next = !row.isActive;
      return patchPreset(row.watchlistId, {
        isActive: next,
        schedule: {
          enabled: next,
          cronExpression: row.schedule?.cronExpression || "cron(0 8 * * ? *)",
          timezone: "America/Chicago",
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const columns: Array<Column<WatchlistSummary>> = [
    {
      key: "name",
      header: "Name",
      cell: (row) => {
        const label = row.name || "Untitled";
        return (
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-medium text-ink">
              {label.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0">
              <Link to={paths.watchlist(row.watchlistId)} className="block font-medium hover:text-accent">
                {label}
              </Link>
              {showOwner ? (
                <span className="block truncate text-xs text-muted">{row.username || row.userId}</span>
              ) : null}
            </span>
          </span>
        );
      },
    },
    {
      key: "filters",
      header: "Filters",
      className: "tabular",
      cell: (row) => row.filterCount ?? "—",
    },
    {
      key: "added",
      header: "Added",
      cell: (row) => formatChicagoDate(row.createdAt),
    },
    {
      key: "lastRun",
      header: "Last run",
      cell: (row) => <WatchlistLastRun row={row} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <span className={row.isActive ? "text-success" : "text-danger"}>{row.isActive ? "Active" : "Inactive"}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (row) => (
          <span className="flex justify-end gap-1">
            <PowerToggle
              on={row.isActive}
              label={row.isActive ? `Disable ${row.name || "preset"}` : `Enable ${row.name || "preset"}`}
              onClick={() => toggle.mutate(row)}
            />
            <RowIcon
              label={`Schedule ${row.name || "preset"}`}
              onClick={() => setScheduleRow(row)}
            >
              <ClockIcon />
            </RowIcon>
            <RowIcon
              label={`Edit ${row.name || "preset"}`}
              onClick={() => navigate(paths.watchlistEdit(row.watchlistId))}
            >
              <IconPencil />
            </RowIcon>
            <RowIcon
              label={`Delete ${row.name || "preset"}`}
              danger
              onClick={() => {
                setDeleteError("");
                setPending(row);
              }}
            >
              <IconTrash />
            </RowIcon>
          </span>
      ),
    },
  ];

  return (
    <>
      <div className="lg:hidden">
        <WatchlistCards
          rows={rows}
          showOwner={showOwner}
          onToggle={(row) => toggle.mutate(row)}
          onSchedule={setScheduleRow}
          onEdit={(row) => navigate(paths.watchlistEdit(row.watchlistId))}
          onDelete={(row) => {
            setDeleteError("");
            setPending(row);
          }}
        />
      </div>
      <div className="hidden min-w-0 lg:block">
        <Table columns={columns} rows={rows} rowKey={(row) => row.watchlistId} />
      </div>
      <Dialog
        open={Boolean(pending)}
        title="Delete this preset?"
        danger
        confirmLabel="Delete"
        pending={remove.isPending}
        onClose={() => {
          if (remove.isPending) {
            return;
          }
          setDeleteError("");
          setPending(null);
        }}
        onConfirm={() => {
          if (pending) {
            remove.mutate(pending.watchlistId);
          }
        }}
      >
      {pending?.name || "This preset"} will be deleted. An in-flight desk run keeps the payload it already claimed.
      {deleteError ? <p className="text-danger">{deleteError}</p> : null}
      </Dialog>
      <PresetScheduleDialog row={scheduleRow} onClose={() => setScheduleRow(null)} />
    </>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 2" strokeLinecap="round" />
    </svg>
  );
}

function RowIcon({
  label,
  onClick,
  danger,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`inline-flex h-8 w-8 items-center justify-center rounded-[8px] ${
        danger ? "text-danger hover:bg-danger/10" : "text-muted hover:bg-surface-muted hover:text-ink"
      } disabled:opacity-30`}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
