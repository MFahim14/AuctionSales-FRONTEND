"use client";

import { useMemo, useState } from "react";
import { chicagoTodayDate, isAfterChicagoToday } from "../../date/chicago";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function parseIso(value: string): { year: number; month: number; day: number } {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function DateCalendar({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (next: string) => void;
}) {
  const initial = parseIso(selected);
  const [{ year, month }, setView] = useState({ year: initial.year, month: initial.month });
  const todayParts = parseIso(chicagoTodayDate());
  const canNextMonth = year * 12 + month < todayParts.year * 12 + todayParts.month;

  const cells = useMemo(() => {
    const firstWeekday = new Date(year, month - 1, 1).getDay();
    const last = daysInMonth(year, month);
    const slots: Array<number | null> = [];
    for (let i = 0; i < firstWeekday; i += 1) {
      slots.push(null);
    }
    for (let day = 1; day <= last; day += 1) {
      slots.push(day);
    }
    return slots;
  }, [year, month]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-muted hover:bg-surface-muted hover:text-ink"
          aria-label="Previous month"
          onClick={() => setView((current) => shiftMonth(current.year, current.month, -1))}
        >
          <Chevron dir="left" />
        </button>
        <p className="font-serif text-base tracking-[-0.02em] text-ink">{monthLabel(year, month)}</p>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-muted hover:bg-surface-muted hover:text-ink disabled:opacity-30"
          aria-label="Next month"
          disabled={!canNextMonth}
          onClick={() => {
            if (canNextMonth) {
              setView((current) => shiftMonth(current.year, current.month, 1));
            }
          }}
        >
          <Chevron dir="right" />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-[11px] font-medium text-muted">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-1">
        {cells.map((day, index) => {
          if (day === null) {
            return <span key={`empty-${index}`} />;
          }
          const iso = toIso(year, month, day);
          const selectedDay = iso === selected;
          const future = isAfterChicagoToday(iso);
          return (
            <button
              key={iso}
              type="button"
              disabled={future}
              aria-current={selectedDay ? "date" : undefined}
              aria-label={iso}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] ${
                selectedDay
                  ? "bg-accent font-medium text-white"
                  : future
                    ? "cursor-default text-muted/40"
                    : "text-ink hover:bg-surface-muted"
              }`}
              onClick={() => {
                if (!future) {
                  onSelect(iso);
                }
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
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
