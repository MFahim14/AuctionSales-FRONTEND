"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "@/compat/router";
import { listScrapeRuns } from "../../api/scrape";
import { Dialog } from "../../components/Dialog";
import { EmptyState } from "../../components/EmptyState";
import { FairOrb } from "../../components/orb/FairOrb";
import { Table, type Column } from "../../components/Table";
import { chicagoTodayDate, formatWhen } from "../../date/chicago";
import { DateStepper } from "../activity/DateStepper";
import { paths } from "../../routes/paths";
import type { ScrapeRun } from "../../types/api";
import { RunStatusPill } from "./RunStatusPill";

export function CrawlHistoryDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [day, setDay] = useState(chicagoTodayDate);
  const runs = useQuery({
    queryKey: ["scrape-runs", day],
    queryFn: () => listScrapeRuns(day),
    enabled: open,
  });
  const rows = runs.data?.runs ?? [];
  const columns: Array<Column<ScrapeRun>> = [
    { key: "status", header: "Status", cell: (row) => <RunStatusPill run={row} /> },
    { key: "started", header: "Started", cell: (row) => formatWhen(row.startedAt) },
    { key: "beat", header: "Heartbeat", cell: (row) => formatWhen(row.lastHeartbeatAt) },
    { key: "pages", header: "Pages", className: "tabular", cell: (row) => row.pagesVisited ?? "—" },
    {
      key: "counts",
      header: "Seen / written / failed",
      className: "tabular",
      cell: (row) => `${row.itemsSeen ?? 0} / ${row.itemsWritten ?? 0} / ${row.itemsFailed ?? 0}`,
    },
    { key: "recipe", header: "Recipe", cell: (row) => row.recipeVersion || "—" },
  ];

  return (
    <Dialog open={open} title="Crawl runs" cancelLabel="Close" onClose={onClose} wide>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">Runs for the selected day.</p>
        <DateStepper date={day} onChange={setDay} />
      </div>
      {runs.isLoading ? <FairOrb state="working" place="panel" /> : null}
      {runs.error ? <p className="text-sm text-danger">{runs.error.message}</p> : null}
      {!runs.isLoading && rows.length === 0 ? <EmptyState>No scrape for this day.</EmptyState> : null}
      {rows.length > 0 ? (
        <Table
          columns={columns}
          rows={rows}
          rowKey={(row) => row.scrapeRunId}
          onRowClick={(row) => {
            onClose();
            navigate(paths.adminCrawlerRun(row.scrapeRunId));
          }}
        />
      ) : null}
    </Dialog>
  );
}
