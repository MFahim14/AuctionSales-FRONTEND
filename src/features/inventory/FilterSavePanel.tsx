"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPreset } from "../../api/presets";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useToast } from "../../components/Toast";
import type { RecipeFilters } from "../../types/filters";
import type { InventoryQuery } from "./query";
import { queryToRecipe } from "./presetBridge";

export function FilterSavePanel({
  query,
  recipe,
  onClose,
}: {
  query: InventoryQuery;
  recipe: RecipeFilters;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const mutation = useMutation({
    mutationFn: () =>
      createPreset({
        name: name.trim(),
        payload: queryToRecipe(query, recipe),
        isActive: true,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      pushToast(`Preset "${name.trim()}" saved.`, "success");
      onClose();
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (name.trim()) {
      void mutation.mutateAsync();
    }
  }

  return (
    <form className="space-y-2" onSubmit={onSubmit}>
      <p className="text-xs font-medium text-ink">Save filters as preset</p>
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Preset name"
        aria-label="Preset name"
        required
        autoFocus
      />
      {mutation.error ? (
        <p className="text-xs text-danger">{mutation.error.message}</p>
      ) : null}
      <div className="flex items-center gap-2">
        <Button type="submit" className="h-8 px-3 text-xs" disabled={!name.trim() || mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save"}
        </Button>
        <button
          type="button"
          className="text-xs text-muted hover:text-ink"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
