"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteUser, getUser, patchUser } from "../../api/users";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { Field } from "../../components/Field";
import { IconTool } from "../../components/IconTool";
import { ValueStepper } from "../../components/PageStepper";
import { Spinner } from "../../components/Spinner";
import { useToast } from "../../components/Toast";
import type { Role } from "../../types/api";
import { RoleToggle } from "./RoleToggle";

export function UserEditModal({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const [watchlistCap, setWatchlistCap] = useState(5);
  const [isActive, setIsActive] = useState(true);
  const [role, setRole] = useState<Role>("User");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const user = useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUser(userId),
    enabled: Boolean(userId),
  });

  useEffect(() => {
    if (!user.data) {
      return;
    }
    setWatchlistCap(user.data.watchlistCap ?? 5);
    setIsActive(user.data.isActive !== false);
    setRole(user.data.role === "Admin" ? "Admin" : "User");
    const raw = user.data.phoneNumber ?? "";
    const digits = raw.startsWith("+1") ? raw.slice(2) : raw.replace(/\D/g, "");
    setPhoneNumber(digits.slice(0, 10));
  }, [user.data]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: () =>
      patchUser(userId, {
        watchlistCap,
        isActive,
        role,
        phoneNumber: phoneNumber.replace(/\D/g, "") ? `+1${phoneNumber.replace(/\D/g, "")}` : undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users", userId] });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      pushToast("User updated", "success");
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      pushToast("User deleted", "success");
      setDeleteConfirmOpen(false);
      onClose();
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const digits = phoneNumber.replace(/\D/g, "");
    if (role === "User") {
      if (!digits) {
        pushToast("Phone number cannot be removed for wholesale buyers", "error");
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
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-scrim p-4 backdrop-blur-[10px]" role="presentation" onClick={onClose}>
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-edit-title"
          className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[8px] border border-hairline bg-surface p-5 shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="user-edit-title" className="font-serif text-xl text-ink">User</h2>
              <p className="mt-1 text-sm text-muted">Role and cap apply on their next sign-in.</p>
            </div>
            <div className="flex items-center gap-1">
              {/* Delete (debug only) */}
              <IconTool label="Delete user (debug)" onClick={() => setDeleteConfirmOpen(true)}>
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-danger" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 11v6M14 11v6" strokeLinecap="round" />
                </svg>
              </IconTool>
              <IconTool label="Close" onClick={onClose}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </IconTool>
            </div>
          </div>
          {user.isLoading ? <Spinner /> : null}
          {user.error ? <p className="mt-4 text-sm text-danger">{user.error.message}</p> : null}
          {user.data ? (
            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
              <Field label="Email">
                <p className="break-words text-sm text-ink">{user.data.email}</p>
              </Field>
              <Field label="Name">
                <p className="break-words text-sm text-ink">{user.data.name || "—"}</p>
              </Field>
              <Field
                label={role === "User" ? "Phone number *" : "Phone number"}
                htmlFor="edit-phone"
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
                    id="edit-phone"
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
              <Field label="Account">
                <EnableDisableToggle value={isActive} onChange={setIsActive} />
              </Field>
              {/* Audit notes */}
              {user.data.disabledBy && !isActive ? (
                <p className="text-[11px] text-muted">Disabled by {user.data.disabledBy}</p>
              ) : null}
              {mutation.error ? <p className="text-sm text-danger">{mutation.error.message}</p> : null}
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving…" : "Save"}
              </Button>
            </form>
          ) : null}
        </div>
      </div>

      {/* Delete confirmation */}
      <Dialog
        open={deleteConfirmOpen}
        title="Delete user (debug)"
        confirmLabel={deleteMutation.isPending ? "Deleting…" : "Delete"}
        cancelLabel="Cancel"
        danger
        confirmDisabled={deleteMutation.isPending}
        pending={deleteMutation.isPending}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => void deleteMutation.mutateAsync()}
      >
        <p className="text-sm text-ink">
          Permanently delete <strong>{user.data?.email}</strong>?
        </p>
        <p className="mt-2 text-sm text-muted">
          This removes their sign-in access and hides them from the admin list. This action cannot be undone.
        </p>
        {deleteMutation.error ? (
          <p className="mt-2 text-sm text-danger">{deleteMutation.error.message}</p>
        ) : null}
      </Dialog>
    </>
  );
}

function EnableDisableToggle({ value, onChange }: { value: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={value}
      aria-label={value ? "Enabled" : "Disabled"}
      title={value ? "Enabled — click to disable" : "Disabled — click to enable"}
      onClick={() => onChange(!value)}
      className={`inline-flex h-8 items-center gap-1.5 rounded-[8px] border px-2.5 text-[13px] transition-colors duration-[120ms] ${
        value
          ? "border-accent bg-accent text-canvas"
          : "border-hairline bg-surface text-muted hover:bg-surface-muted hover:text-ink"
      }`}
    >
      {/* Power icon */}
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v5M6.3 6.3A8 8 0 1 0 17.7 6.3" strokeLinecap="round" />
      </svg>
      {value ? "Enabled" : "Disabled"}
    </button>
  );
}
