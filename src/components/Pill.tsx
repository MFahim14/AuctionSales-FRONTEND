"use client";

import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-ink",
  accent: "bg-accent text-white",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
};

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span className={`inline-flex max-w-full rounded-[6px] px-2 py-0.5 text-xs font-medium break-words ${tones[tone]}`}>
      {children}
    </span>
  );
}
