"use client";

import { Link } from "@/compat/router";
import { Dialog } from "../../components/Dialog";
import { formatWhen } from "../../date/chicago";
import { paths } from "../../routes/paths";
import type { FailureItem } from "../../types/api";

export function FailureDetail({
  row,
  onClose,
}: {
  row: FailureItem | null;
  onClose: () => void;
}) {
  if (!row) {
    return null;
  }
  const desk = row.kind !== "scrape";
  return (
    <Dialog open title={row.title || row.id} wide cancelLabel="Close" onClose={onClose}>
      <dl className="grid gap-3 sm:grid-cols-2">
        <Fact label="Type" value={desk ? "Desk" : "Scrape"} />
        <Fact label="Status" value={row.status || "FAILED"} />
        <Fact label="When" value={formatWhen(row.when)} />
        <Fact label="Owner" value={row.owner || (desk ? "—" : "company scrape")} />
        <Fact label="Title / name" value={row.title || row.id} />
        {desk ? (
          <>
            <Fact label="Watchlist id" value={row.watchlistId} link={row.watchlistId ? paths.watchlist(row.watchlistId) : undefined} />
            <Fact label="Last log id" value={row.lastLogId} link={row.lastLogId ? paths.activityLog(row.lastLogId, row.lastProcessingDate) : undefined} />
            <Fact label="Processing date" value={row.lastProcessingDate} />
          </>
        ) : (
          <>
            <Fact
              label="Scrape run id"
              value={row.scrapeRunId}
              link={row.scrapeRunId ? paths.adminScrapeRun(row.scrapeRunId) : undefined}
            />
            <Fact label="Recipe version" value={row.recipeVersion} />
          </>
        )}
        {row.llmFallback ? <Fact label="LLM fallback" value="true" /> : null}
      </dl>
      <div>
        <p className="text-xs text-muted">Error</p>
        <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-[8px] border border-hairline bg-canvas p-3 text-xs text-ink">
          {row.errorMessage || "—"}
        </pre>
      </div>
    </Dialog>
  );
}

function Fact({
  label,
  value,
  link,
}: {
  label: string;
  value?: string;
  link?: string;
}) {
  const text = value || "—";
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm">
        {link && value ? (
          <Link to={link} className="text-accent hover:underline">
            {text}
          </Link>
        ) : (
          <span className="text-ink">{text}</span>
        )}
      </dd>
    </div>
  );
}
