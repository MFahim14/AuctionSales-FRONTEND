"use client";

import type { TopPick, TopPicksPayload } from "../../types/api";
import { Card } from "../../components/Card";

export function asTopPicks(value: unknown): TopPick[] {
  if (!value || typeof value === "string") {
    return [];
  }
  const payload = value as TopPicksPayload;
  return Array.isArray(payload.topPicks) ? payload.topPicks : [];
}

export function TopPicksList({ picks }: { picks: TopPick[] }) {
  if (picks.length === 0) {
    return null;
  }
  return (
    <div className="grid gap-3">
      {picks.map((pick) => (
        <Card key={`${pick.rank}-${pick.stockNumber ?? pick.model}`}>
          <p className="text-xs tabular text-muted">Rank {pick.rank}</p>
          <h3 className="font-serif text-xl text-ink">
            {[pick.year, pick.make, pick.model].filter(Boolean).join(" ") || "Vehicle"}
          </h3>
          {pick.stockNumber ? <p className="text-sm text-muted">Stock {pick.stockNumber}</p> : null}
          {pick.rationale ? <p className="mt-2 text-sm text-ink">{pick.rationale}</p> : null}
          {pick.valueNotes ? <p className="mt-1 text-sm text-muted">{pick.valueNotes}</p> : null}
        </Card>
      ))}
    </div>
  );
}
