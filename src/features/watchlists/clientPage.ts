export function sliceClientPage<T>(rows: T[], page: number, limit: number): {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
  items: T[];
} {
  const safeLimit = Math.max(1, limit);
  const pageCount = Math.max(1, Math.ceil(rows.length / safeLimit) || 1);
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * safeLimit;
  return {
    page: safePage,
    limit: safeLimit,
    total: rows.length,
    pageCount,
    items: rows.slice(start, start + safeLimit),
  };
}
