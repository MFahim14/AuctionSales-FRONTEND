"use client";

import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`min-w-0 rounded-[8px] border border-hairline bg-surface p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
