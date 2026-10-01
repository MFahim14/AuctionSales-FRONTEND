"use client";

import { useEffect, useRef, useState } from "react";

export function SelectMenu<T extends string | number>({
  value,
  options,
  onChange,
  label,
  align = "end",
}: {
  value: T;
  options: T[];
  onChange: (next: T) => void;
  label: string;
  align?: "start" | "end";
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
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-hairline bg-surface px-2.5 text-[13px] text-ink hover:bg-surface-muted"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="tabular">{value}</span>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div
          className={`absolute z-20 mt-2 min-w-[5.5rem] rounded-[12px] border border-hairline bg-surface p-1.5 shadow-lg ${
            align === "end" ? "right-0" : "left-0"
          }`}
          role="listbox"
          aria-label={label}
        >
          {options.map((option) => (
            <button
              key={String(option)}
              type="button"
              role="option"
              aria-selected={option === value}
              className={`flex h-8 w-full items-center rounded-[8px] px-3 text-sm ${
                option === value ? "bg-surface-muted text-ink" : "text-muted hover:bg-surface-muted hover:text-ink"
              }`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
