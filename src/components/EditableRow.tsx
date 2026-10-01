"use client";

import type { ReactNode } from "react";
import { IconPencil } from "./icons";

export function EditableRow({
  label,
  value,
  hint,
  onEdit,
}: {
  label: string;
  value: string;
  hint?: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <StaticRow label={label} hint={hint}>
        {value || "—"}
      </StaticRow>
      <button
        type="button"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-muted hover:bg-surface-muted hover:text-ink"
        aria-label={`Edit ${label}`}
        title={`Edit ${label}`}
        onClick={onEdit}
      >
        <IconPencil />
      </button>
    </div>
  );
}

export function StaticRow({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-ink">{label}</p>
      <div className="mt-1.5 truncate text-sm text-ink">{children}</div>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
