"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@/compat/router";
import { getMe } from "../../api/users";
import { listPresets } from "../../api/presets";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Spinner } from "../../components/Spinner";
import { watchlistCreateBlock } from "../../features/watchlists/helpers";
import { WatchlistTable } from "../../features/watchlists/WatchlistTable";
import { paths } from "../../routes/paths";

export function WatchlistListPage() {
  const me = useQuery({ queryKey: ["me"], queryFn: getMe });
  const watchlists = useQuery({
    queryKey: ["watchlists", { scope: "mine" }],
    queryFn: () => listPresets(),
  });
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const block = watchlistCreateBlock(me.data);
  const cannotCreate = Boolean(me.data) && block.blocked;
  const rows = (watchlists.data ?? []).filter((row) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return true;
    }
    return (row.name || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-baseline gap-3 font-serif text-[28px] leading-9 tracking-[-0.03em] break-words lg:text-[34px] lg:leading-10">
            Presets
            <span className="font-sans text-lg font-medium text-muted">{rows.length}</span>
          </h1>
          <p className="mt-2 text-sm text-muted">Filters and an automatic Chicago schedule.</p>
        </div>
        <Button disabled={cannotCreate} title={block.reason} onClick={() => navigate(paths.watchlistNew)}>
          New preset
        </Button>
      </div>
      <label className="relative block">
        <span className="sr-only">Search presets</span>
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4 4" strokeLinecap="round" />
        </svg>
        <input
          className="h-11 w-full rounded-[10px] border border-hairline bg-surface pl-10 pr-3 text-sm text-ink placeholder:text-muted"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name"
        />
      </label>
      {watchlists.isLoading ? <Spinner /> : null}
      {watchlists.error ? (
        <Card>
          <p className="text-sm text-danger">{watchlists.error.message}</p>
          <Button className="mt-3" variant="secondary" onClick={() => void watchlists.refetch()}>
            Retry
          </Button>
        </Card>
      ) : null}
      {!watchlists.isLoading && rows.length === 0 ? (
        <EmptyState
          action={
            <Button disabled={cannotCreate} title={block.reason} onClick={() => navigate(paths.watchlistNew)}>
              New preset
            </Button>
          }
        >
          {query.trim() ? "No presets match that name." : "No presets yet."}
        </EmptyState>
      ) : null}
      {rows.length > 0 ? <WatchlistTable rows={rows} allowReorder /> : null}
      {cannotCreate && block.href ? (
        <p className="text-sm text-muted">
          {block.reason}{" "}
          <Link to={block.href} className="text-accent">
            Open
          </Link>
        </p>
      ) : null}
    </div>
  );
}
