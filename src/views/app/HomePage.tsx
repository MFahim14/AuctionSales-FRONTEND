"use client";

import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@/compat/router";
import { listInventory } from "../../api/inventory";
import { listHistory } from "../../api/history";
import { getMe } from "../../api/users";
import { listPresets } from "../../api/presets";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Spinner } from "../../components/Spinner";
import { chicagoTodayDate } from "../../date/chicago";
import { watchlistCreateBlock, POLLING_STATUSES } from "../../features/watchlists/helpers";
import { paths } from "../../routes/paths";
import { HomeTodayLogs, HomeWatchlists, LiveLotsStrip } from "./home/HomeBits";

export function HomePage() {
  const today = chicagoTodayDate();
  const navigate = useNavigate();
  const me = useQuery({ queryKey: ["me"], queryFn: getMe });
  const watchlists = useQuery({
    queryKey: ["watchlists", { scope: "mine" }],
    queryFn: () => listPresets(),
  });
  const logs = useQuery({
    queryKey: ["logs", { date: today, userIds: [] }],
    queryFn: () => listHistory({ date: today }),
    refetchInterval: (query) => {
      const rows = query.state.data ?? [];
      return rows.some((row) => POLLING_STATUSES.has(String(row.status))) ? 10_000 : false;
    },
  });
  const inventory = useQuery({
    queryKey: ["inventory", { limit: 25, home: true }],
    queryFn: () => listInventory({ limit: 25 }),
  });
  const block = watchlistCreateBlock(me.data);
  const cannotCreate = Boolean(me.data) && block.blocked;

  if (me.isLoading) {
    return <Spinner />;
  }
  if (me.error) {
    return (
      <Card>
        <p className="text-sm text-danger">{me.error.message}</p>
        <Button className="mt-3" variant="secondary" onClick={() => void me.refetch()}>
          Retry
        </Button>
      </Card>
    );
  }
  const user = me.data!;
  const cap = user.watchlistCap ?? 5;
  const active = user.activeWatchlistCount ?? 0;
  const rows = watchlists.data ?? [];
  const activeRows = rows.filter((row) => row.isActive).slice(0, 5);
  const morning = logs.data ?? [];
  const lots = (inventory.data?.items ?? []).slice(0, 6);

  return (
    <div className="space-y-6 lg:max-h-[calc(100dvh-7.5rem)] lg:overflow-hidden">
      <div className="min-w-0">
        <h1 className="font-serif text-[28px] leading-9 tracking-[-0.03em] break-words lg:text-[34px] lg:leading-10">
          {user.name || user.email.split("@")[0]}
        </h1>
        <p className="mt-2 text-sm text-muted">Live lots, presets, and today’s runs.</p>
      </div>
      <div className="grid min-h-0 gap-6 lg:grid-cols-3">
        <section className="min-w-0 space-y-3 lg:col-span-2">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-xl tracking-[-0.02em]">Inventory</h2>
            <Link to={paths.inventory} className="text-sm text-accent">
              Inventory →
            </Link>
          </div>
          {inventory.isLoading ? <Spinner /> : null}
          {!inventory.isLoading && lots.length === 0 ? (
            <p className="text-sm text-muted">No live lots yet.</p>
          ) : (
            <LiveLotsStrip items={lots} />
          )}
        </section>
        <div className="min-w-0 space-y-6">
          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-serif text-xl tracking-[-0.02em]">
                Presets <span className="text-sm font-sans text-muted">{active} / {cap}</span>
              </h2>
              <Link to={paths.watchlists} className="text-sm text-accent">
                Presets →
              </Link>
            </div>
            {watchlists.isLoading ? <Spinner /> : null}
            {!watchlists.isLoading && activeRows.length === 0 ? (
              <EmptyState
                action={
                  <Button disabled={cannotCreate} title={block.reason} onClick={() => navigate(paths.watchlistNew)}>
                    New preset
                  </Button>
                }
              >
                No active presets.
              </EmptyState>
            ) : (
              <HomeWatchlists rows={activeRows} />
            )}
          </section>
          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-serif text-xl tracking-[-0.02em]">Today</h2>
              <Link to={paths.activity} className="text-sm text-accent">
                History →
              </Link>
            </div>
            {logs.isLoading ? <Spinner /> : null}
            {!logs.isLoading && morning.length === 0 ? (
              <p className="text-sm text-muted">No desk runs for this morning.</p>
            ) : (
              <HomeTodayLogs rows={morning} onOpen={(row) => navigate(paths.activityLog(row.logId, today))} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
