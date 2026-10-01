"use client";

export function RangeSlider({
  min,
  max,
  step = 1,
  lo,
  hi,
  format = String,
  onChange,
  label,
}: {
  min: number;
  max: number;
  step?: number;
  lo: number;
  hi: number;
  format?: (value: number) => string;
  onChange: (next: { lo: number; hi: number }) => void;
  label: string;
}) {
  const span = Math.max(1, max - min);
  const left = ((lo - min) / span) * 100;
  const width = ((hi - lo) / span) * 100;

  function setLo(raw: number) {
    onChange({ lo: Math.min(raw, hi), hi });
  }

  function setHi(raw: number) {
    onChange({ lo, hi: Math.max(raw, lo) });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3 text-[13px] tabular">
        <span className="text-ink">{format(lo)}</span>
        <span className="text-muted">{format(hi)}</span>
      </div>
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-hairline" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
        <input
          type="range"
          aria-label={`${label} minimum`}
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(event) => setLo(Number(event.target.value))}
          className={lo > min + span * 0.5 ? "range-thumb absolute inset-0 z-10 w-full" : "range-thumb absolute inset-0 z-20 w-full"}
        />
        <input
          type="range"
          aria-label={`${label} maximum`}
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(event) => setHi(Number(event.target.value))}
          className={lo > min + span * 0.5 ? "range-thumb absolute inset-0 z-20 w-full" : "range-thumb absolute inset-0 z-10 w-full"}
        />
      </div>
    </div>
  );
}
