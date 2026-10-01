"use client";

import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import type { RangeDraft } from "./formState";

export function FacetRange({
  label,
  value,
  onChange,
  minBound,
  maxBound,
}: {
  label: string;
  value: RangeDraft;
  onChange: (next: RangeDraft) => void;
  minBound: number;
  maxBound: number;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    setDraft({ min: value.min, max: value.max });
  }, [value.min, value.max]);
  const min = Number(draft.min || minBound);
  const max = Number(draft.max || maxBound);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-ink">{label}</p>
      <div className="grid min-w-0 grid-cols-2 gap-2">
        <Input
          type="number"
          aria-label={`${label} min`}
          value={draft.min}
          onChange={(event) => setDraft({ ...draft, min: event.target.value })}
        />
        <Input
          type="number"
          aria-label={`${label} max`}
          value={draft.max}
          onChange={(event) => setDraft({ ...draft, max: event.target.value })}
        />
      </div>
      <div className="grid min-w-0 grid-cols-2 gap-2">
        <input
          type="range"
          min={minBound}
          max={maxBound}
          value={Number.isFinite(min) ? min : minBound}
          onChange={(event) => setDraft({ ...draft, min: event.target.value })}
          aria-label={`${label} min slider`}
        />
        <input
          type="range"
          min={minBound}
          max={maxBound}
          value={Number.isFinite(max) ? max : maxBound}
          onChange={(event) => setDraft({ ...draft, max: event.target.value })}
          aria-label={`${label} max slider`}
        />
      </div>
      <Button variant="secondary" className="h-8 text-xs" onClick={() => onChange(draft)}>
        Apply
      </Button>
    </div>
  );
}
