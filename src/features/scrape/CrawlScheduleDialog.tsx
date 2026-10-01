"use client";

import { useEffect, useState } from "react";
import { Dialog } from "../../components/Dialog";
import { Field } from "../../components/Field";
import { Input } from "../../components/Input";
import type { CrawlSchedule } from "../../types/api";
import { SchedulePanel, cronToSchedule, schedulePreview, scheduleToCron, type ScheduleDraft } from "../watchlists/SchedulePanel";

export function CrawlScheduleDialog({
  open,
  initial,
  pending,
  error,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: CrawlSchedule | null;
  pending: boolean;
  error: string;
  onClose: () => void;
  onSave: (body: { name: string; enabled?: boolean; cronExpression: string; timezone: string }) => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [draft, setDraft] = useState<ScheduleDraft>(() => cronToSchedule(initial));
  useEffect(() => {
    setName(initial?.name || "");
    setDraft(cronToSchedule(initial));
  }, [initial, open]);

  return (
    <Dialog
      open={open}
      title={initial ? "Edit schedule" : "Add schedule"}
      confirmLabel={initial ? "Save" : "Add schedule"}
      pending={pending}
      confirmDisabled={!name.trim()}
      onClose={onClose}
      onConfirm={() =>
        onSave({
          name: name.trim(),
          cronExpression: scheduleToCron(draft),
          timezone: "America/Chicago",
          ...(initial ? {} : { enabled: true }),
        })
      }
    >
      <Field label="Name" htmlFor="schedule-name">
        <Input id="schedule-name" value={name} onChange={(event) => setName(event.target.value)} />
      </Field>
      <div className="mt-4">
        <SchedulePanel value={draft} onChange={setDraft} />
      </div>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
    </Dialog>
  );
}

export function scheduleLabel(row: CrawlSchedule): string {
  return schedulePreview(cronToSchedule(row));
}

export function PlusButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-hairline bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-muted"
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
      Add schedule
    </button>
  );
}
