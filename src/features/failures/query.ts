export const FAILURE_SOURCES = [
  { id: "all", label: "All" },
  { id: "desk", label: "Desk" },
  { id: "scrape", label: "Scrape" },
] as const;

export const FAILURE_STATUSES = ["FAILED", "ANALYSIS_FAILED", "PARTIAL", "FALLBACK"] as const;

export type FailureSource = (typeof FAILURE_SOURCES)[number]["id"];

export function failureFilterLabel(source: FailureSource, status: string): string {
  const src = FAILURE_SOURCES.find((item) => item.id === source)?.label ?? "All";
  if (!status) {
    return src;
  }
  const pretty = status.replaceAll("_", " ");
  return source === "all" ? pretty : `${src} · ${pretty}`;
}
