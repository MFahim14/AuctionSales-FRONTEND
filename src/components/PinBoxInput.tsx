"use client";

import { useEffect, useRef, type KeyboardEvent, type ClipboardEvent } from "react";

export function PinBoxInput({
  value,
  onChange,
  length = 6,
  onComplete,
  autoFocus = false,
  label = "PIN",
}: {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  onComplete?: (pin: string) => void;
  autoFocus?: boolean;
  label?: string;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) {
      refs.current[0]?.focus();
    }
  }, [autoFocus]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function update(index: number, ch: string) {
    const next = digits.map((d, i) => (i === index ? ch : d)).join("");
    onChange(next);
    if (ch && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
    if (next.replace(/\s/g, "").length === length && ch) {
      onComplete?.(next);
    }
  }

  function onKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        update(index, "");
      } else if (index > 0) {
        update(index - 1, "");
        refs.current[index - 1]?.focus();
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    const next = Array.from({ length }, (_, i) => text[i] ?? digits[i] ?? "").join("");
    onChange(next);
    const focusIdx = Math.min(text.length, length - 1);
    refs.current[focusIdx]?.focus();
    if (next.replace(/\s/g, "").length === length) {
      onComplete?.(next);
    }
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={1}
          value={digit}
          aria-label={`${label} digit ${i + 1}`}
          onChange={(e) => {
            const ch = e.target.value.replace(/\D/g, "").slice(-1);
            update(i, ch);
          }}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
          className={`h-12 w-10 flex-shrink-0 rounded-[8px] border bg-canvas text-center font-mono text-xl text-ink outline-none transition-colors duration-[120ms] focus:border-accent ${
            digit ? "border-accent/60" : "border-hairline"
          }`}
        />
      ))}
    </div>
  );
}
