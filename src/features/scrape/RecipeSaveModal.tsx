"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { putAdminRecipe } from "../../api/scrape";
import { Button } from "../../components/Button";
import { IconTool } from "../../components/IconTool";
import { PinBoxInput } from "../../components/PinBoxInput";
import { Spinner } from "../../components/Spinner";
import { useToast } from "../../components/Toast";
import { serializeCatalog } from "./RecipeEditor";
import type { RecipeFormState } from "../watchlists/formState";

export function RecipeSaveModal({
  open,
  state,
  onClose,
  onSaved,
}: {
  open: boolean;
  state: RecipeFormState;
  onClose: () => void;
  onSaved: (version: string) => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { pushToast } = useToast();

  useEffect(() => {
    if (!open) { setPin(""); setError(""); return; }
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus(); };
  }, [open, onClose]);

  if (!open) return null;

  async function submit() {
    if (pin.length < 6) { setError("Enter all 6 digits."); return; }
    setError("");
    setPending(true);
    try {
      const result = await putAdminRecipe({ pin, filters: serializeCatalog(state) });
      await queryClient.invalidateQueries({ queryKey: ["recipe"] });
      const stripped = result.watchlistsStripped ?? 0;
      pushToast(
        stripped > 0
          ? `Recipe ${result.recipeVersion || "saved"}. ${stripped} presets updated.`
          : `Recipe ${result.recipeVersion || "saved"}.`,
        "success",
      );
      onSaved(result.recipeVersion || "");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-scrim p-4 backdrop-blur-[10px]" role="presentation" onClick={onClose}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="save-modal-title"
        className="w-full max-w-sm rounded-[12px] border border-hairline bg-surface p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="save-modal-title" className="font-serif text-2xl text-ink">Save recipe</h2>
            <p className="mt-1 text-sm text-muted">Enter your current 6-digit PIN to save.</p>
          </div>
          <IconTool label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </IconTool>
        </div>
        <div className="mt-6 space-y-5">
          <PinBoxInput value={pin} onChange={setPin} onComplete={submit} autoFocus label="Current PIN" />
          {error ? (
            <p className="rounded-[8px] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          ) : null}
          <Button className="w-full" disabled={pending || pin.length < 6} onClick={() => void submit()}>
            {pending ? <Spinner /> : "Save recipe"}
          </Button>
        </div>
      </div>
    </div>
  );
}
