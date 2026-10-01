"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listPresets } from "../../api/presets";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { PageStepper } from "../../components/PageStepper";
import { SelectMenu } from "../../components/SelectMenu";
import { Spinner } from "../../components/Spinner";
import { PeopleFilter } from "../../features/activity/PeopleFilter";
import { PAGE_SIZES, type PageSize } from "../../features/inventory/query";
import { WatchlistTable } from "../../features/watchlists/WatchlistTable";
import { sliceClientPage } from "../../features/watchlists/clientPage";

export function AdminWatchlistListPage() {
  const [userIds, setUserIds] = useState<string[]>([]);
  const [limit, setLimit] = useState<PageSize>(25);
  const [page, setPage] = useState(1);
  const watchlists = useQuery({
    queryKey: ["watchlists", { scope: "admin", userIds }],
    queryFn: () =>
      listPresets({
        userId: userIds.length > 0 ? userIds.join(",") : undefined,
        all: userIds.length === 0,
      }),
  });
  const all = watchlists.data ?? [];
  const sliced = sliceClientPage(all, page, limit);

  useEffect(() => {
    setPage(1);
  }, [userIds, limit]);

  useEffect(() => {
    if (page > sliced.pageCount) {
      setPage(sliced.pageCount);
    }
  }, [page, sliced.pageCount]);

  return (
    <div className="min-w-0 space-y-5">
      <div>
        <div className="flex min-w-0 flex-nowrap items-center justify-between gap-2">
          <h1 className="min-w-0 truncate font-serif text-[28px] leading-9 tracking-[-0.03em] lg:text-[34px] lg:leading-10">
            All presets
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            <PageStepper
              page={sliced.page}
              hasPrev={sliced.page > 1}
              hasNext={sliced.page < sliced.pageCount}
              onPrev={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() => setPage((current) => current + 1)}
            />
            <SelectMenu
              label="Page size"
              value={limit}
              options={[...PAGE_SIZES]}
              onChange={setLimit}
            />
            <PeopleFilter
              align="end"
              value={userIds}
              onChange={(next) => {
                setUserIds(next);
                setPage(1);
              }}
            />
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">Every desk.</p>
      </div>
      {watchlists.isLoading ? <Spinner /> : null}
      {watchlists.error ? (
        <Card>
          <p className="text-sm text-danger">{watchlists.error.message}</p>
        </Card>
      ) : null}
      {!watchlists.isLoading && !watchlists.error && all.length === 0 ? <EmptyState>No presets match.</EmptyState> : null}
      {sliced.items.length > 0 ? <WatchlistTable showOwner rows={sliced.items} /> : null}
    </div>
  );
}
