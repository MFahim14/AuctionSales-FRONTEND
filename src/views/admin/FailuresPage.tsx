"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "@/compat/router";
import { listFailures } from "../../api/scrape";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { IconTool } from "../../components/IconTool";
import { Pill } from "../../components/Pill";
import { Spinner } from "../../components/Spinner";
import { Table, type Column } from "../../components/Table";
import { clampToChicagoToday, chicagoTodayDate, formatChicagoLong, formatWhen } from "../../date/chicago";
import { DateStepper } from "../../features/activity/DateStepper";
import { FailureDetail } from "../../features/failures/FailureDetail";
import { FailureFilter, type FailureSource } from "../../features/failures/FailureFilter";
import type { FailureItem } from "../../types/api";

function statusTone(status?: string): "danger" | "warning" | "neutral" {
  const value = String(status || "").toUpperCase();
  if (value === "FAILED" || value === "ANALYSIS_FAILED") {
    return "danger";
  }
  if (value === "PARTIAL" || value === "FALLBACK") {
    return "warning";
  }
  return "neutral";
}

export function FailuresPage() {
  const [params, setParams] = useSearchParams();
  const requested = /^\d{4}-\d{2}-\d{2}$/.test(params.get("date") || params.get("day") || "")
    ? (params.get("date") || params.get("day"))!
    : chicagoTodayDate();
  const date = clampToChicagoToday(requested);

  const [source, setSource] = useState<FailureSource>("all");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<FailureItem | null>(null);

  function setDate(next: string) {
    const nextParams = new URLSearchParams(params);
    nextParams.set("date", clampToChicagoToday(next));
    setParams(nextParams, { replace: true });
  }

  const query = useMemo(
    () => ({ day: date, source, status: status || undefined }),
    [date, source, status],
  );
  const page = useQuery({
    queryKey: ["failures", query],
    queryFn: () => listFailures(query),
  });
  const rows = page.data?.items ?? [];

  const columns: Array<Column<FailureItem>> = [
    {
      key: "type",
      header: "Type",
      className: "w-[5.5rem]",
      cell: (row) => <Pill tone={row.kind === "scrape" ? "accent" : "neutral"}>{row.kind === "scrape" ? "Scrape" : "Desk"}</Pill>,
    },
    {
      key: "status",
      header: "Status",
      className: "w-[8rem]",
      cell: (row) => <Pill tone={statusTone(row.status)}>{row.status || "FAILED"}</Pill>,
    },
    { key: "when", header: "When", className: "w-[8.5rem]", cell: (row) => formatWhen(row.when) },
    {
      key: "owner",
      header: "Owner / run",
      className: "break-words",
      cell: (row) => row.owner || (row.kind === "scrape" ? "company scrape" : "—"),
    },
    {
      key: "title",
      header: "Title",
      className: "break-words",
      cell: (row) => <span className="line-clamp-2 break-words">{row.title || row.id}</span>,
    },
    {
      key: "error",
      header: "Error",
      className: "max-w-0 overflow-hidden",
      cell: (row) => (
        <span className="block truncate text-danger" title={row.errorMessage || undefined}>
          {row.errorMessage || "—"}
        </span>
      ),
    },
    {
      key: "view",
      header: "",
      className: "w-16 !px-2",
      cell: (row) => (
        <IconTool label="View failure" onClick={() => setOpen(row)}>
          <EyeGlyph />
        </IconTool>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <h1 className="min-w-0 font-serif text-[28px] leading-9 tracking-[-0.03em] break-words lg:text-[34px] lg:leading-10">
            Failures
          </h1>
          <div className="flex shrink-0 items-center gap-1.5">
            <DateStepper date={date} onChange={setDate} />
            <FailureFilter
              source={source}
              status={status}
              onChange={(next) => {
                setSource(next.source);
                setStatus(next.status);
              }}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          {rows.length} {rows.length === 1 ? "failure" : "failures"} · {formatChicagoLong(date)}
        </p>
      </div>
      {page.isLoading ? <Spinner /> : null}
      {page.error ? (
        <Card>
          <p className="text-sm text-danger">{page.error.message}</p>
        </Card>
      ) : null}
      {!page.isLoading && !page.error && rows.length === 0 ? (
        <EmptyState>No failures on {formatChicagoLong(date)}.</EmptyState>
      ) : null}
      {rows.length > 0 ? (
        <>
          {/* Mobile cards */}
          <ul className="space-y-2 lg:hidden">
            {rows.map((row, idx) => (
              <li key={`${row.kind}-${row.runId || row.lastLogId || row.id}-${row.when || idx}`}>
                <div className="rounded-[8px] border border-hairline bg-surface p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Pill tone={row.kind === "scrape" ? "accent" : "neutral"}>
                        {row.kind === "scrape" ? "Scrape" : "Desk"}
                      </Pill>
                      <Pill tone={statusTone(row.status)}>{row.status || "FAILED"}</Pill>
                    </div>
                    <IconTool label="View failure" onClick={() => setOpen(row)}>
                      <EyeGlyph />
                    </IconTool>
                  </div>
                  <p className="mt-2 text-xs text-muted">{formatWhen(row.when)}</p>
                  <p className="mt-0.5 break-words text-sm text-ink">
                    {row.title || row.id}
                  </p>
                  {row.owner || row.kind === "scrape" ? (
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {row.owner || "company scrape"}
                    </p>
                  ) : null}
                  {row.errorMessage ? (
                    <p className="mt-1 line-clamp-2 text-xs text-danger">{row.errorMessage}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          {/* Desktop table */}
          <div className="hidden lg:block">
            <Table
              layout="fixed"
              columns={columns}
              rows={rows}
              rowKey={(row, idx) => `${row.kind}-${row.runId || row.lastLogId || row.id}-${row.when || idx}`}
            />
          </div>
        </>
      ) : null}
      <FailureDetail row={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function EyeGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.4" />
    </svg>
  );
}
