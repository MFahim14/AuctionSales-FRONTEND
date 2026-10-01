"use client";

import type { ReactNode } from "react";
import type { Role } from "../../types/api";

export function RoleToggle({
  value,
  onChange,
}: {
  value: Role;
  onChange: (next: Role) => void;
}) {
  return (
    <div className="flex h-8 items-center gap-1.5" role="group" aria-label="Role">
      <RoleTool label="User" pressed={value === "User"} onClick={() => onChange("User")}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 19c1.2-3.2 3.5-4.8 6.5-4.8S17.8 15.8 19 19" strokeLinecap="round" />
        </svg>
      </RoleTool>
      <RoleTool label="Admin" pressed={value === "Admin"} onClick={() => onChange("Admin")}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3.5l7 3v5.2c0 4.2-2.8 7.2-7 8.8-4.2-1.6-7-4.6-7-8.8V6.5l7-3z" strokeLinejoin="round" />
        </svg>
      </RoleTool>
    </div>
  );
}

function RoleTool({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-[8px] border ${
        pressed
          ? "border-accent bg-accent text-canvas"
          : "border-hairline bg-surface text-muted hover:bg-surface-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
