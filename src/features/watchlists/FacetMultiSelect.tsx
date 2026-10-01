"use client";

import { useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";

export function FacetMultiSelect({
  label,
  options,
  value,
  onChange,
  searchable = true,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return options.slice(0, 80);
    }
    return options.filter((option) => option.toLowerCase().includes(q)).slice(0, 80);
  }, [options, query]);

  function toggle(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
      return;
    }
    onChange([...value, option]);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink">{label}</p>
        {value.length > 0 ? (
          <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => onChange([])}>
            Clear
          </Button>
        ) : null}
      </div>
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-[6px] bg-surface-muted px-2 py-1 text-xs text-ink"
              onClick={() => toggle(item)}
            >
              {item} ×
            </button>
          ))}
        </div>
      ) : null}
      {searchable ? (
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${label.toLowerCase()}`}
          aria-label={`Search ${label}`}
        />
      ) : null}
      <ul className="max-h-48 overflow-auto rounded-[8px] border border-hairline bg-canvas p-2">
        {filtered.map((option) => (
          <li key={option}>
            <label className="flex cursor-pointer items-center gap-2 rounded-[6px] px-2 py-1 text-sm hover:bg-surface-muted">
              <input
                type="checkbox"
                checked={value.includes(option)}
                onChange={() => toggle(option)}
              />
              {option}
            </label>
          </li>
        ))}
        {filtered.length === 0 ? <li className="px-2 py-1 text-xs text-muted">No matches</li> : null}
      </ul>
    </div>
  );
}
