"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteUser } from "../../api/users";
import { Button } from "../../components/Button";
import { Field } from "../../components/Field";
import { IconTool } from "../../components/IconTool";
import { Input } from "../../components/Input";
import { ValueStepper } from "../../components/PageStepper";
import { useToast } from "../../components/Toast";
import type { Role } from "../../types/api";
import { RoleToggle } from "./RoleToggle";

export function InviteUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<Role>("User");
  const [watchlistCap, setWatchlistCap] = useState(5);
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { pushToast } = useToast();

  const mutation = useMutation({
    mutationFn: () => {
      const digits = phoneNumber.replace(/\D/g, "");
      return inviteUser({
        email,
        name: name.trim() || undefined,
        phoneNumber: digits ? `+1${digits}` : undefined,
        role,
        watchlistCap,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      pushToast("Invite sent. We’ll email them a link to set a password.", "success");
      onClose();
    },
  });
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (!open) {
      setEmail("");
      setName("");
      setPhoneNumber("");
      setRole("User");
      setWatchlistCap(5);
      resetMutation();
      return;
    }
    const timer = window.setTimeout(() => panelRef.current?.querySelector<HTMLInputElement>("input")?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open, resetMutation]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const digits = phoneNumber.replace(/\D/g, "");
    if (role === "User") {
      if (!digits) {
        pushToast("Phone number is required for wholesale buyers", "error");
        return;
      }
      if (digits.length !== 10) {
        pushToast("Phone number must be exactly 10 digits", "error");
        return;
      }
    } else if (digits && digits.length !== 10) {
      pushToast("Phone number must be exactly 10 digits", "error");
      return;
    }
    void mutation.mutateAsync();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-scrim p-4 backdrop-blur-[10px]" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-title"
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[8px] border border-hairline bg-surface p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="invite-title" className="font-serif text-xl text-ink">
              Invite
            </h2>
            <p className="mt-1 text-sm text-muted">We’ll email them a link to set a password.</p>
          </div>
          <IconTool label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </IconTool>
        </div>
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <Field label="Email" htmlFor="invite-email">
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <Field label="Name" htmlFor="invite-name">
            <Input id="invite-name" value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field
            label={role === "User" ? "Phone number *" : "Phone number"}
            htmlFor="invite-phone"
            hint={
              role === "User"
                ? "Mandatory 10-digit number for wholesale buyers."
                : "Optional 10-digit number for admins."
            }
          >
            <div className="relative flex h-10 w-full items-center rounded-[8px] border border-hairline bg-surface focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
              <span className="flex h-full select-none items-center border-r border-hairline px-3 text-sm font-semibold text-muted">
                +1
              </span>
              <input
                id="invite-phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                placeholder="5550199283"
                value={phoneNumber}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhoneNumber(digits);
                }}
                className="h-full w-full rounded-r-[8px] bg-transparent px-3 text-sm text-ink placeholder:text-muted/50 focus:outline-none"
                required={role === "User"}
              />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Role">
              <RoleToggle value={role} onChange={setRole} />
            </Field>
            <Field label="Watchlist cap" hint="Active rows only. 1–50.">
              <ValueStepper value={watchlistCap} min={1} max={50} onChange={setWatchlistCap} />
            </Field>
          </div>
          {mutation.error ? <p className="text-sm text-danger">{mutation.error.message}</p> : null}
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Sending…" : "Invite"}
          </Button>
        </form>
      </div>
    </div>
  );
}
