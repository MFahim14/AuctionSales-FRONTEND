"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { patchPreset } from "../../api/presets";
import { Dialog } from "../../components/Dialog";
import type { WatchlistSummary } from "../../types/api";
import { SchedulePanel, cronToSchedule, scheduleToCron } from "./SchedulePanel";

export function PresetScheduleDialog({
  row,
  onClose,
}: {
  row: WatchlistSummary | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(() => cronToSchedule(row?.schedule));
  const [error, setError] = useState("");
  useEffect(() => {
    setDraft(cronToSchedule(row?.schedule));
    setError("");
  }, [row]);
  const save = useMutation({
    mutationFn: () => {
      if (!row) {
        throw new Error("Preset is missing.");
      }
      return patchPreset(row.watchlistId, {
        schedule: {
          cronExpression: scheduleToCron(draft),
          timezone: "America/Chicago",
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      onClose();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not update the schedule."),
  });

  return (
    <Dialog
      open={Boolean(row)}
      title={row?.name ? `${row.name} schedule` : "Preset schedule"}
      confirmLabel="Update schedule"
      pending={save.isPending}
      onClose={onClose}
      onConfirm={() => save.mutate()}
    >
      <SchedulePanel value={draft} onChange={setDraft} />
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
    </Dialog>
  );
}
