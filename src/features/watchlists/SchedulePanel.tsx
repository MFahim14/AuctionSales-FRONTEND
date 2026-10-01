"use client";

import { useMemo, useState } from "react";
import { TimeField } from "./TimeField";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
const DAY_LABEL: Record<(typeof DAYS)[number], string> = {
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
  SAT: "Sat",
  SUN: "Sun",
};

export type PresetScheduleValue = {
  enabled: boolean;
  cronExpression: string;
  timezone: "America/Chicago";
};

export type ScheduleDraft = {
  enabled: boolean;
  days: string[];
  time: string;
};

export function emptySchedule(): ScheduleDraft {
  return { enabled: false, days: ["MON", "THU"], time: "08:00" };
}

export function scheduleToCron(draft: ScheduleDraft): string {
  const [hourRaw, minuteRaw] = draft.time.split(":");
  const minute = Number(minuteRaw || "0");
  const hour = Number(hourRaw || "8");
  const days = DAYS.filter((day) => draft.days.includes(day));
  if (days.length === 0 || days.length === 7) {
    return `cron(${minute} ${hour} * * ? *)`;
  }
  return `cron(${minute} ${hour} ? * ${days.join(",")} *)`;
}

export function cronToSchedule(value?: { enabled?: boolean; cronExpression?: string } | null): ScheduleDraft {
  const base = emptySchedule();
  if (!value) {
    return base;
  }
  const match = /cron\((\d+)\s+(\d+)\s+\S+\s+\S+\s+([^)]+)\s+\*\)/.exec(value.cronExpression || "");
  if (!match) {
    return { ...base, enabled: Boolean(value.enabled) };
  }
  const minute = match[1].padStart(2, "0");
  const hour = match[2].padStart(2, "0");
  const dayField = match[3].trim();
  const days = dayField === "?" || dayField === "*" ? [...DAYS] : dayField.split(",").map((part) => part.trim());
  return { enabled: Boolean(value.enabled), days, time: `${hour}:${minute}` };
}

export function schedulePreview(draft: ScheduleDraft): string {
  const [hourRaw, minuteRaw] = draft.time.split(":");
  const hour = Number(hourRaw || "0");
  const minute = (minuteRaw || "00").padStart(2, "0");
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  const days = DAYS.filter((day) => draft.days.includes(day));
  const dayText = days.length === 7 || days.length === 0 ? "every day" : days.map((day) => DAY_LABEL[day]).join("/");
  return `Runs automatically ${dayText} at ${hour12}:${minute} ${suffix} CT`;
}

export function SchedulePanel({
  value,
  onChange,
}: {
  value: ScheduleDraft;
  onChange: (next: ScheduleDraft) => void;
}) {
  const preview = useMemo(() => schedulePreview(value), [value]);
  return (
    <section className="space-y-3">
      <p className="text-sm text-ink">{preview}</p>
      <div className="flex flex-wrap gap-2">
        {DAYS.map((day) => {
          const selected = value.days.includes(day);
          return (
            <button
              key={day}
              type="button"
              aria-pressed={selected}
              className={`rounded-full border px-3 py-1 text-xs ${selected ? "border-accent bg-accent/15 text-ink" : "border-hairline text-muted"}`}
              onClick={() => {
                const days = selected ? value.days.filter((item) => item !== day) : [...value.days, day];
                onChange({ ...value, days });
              }}
            >
              {DAY_LABEL[day]}
            </button>
          );
        })}
      </div>
      <div>
        <p className="mb-1 text-xs text-muted">Chicago time</p>
        <TimeField value={value.time} onChange={(time) => onChange({ ...value, time })} />
      </div>
    </section>
  );
}

export function useScheduleState(initial?: PresetScheduleValue | null) {
  const [draft, setDraft] = useState(() => cronToSchedule(initial));
  return { draft, setDraft, payload: { enabled: draft.enabled, cronExpression: scheduleToCron(draft), timezone: "America/Chicago" as const } };
}
