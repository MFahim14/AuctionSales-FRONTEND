"use client";

export function Pager({
  page,
  hasPrev,
  hasNext,
  pending,
  onPrev,
  onNext,
}: {
  page: number;
  hasPrev: boolean;
  hasNext: boolean;
  pending?: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="inline-flex items-center rounded-[8px] border border-hairline bg-surface p-0.5">
      <button
        type="button"
        className="h-9 rounded-[6px] px-3 text-sm text-muted disabled:opacity-30 hover:text-ink"
        disabled={!hasPrev || pending}
        onClick={onPrev}
      >
        Prev
      </button>
      <span className="min-w-[4.5rem] px-2 text-center text-sm tabular text-ink">Page {page}</span>
      <button
        type="button"
        className="h-9 rounded-[6px] px-3 text-sm text-muted disabled:opacity-30 hover:text-ink"
        disabled={!hasNext || pending}
        onClick={onNext}
      >
        Next
      </button>
    </div>
  );
}
