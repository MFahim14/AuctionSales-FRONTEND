"use client";

import { useEffect, useRef, useState } from "react";
import {
  chicagoTodayDate,
  clampToChicagoToday,
  formatChicagoCompact,
  formatChicagoLong,
  shiftChicagoDate,
} from "../../date/chicago";
import { DateCalendar } from "./DateCalendar";
import { useAnchoredPanel } from "./useAnchoredPanel";

export function DateStepper({
  date,
  onChange,
}: {
  date: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelStyle = useAnchoredPanel(open, pillRef, panelRef);
  const atToday = date >= chicagoTodayDate();

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

  function pick(next: string) {
    onChange(clampToChicagoToday(next));
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <div
        ref={pillRef}
        className="inline-flex h-8 items-center rounded-full border border-hairline bg-surface"
      >
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-muted hover:text-ink"
          aria-label="Previous day"
          onClick={() => pick(shiftChicagoDate(date, -1))}
        >
          <Chevron dir="left" />
        </button>
        <button
          type="button"
          className="min-w-[4.5rem] px-0.5 text-center text-[13px] font-medium text-ink hover:text-accent"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={`${formatChicagoLong(date)}. Open calendar`}
          onClick={() => setOpen((current) => !current)}
        >
          {formatChicagoCompact(date)}
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-muted hover:text-ink disabled:opacity-30"
          aria-label="Next day"
          disabled={atToday}
          onClick={() => {
            if (!atToday) {
              pick(shiftChicagoDate(date, 1));
            }
          }}
        >
          <Chevron dir="right" />
        </button>
      </div>
      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Choose a date"
          style={panelStyle}
          className="rounded-[12px] border border-hairline bg-surface p-3 shadow-lg"
        >
          <DateCalendar selected={date} onSelect={pick} />
        </div>
      ) : null}
    </div>
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
