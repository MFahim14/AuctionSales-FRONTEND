"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { putAdminRecipe } from "../../api/scrape";
import { Button } from "../../components/Button";
import { IconTool } from "../../components/IconTool";
import { PinBoxInput } from "../../components/PinBoxInput";
import { Spinner } from "../../components/Spinner";
import { useToast } from "../../components/Toast";

export function RecipePinChangeModal({
  open,
  onClose,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"current" | "new" | "confirm">("current");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { pushToast } = useToast();

  useEffect(() => {
    if (!open) {
      setCurrentPin(""); setNewPin(""); setConfirmPin("");
      setStep("current"); setError("");
      return;
    }
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus(); };
  }, [open, onClose]);

  if (!open) return null;

  async function submit() {
    if (newPin !== confirmPin) { setError("New PINs do not match."); return; }
    if (newPin.length < 6) { setError("New PIN must be 6 digits."); return; }
    setError("");
    setPending(true);
    try {
      await putAdminRecipe({ pin: currentPin, newPin });
      await queryClient.invalidateQueries({ queryKey: ["recipe"] });
      pushToast("PIN updated.", "success");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update PIN.");
      setStep("current");
      setCurrentPin(""); setNewPin(""); setConfirmPin("");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-scrim p-4 backdrop-blur-[10px]" role="presentation" onClick={onClose}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="pin-change-title"
        className="w-full max-w-sm rounded-[12px] border border-hairline bg-surface p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="pin-change-title" className="font-serif text-2xl text-ink">Update PIN</h2>
            <p className="mt-1 text-sm text-muted">
              {step === "current" && "Enter your current 6-digit PIN."}
              {step === "new" && "Enter a new 6-digit PIN."}
              {step === "confirm" && "Confirm your new PIN."}
            </p>
          </div>
          <IconTool label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </IconTool>
        </div>
        {/* Step dots */}
        <div className="mt-4 flex items-center gap-2">
          {(["current", "new", "confirm"] as const).map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors duration-[200ms] ${step === s ? "bg-accent" : s < step ? "bg-accent/40" : "bg-hairline"}`} />
          ))}
        </div>
        <div className="mt-6 space-y-5">
          {step === "current" && (
            <PinBoxInput value={currentPin} onChange={setCurrentPin}
              onComplete={(p) => { setCurrentPin(p); setStep("new"); }}
              autoFocus label="Current PIN" />
          )}
          {step === "new" && (
            <PinBoxInput value={newPin} onChange={setNewPin}
              onComplete={(p) => { setNewPin(p); setStep("confirm"); }}
              autoFocus label="New PIN" />
          )}
          {step === "confirm" && (
            <PinBoxInput value={confirmPin} onChange={setConfirmPin}
              onComplete={(p) => { setConfirmPin(p); }}
              autoFocus label="Confirm new PIN" />
          )}
          {error ? (
            <p className="rounded-[8px] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          ) : null}
          {step === "confirm" ? (
            <Button className="w-full" disabled={pending || confirmPin.length < 6} onClick={() => void submit()}>
              {pending ? <Spinner /> : "Update PIN"}
            </Button>
          ) : (
            <Button variant="secondary" className="w-full" onClick={() => {
              if (step === "current" && currentPin.length === 6) setStep("new");
              else if (step === "new" && newPin.length === 6) setStep("confirm");
            }}>
              Next →
            </Button>
          )}
          {step !== "current" ? (
            <button type="button" className="w-full text-center text-xs text-muted hover:text-ink"
              onClick={() => { if (step === "new") { setStep("current"); setCurrentPin(""); } else { setStep("new"); setConfirmPin(""); } }}>
              ← Back
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
