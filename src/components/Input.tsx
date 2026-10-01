"use client";

import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-10 w-full min-w-0 rounded-[8px] border border-hairline bg-surface px-3 text-ink placeholder:text-muted ${className}`}
      {...props}
    />
  );
}
