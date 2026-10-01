"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./Button";

export function Dialog({
  open,
  title,
  children,
  onClose,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  onConfirm,
  danger,
  confirmDisabled,
  pending,
  wide,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  danger?: boolean;
  confirmDisabled?: boolean;
  pending?: boolean;
  wide?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const pendingRef = useRef(pending);
  useEffect(() => {
    onCloseRef.current = onClose;
    pendingRef.current = pending;
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pendingRef.current) {
        onCloseRef.current();
      }
      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const firstField = panelRef.current?.querySelector<HTMLElement>("input, textarea, select");
    (firstField ?? panelRef.current?.querySelector("button"))?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-scrim p-4 backdrop-blur-[10px]" role="presentation">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={`w-full max-h-[min(90dvh,40rem)] overflow-y-auto rounded-[8px] border border-hairline bg-surface p-5 shadow-lg ${
          wide ? "max-w-3xl" : "max-w-md"
        }`}
      >
        <h2 id="dialog-title" className="font-serif text-xl text-ink">
          {title}
        </h2>
        <div className="mt-3 space-y-3 text-sm text-ink">{children}</div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="secondary" disabled={pending} onClick={onClose}>
            {cancelLabel}
          </Button>
          {onConfirm ? (
            <Button
              variant={danger ? "danger" : "primary"}
              disabled={Boolean(confirmDisabled) || Boolean(pending)}
              onClick={onConfirm}
            >
              {pending ? "Saving…" : confirmLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
