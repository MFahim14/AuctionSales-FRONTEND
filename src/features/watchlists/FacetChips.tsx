"use client";

import { useState } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";

export function FacetChips({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const next = draft.trim();
    if (!next || value.includes(next)) {
      return;
    }
    onChange([...value, next]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-ink">{label}</p>
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-[6px] bg-surface-muted px-2 py-1 text-xs"
              onClick={() => onChange(value.filter((entry) => entry !== item))}
              disabled={disabled}
            >
              {item} ×
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex min-w-0 gap-2">
        <Input
          className="min-w-0 flex-1"
          value={draft}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <Button variant="secondary" className="shrink-0" disabled={disabled} onClick={add}>
          Add
        </Button>
      </div>
    </div>
  );
}
