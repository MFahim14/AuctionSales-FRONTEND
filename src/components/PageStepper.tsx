"use client";

export function PageStepper({
  page,
  hasPrev,
  hasNext,
  pending,
  onPrev,
  onNext,
  prevLabel = "Previous page",
  nextLabel = "Next page",
}: {
  page: number;
  hasPrev: boolean;
  hasNext: boolean;
  pending?: boolean;
  onPrev: () => void;
  onNext: () => void;
  prevLabel?: string;
  nextLabel?: string;
}) {
  return (
    <div className="inline-flex h-8 items-center rounded-full border border-hairline bg-surface">
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-muted hover:text-ink disabled:opacity-30"
        aria-label={prevLabel}
        disabled={!hasPrev || pending}
        onClick={onPrev}
      >
        <Chevron dir="left" />
      </button>
      <span className="min-w-[2.25rem] px-0.5 text-center text-[13px] font-medium tabular text-ink">{page}</span>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-muted hover:text-ink disabled:opacity-30"
        aria-label={nextLabel}
        disabled={!hasNext || pending}
        onClick={onNext}
      >
        <Chevron dir="right" />
      </button>
    </div>
  );
}

export function ValueStepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <PageStepper
      page={value}
      hasPrev={value > min}
      hasNext={value < max}
      prevLabel="Decrease"
      nextLabel="Increase"
      onPrev={() => onChange(Math.max(min, value - 1))}
      onNext={() => onChange(Math.min(max, value + 1))}
    />
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d={dir === "left" ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
