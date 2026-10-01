"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listUsers } from "../../api/users";
import type { PublicUser } from "../../types/api";

function labelFor(user: PublicUser): string {
  return user.name || user.email || user.userId;
}

function initials(user: PublicUser): string {
  const source = user.name || user.email || "?";
  const parts = source.split(/[\s@]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PeopleFilter({
  value,
  onChange,
  align = "end",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  align?: "start" | "end";
}) {
  const users = useQuery({ queryKey: ["users"], queryFn: listUsers });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const all = useMemo(() => users.data ?? [], [users.data]);
  const selected = useMemo(
    () => all.filter((user) => value.includes(user.userId)),
    [all, value]
  );

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

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return all;
    }
    return all.filter(
      (user) =>
        user.email?.toLowerCase().includes(q) ||
        user.name?.toLowerCase().includes(q),
    );
  }, [all, query]);

  function toggle(userId: string) {
    if (value.includes(userId)) {
      onChange(value.filter((id) => id !== userId));
      return;
    }
    onChange([...value, userId]);
  }

  const summary =
    selected.length === 0
      ? "Everyone"
      : selected.length === 1
        ? labelFor(selected[0])
        : `${selected.length} desks`;

  return (
    <div ref={rootRef} className="relative w-auto shrink-0">
      <button
        type="button"
        className="inline-flex h-8 w-auto max-w-[9.5rem] items-center gap-1.5 rounded-full border border-hairline bg-surface px-2 text-[13px] text-ink hover:bg-surface-muted"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex -space-x-1.5">
          {selected.slice(0, 3).map((user) => (
            <span
              key={user.userId}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-surface bg-accent/15 text-[8px] font-medium text-accent"
            >
              {initials(user)}
            </span>
          ))}
          {selected.length === 0 ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-muted text-[8px] font-medium text-muted">
              All
            </span>
          ) : null}
        </span>
        <span className="min-w-0 truncate">{summary}</span>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div
          className={`absolute z-20 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-[12px] border border-hairline bg-surface p-3 shadow-lg ${
            align === "end" ? "right-0" : "left-0"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted">Filter by desk</p>
            {value.length > 0 ? (
              <button
                type="button"
                className="text-xs text-accent hover:underline"
                onClick={() => onChange([])}
              >
                Everyone
              </button>
            ) : null}
          </div>
          <input
            className="mt-2 h-9 w-full rounded-[8px] border border-hairline bg-canvas px-3 text-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or email"
            aria-label="Search people"
          />
          <ul className="mt-2 max-h-64 overflow-auto" role="listbox" aria-multiselectable="true">
            {options.map((user) => {
              const checked = value.includes(user.userId);
              return (
                <li key={user.userId}>
                  <label className="flex min-w-0 cursor-pointer items-center gap-3 rounded-[8px] px-2 py-2 text-sm hover:bg-surface-muted">
                    <input type="checkbox" checked={checked} onChange={() => toggle(user.userId)} />
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-xs font-medium">
                      {initials(user)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{labelFor(user)}</span>
                      {user.name ? (
                        <span className="block truncate text-xs text-muted">{user.email}</span>
                      ) : null}
                    </span>
                  </label>
                </li>
              );
            })}
            {options.length === 0 ? (
              <li className="px-2 py-3 text-xs text-muted">No people match.</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
