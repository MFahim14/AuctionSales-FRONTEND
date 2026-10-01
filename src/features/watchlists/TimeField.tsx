"use client";

const HOURS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

export function TimeField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [hourRaw, minuteRaw] = value.split(":");
  const hour24 = Number(hourRaw || "8");
  const minute = MINUTES.includes((minuteRaw || "00").padStart(2, "0")) ? (minuteRaw || "00").padStart(2, "0") : "00";
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = String(hour24 % 12 || 12);

  function emit(nextHour12: string, nextMinute: string, nextSuffix: "AM" | "PM") {
    let hour = Number(nextHour12) % 12;
    if (nextSuffix === "PM") {
      hour += 12;
    }
    onChange(`${String(hour).padStart(2, "0")}:${nextMinute}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Hour"
        value={hour12}
        className="h-10 rounded-[8px] border border-hairline bg-canvas px-3 text-sm text-ink"
        onChange={(event) => emit(event.target.value, minute, suffix)}
      >
        {HOURS.map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>
      <span className="text-muted">:</span>
      <select
        aria-label="Minute"
        value={minute}
        className="h-10 rounded-[8px] border border-hairline bg-canvas px-3 text-sm text-ink"
        onChange={(event) => emit(hour12, event.target.value, suffix)}
      >
        {MINUTES.map((part) => (
          <option key={part} value={part}>
            {part}
          </option>
        ))}
      </select>
      <div className="flex rounded-[8px] border border-hairline p-0.5">
        {(["AM", "PM"] as const).map((part) => (
          <button
            key={part}
            type="button"
            aria-pressed={suffix === part}
            className={`h-9 rounded-[6px] px-3 text-xs font-medium ${
              suffix === part ? "bg-accent text-canvas" : "text-muted"
            }`}
            onClick={() => emit(hour12, minute, part)}
          >
            {part}
          </button>
        ))}
      </div>
    </div>
  );
}
