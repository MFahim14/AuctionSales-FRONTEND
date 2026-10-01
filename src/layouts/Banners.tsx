"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Link } from "@/compat/router";
import { getMe } from "../api/users";
import { paths } from "../routes/paths";

export function Banners() {
  const me = useQuery({ queryKey: ["me"], queryFn: getMe });
  const user = me.data;
  if (!user) {
    return null;
  }

  const banners: Array<{ key: string; tone: string; copy: string; action?: ReactNode }> = [];
  if (user.isActive === false) {
    banners.push({
      key: "inactive",
      tone: "border-danger text-danger",
      copy: "Your account cannot create or activate presets. Ask an Admin.",
    });
  }
  const cap = user.watchlistCap ?? 5;
  const active = user.activeWatchlistCount ?? 0;
  if (active >= cap) {
    banners.push({
      key: "cap",
      tone: "border-warning text-warning",
      copy: `Active watchlist cap used ${active} / ${cap}. Turn one off or ask an Admin to raise it.`,
      action: (
        <Link to={paths.watchlists} className="text-sm font-medium underline">
          Watchlists
        </Link>
      ),
    });
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {banners.map((banner) => (
        <div
          key={banner.key}
          className={`flex flex-wrap items-center justify-between gap-3 rounded-[8px] border bg-surface px-4 py-3 text-sm ${banner.tone}`}
        >
          <span>{banner.copy}</span>
          {banner.action}
        </div>
      ))}
    </div>
  );
}
