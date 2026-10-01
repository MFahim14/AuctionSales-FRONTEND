"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  pushToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const pushToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now();
    setToast({ id, message, tone });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);
  const toneClass =
    toast?.tone === "error"
      ? "border-danger text-danger"
      : toast?.tone === "success"
        ? "border-success text-success"
        : "border-hairline text-ink";

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          role="status"
          className={`fixed bottom-4 left-4 right-4 z-50 max-w-none rounded-[8px] border bg-surface px-4 py-3 shadow-sm sm:left-auto sm:right-4 sm:max-w-sm ${toneClass}`}
        >
          {toast.message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx;
}
