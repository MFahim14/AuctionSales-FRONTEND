"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchMe } from "../../api/users";
import { Button } from "../../components/Button";
import { Field } from "../../components/Field";
import { IconTool } from "../../components/IconTool";
import { useToast } from "../../components/Toast";

export function PhonePromptModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [phone, setPhone] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { pushToast } = useToast();

  const mutation = useMutation({
    mutationFn: (cleanPhone: string) => patchMe({ phoneNumber: cleanPhone }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      pushToast("Phone number saved. Adding vehicle to interested...", "success");
      onClose();
      onSuccess();
    },
    onError: (err: any) => {
      pushToast(err?.message || "Failed to save phone number", "error");
    },
  });

  useEffect(() => {
    if (!open) {
      setPhone("");
      mutation.reset();
      return;
    }
    const timer = setTimeout(() => {
      panelRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (!digits) {
      pushToast("Please enter your 10-digit phone number", "error");
      return;
    }
    if (digits.length !== 10) {
      pushToast("Phone number must be exactly 10 digits", "error");
      return;
    }
    mutation.mutate(`+1${digits}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4 backdrop-blur-[10px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="phone-prompt-title"
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[8px] border border-hairline bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c4673a]/15 text-[#c4673a]">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <h2 id="phone-prompt-title" className="font-serif text-lg font-semibold text-ink">
                Phone Number Required
              </h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              To express interest in vehicles and receive auction bidding support, please provide your primary phone number. Our team will contact you to coordinate bidding proceedings.
            </p>
          </div>
          <IconTool label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </IconTool>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Field
            label="Direct Phone Number *"
            htmlFor="user-phone-input"
            hint="Enter your 10-digit mobile number"
          >
            <div className="relative flex h-10 w-full items-center rounded-[8px] border border-hairline bg-surface focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
              <span className="flex h-full select-none items-center border-r border-hairline px-3 text-sm font-semibold text-muted">
                +1
              </span>
              <input
                id="user-phone-input"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                placeholder="5550199283"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="h-full w-full rounded-r-[8px] bg-transparent px-3 text-sm text-ink placeholder:text-muted/50 focus:outline-none"
                required
              />
            </div>
          </Field>

          {mutation.error ? (
            <p className="text-xs text-danger">{mutation.error.message}</p>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save & Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
