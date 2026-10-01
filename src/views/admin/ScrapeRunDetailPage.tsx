"use client";

import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@/compat/router";
import { getScrapeRun } from "../../api/scrape";
import { Card } from "../../components/Card";
import { Spinner } from "../../components/Spinner";
import { formatWhen } from "../../date/chicago";
import { isHeartbeatStale, RunStatusPill } from "../../features/scrape/RunStatusPill";
import { paths } from "../../routes/paths";

function Row({ label, value }: { label: string; value?: string | number | boolean | null }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 break-all text-sm">{value === true ? "Yes" : value === false ? "No" : value || "—"}</dd>
    </div>
  );
}

export function ScrapeRunDetailPage() {
  const { scrapeRunId = "" } = useParams();
  const run = useQuery({
    queryKey: ["scrape-run", scrapeRunId],
    queryFn: () => getScrapeRun(scrapeRunId),
    enabled: Boolean(scrapeRunId),
  });

  if (run.isLoading) {
    return <Spinner />;
  }
  if (run.error || !run.data) {
    return (
      <Card>
        <p className="text-sm text-danger">{run.error?.message || "Scrape run not found."}</p>
      </Card>
    );
  }
  const item = run.data;
  return (
    <div className="space-y-5">
      <Link to={paths.adminScrapeRuns} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Schedules
      </Link>
      <div className="space-y-2">
        <h1 className="break-all font-mono text-[16px] text-muted">
          {item.scrapeRunId}
        </h1>
        <RunStatusPill run={item} />
      </div>
      {isHeartbeatStale(item) ? (
        <p className="rounded-[8px] border border-warning px-4 py-3 text-sm text-warning">
          Heartbeat is older than 3 minutes while the run is still marked RUNNING.
        </p>
      ) : null}
      {item.errorMessage ? (
        <Card>
          <p className="text-sm text-danger">{item.errorMessage}</p>
        </Card>
      ) : null}
      <Card>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Row label="Started" value={formatWhen(item.startedAt)} />
          <Row label="Completed" value={formatWhen(item.completedAt)} />
          <Row label="Heartbeat" value={formatWhen(item.lastHeartbeatAt)} />
          <Row label="Recipe" value={item.recipeVersion} />
          <Row label="Pages visited" value={item.pagesVisited} />
          <Row label="Items seen" value={item.itemsSeen} />
          <Row label="Items written" value={item.itemsWritten} />
          <Row label="Items failed" value={item.itemsFailed} />
          <Row label="CSV rows" value={item.csvRowCount} />
          <Row label="Needs ingest" value={item.needsIngest} />
          <Row label="Export file" value={item.s3CsvKey} />
        </dl>
      </Card>
    </div>
  );
}
