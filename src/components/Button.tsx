"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover disabled:opacity-40",
  secondary: "border border-hairline bg-surface text-ink hover:bg-surface-muted disabled:opacity-40",
  ghost: "text-ink hover:bg-surface-muted disabled:opacity-40",
  danger: "bg-danger text-white disabled:opacity-40",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button
      type={type}
      className={`inline-flex h-10 items-center justify-center rounded-[8px] px-4 text-sm font-medium transition-colors duration-[120ms] ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
