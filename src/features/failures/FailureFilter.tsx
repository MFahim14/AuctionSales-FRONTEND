"use client";

import { useEffect, useRef, useState } from "react";
import {
  FAILURE_SOURCES,
  FAILURE_STATUSES,
  failureFilterLabel,
  type FailureSource,
} from "./query";

export type { FailureSource };

export function FailureFilter({
  source,
  status,
  onChange,
}: {
  source: FailureSource;
  status: string;
  onChange: (next: { source: FailureSource; status: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className="inline-flex h-8 max-w-[12rem] items-center gap-1.5 rounded-full border border-hairline bg-surface px-2.5 text-[13px] text-ink hover:bg-surface-muted"
        aria-label="Filter failures"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 truncate">{failureFilterLabel(source, status)}</span>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-[16rem] rounded-[12px] border border-hairline bg-surface p-3 shadow-lg">
          <p className="text-xs font-medium text-muted">Source</p>
          <ul className="mt-1 space-y-0.5" role="listbox" aria-label="Source">
            {FAILURE_SOURCES.map((item) => (
              <li key={item.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-1.5 text-sm hover:bg-surface-muted">
                  <input
                    type="radio"
                    name="failure-source"
                    checked={source === item.id}
                    onChange={() => onChange({ source: item.id, status })}
                  />
                  {item.label}
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs font-medium text-muted">Status</p>
          <ul className="mt-1 space-y-0.5" role="listbox" aria-label="Status">
            <li>
              <label className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-1.5 text-sm hover:bg-surface-muted">
                <input
                  type="radio"
                  name="failure-status"
                  checked={!status}
                  onChange={() => onChange({ source, status: "" })}
                />
                Any
              </label>
            </li>
            {FAILURE_STATUSES.map((item) => (
              <li key={item}>
                <label className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-1.5 text-sm hover:bg-surface-muted">
                  <input
                    type="radio"
                    name="failure-status"
                    checked={status === item}
                    onChange={() => onChange({ source, status: item })}
                  />
                  {item.replaceAll("_", " ")}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
