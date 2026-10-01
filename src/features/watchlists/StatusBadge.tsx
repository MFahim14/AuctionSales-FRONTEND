"use client";

import type { RunStatus } from "../../types/api";
import { Pill } from "../../components/Pill";

const labels: Record<string, { text: string; tone: "neutral" | "warning" | "success" | "danger" }> = {
  PROCESSING: { text: "Scraping", tone: "warning" },
  SCRAPED: { text: "Ranking", tone: "warning" },
  ANALYZING: { text: "Ranking", tone: "warning" },
  COMPLETED: { text: "Completed", tone: "success" },
  FAILED: { text: "Failed", tone: "danger" },
  ANALYSIS_FAILED: { text: "Email failed", tone: "warning" },
};

export function StatusBadge({ status }: { status?: RunStatus | string }) {
  if (!status) {
    return <Pill tone="neutral">Never run</Pill>;
  }
  const mapped = labels[status] ?? { text: status, tone: "neutral" as const };
  return <Pill tone={mapped.tone}>{mapped.text}</Pill>;
}
