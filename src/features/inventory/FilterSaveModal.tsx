"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPreset } from "../../api/presets";
import { Button } from "../../components/Button";
import { IconTool } from "../../components/IconTool";
import { Input } from "../../components/Input";
import { useToast } from "../../components/Toast";
import type { RecipeFilters } from "../../types/filters";
import { inventoryFacetCount, type InventoryQuery } from "./query";
import { queryToRecipe } from "./presetBridge";

export function FilterSaveModal({
  open,
  query,
  recipe,
  onClose,
}: {
  open: boolean;
  query: InventoryQuery;
  recipe: RecipeFilters;
  onClose: () => void;
}) {
  const hasFilters = inventoryFacetCount(query) > 0;
  const [name, setName] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const mutation = useMutation({
    mutationFn: () =>
      createPreset({ name: name.trim(), payload: queryToRecipe(query, recipe), isActive: true }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      pushToast(`Preset "${name.trim()}" saved.`, "success");
      onClose();
    },
  });

  const { reset } = mutation;
  useEffect(() => {
    if (!open) { setName(""); reset(); return; }
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => panelRef.current?.querySelector<HTMLInputElement>("input")?.focus(), 0);
    return () => { document.removeEventListener("keydown", onKey); clearTimeout(t); prev?.focus(); };
  }, [open, onClose, reset]);

  if (!open) return null;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim()) void mutation.mutateAsync();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-scrim p-4 backdrop-blur-[10px]" role="presentation" onClick={onClose}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="save-wl-title"
        className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-[8px] border border-hairline bg-surface p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="save-wl-title" className="font-serif text-xl text-ink">Save as preset</h2>
          <p className="mt-1 text-sm text-muted">
              {hasFilters ? "Current filters will be saved as a new preset." : "Apply at least one filter to save."}
            </p>
          </div>
          <IconTool label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </IconTool>
        </div>
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Preset name" aria-label="Preset name" required disabled={!hasFilters} />
          {mutation.error ? <p className="text-sm text-danger">{mutation.error.message}</p> : null}
          <Button type="submit" className="w-full" disabled={!hasFilters || !name.trim() || mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save"}
          </Button>
        </form>
      </div>
    </div>
  );
}
