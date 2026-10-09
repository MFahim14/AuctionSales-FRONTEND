"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@/compat/router";
import { useState } from "react";
import { deletePreset, getPreset } from "../../api/presets";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Dialog } from "../../components/Dialog";
import { IconPencil, IconTrash } from "../../components/icons";
import { FairOrb } from "../../components/orb/FairOrb";
import { formatChicagoLong, formatWhen } from "../../date/chicago";
import { FilterSummary } from "../../features/watchlists/FilterSummary";
import { asTopPicks, TopPicksList } from "../../features/watchlists/TopPicksList";
import { WatchlistLastRun } from "../../features/watchlists/WatchlistCards";
import { cronToSchedule, schedulePreview } from "../../features/watchlists/SchedulePanel";
import { paths } from "../../routes/paths";
import type { RecipeFilters } from "../../types/filters";

function runCopy(status?: string, errorMessage?: string, llmFallback?: boolean): string {
  if (!status) {
    return "Not claimed yet. If this preset is enabled, the next Chicago run will pick it up.";
  }
  if (status === "COMPLETED" && llmFallback) {
    return "Ranking was skipped. Open History for the run.";
  }
  if (status === "FAILED" || status === "ANALYSIS_FAILED") {
    return errorMessage || status || "Failed";
  }
  if (status === "COMPLETED") {
    return "Latest run finished. Open History for picks.";
  }
  if (status === "SKIPPED") {
    return "That run was skipped because the watchlist was removed mid-drain.";
  }
  return "Open History for the latest run.";
}

export function WatchlistDetailPage() {
  const { watchlistId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const watchlist = useQuery({
    queryKey: ["watchlist", watchlistId],
    queryFn: () => getPreset(watchlistId),
    enabled: Boolean(watchlistId),
  });
  const remove = useMutation({
    mutationFn: () => deletePreset(watchlistId),
    onSuccess: async () => {
      setConfirmDelete(false);
      await queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate(paths.watchlists);
    },
  });

  if (watchlist.isLoading) {
    return <FairOrb state="working" />;
  }
  if (watchlist.error) {
    return (
      <Card>
        <p className="text-sm text-danger">{watchlist.error.message}</p>
        <Button className="mt-3" variant="secondary" onClick={() => navigate(paths.watchlists)}>
          Back to presets
        </Button>
      </Card>
    );
  }
  const item = watchlist.data;
  if (!item) {
    return (
      <Card>
        Preset not found.{" "}
        <Link to={paths.watchlists} className="text-accent">
          Back to list
        </Link>
      </Card>
    );
  }

  const picks = asTopPicks(item.topPicks);
  const payload = typeof item.payload === "object" ? (item.payload as RecipeFilters) : undefined;

  return (
    <div className="space-y-5">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={paths.watchlists}
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Presets
          </Link>
          <h1 className="mt-2 font-serif text-[28px] leading-9 tracking-[-0.03em] break-words lg:text-[34px] lg:leading-10">
            {item.name || "Untitled"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {[
              item.username || item.userId,
              item.lastProcessingDate ? `last Chicago day ${formatChicagoLong(item.lastProcessingDate)}` : "",
              item.updatedAt ? `updated ${formatWhen(item.updatedAt)}` : "",
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-[8px] text-muted hover:bg-surface-muted hover:text-ink"
            aria-label="Edit preset"
            title="Edit preset"
            onClick={() => navigate(paths.watchlistEdit(item.watchlistId))}
          >
            <IconPencil className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-[8px] text-danger hover:bg-danger/10"
            aria-label="Delete preset"
            title="Delete preset"
            onClick={() => setConfirmDelete(true)}
          >
            <IconTrash className="h-5 w-5" />
          </button>
        </div>
      </div>
      <Card>
        <h2 className="font-serif text-xl">Latest run</h2>
        <p className="mt-2 text-sm text-ink">
          {runCopy(item.lastRunStatus, item.errorMessage, item.llmFallback)}
        </p>
        <div className="mt-3">
          <WatchlistLastRun row={item} />
        </div>
      </Card>
      <Card>
        <h2 className="font-serif text-xl">Filters</h2>
        <div className="mt-3">
          <FilterSummary payload={payload} />
        </div>
      </Card>
      {picks.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-serif text-xl">Top picks</h2>
          <TopPicksList picks={picks} />
        </section>
      ) : item.lastRunStatus === "COMPLETED" && item.llmFallback ? (
        <p className="text-sm text-muted">Ranking was skipped. Open History for the run.</p>
      ) : null}
      <Card>
        <h2 className="font-serif text-xl">Meta</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Vehicles</dt>
            <dd className="tabular">{item.totalVehicles ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">LLM</dt>
            <dd>{[item.llmProvider, item.llmModel].filter(Boolean).join(" / ") || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Schedule</dt>
            <dd>{schedulePreview(cronToSchedule(item.schedule))}</dd>
          </div>
        </dl>
      </Card>
      <Dialog
        open={confirmDelete}
        title="Delete this preset?"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => void remove.mutateAsync()}
        confirmLabel="Delete"
        pending={remove.isPending}
        danger
      >
        The preset will be deleted. An in-flight desk run keeps the payload it already claimed.
        {remove.isError ? <p className="text-danger">{remove.error instanceof Error ? remove.error.message : "Could not delete the preset."}</p> : null}
      </Dialog>
    </div>
  );
}
