"use client";

import { useBlocker } from "@/compat/router";
import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Dialog } from "../../components/Dialog";
import { Field } from "../../components/Field";
import { Input } from "../../components/Input";
import type { RecipeFilters } from "../../types/filters";
import {
  RECIPE_BOOL_KEYS,
  RECIPE_LABELS,
  RECIPE_LIST_KEYS,
  RECIPE_RANGE_KEYS,
} from "../../types/filters";
import { FacetMultiSelect } from "./FacetMultiSelect";
import { FacetRange } from "./FacetRange";
import { buildRequestBody } from "./buildRequestBody";
import {
  emptyFormState,
  recipeHasBool,
  recipeHasList,
  recipeHasRange,
  type RecipeFormState,
} from "./formState";

export type WatchlistSave = {
  name: string;
  payload: RecipeFilters;
};

export function RecipeFacets({
  recipe,
  state,
  onChange,
}: {
  recipe: RecipeFilters;
  state: RecipeFormState;
  onChange: (next: RecipeFormState) => void;
}) {
  const bools = RECIPE_BOOL_KEYS.filter((key) => recipeHasBool(recipe, key));
  const ranges = RECIPE_RANGE_KEYS.filter((key) => recipeHasRange(recipe, key));
  const lists = RECIPE_LIST_KEYS.filter((key) => recipeHasList(recipe, key));

  function patch(next: Partial<RecipeFormState>) {
    onChange({ ...state, ...next });
  }

  return (
    <div className="space-y-6">
      {bools.length > 0 ? (
        <section className="space-y-3">
          <h3 className="font-serif text-lg">Musts</h3>
          <div className="space-y-2">
            {bools.map((key) => (
              <label key={key} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--accent)]"
                  checked={state[key]}
                  onChange={(event) => patch({ [key]: event.target.checked })}
                />
                {RECIPE_LABELS[key]}
              </label>
            ))}
          </div>
        </section>
      ) : null}
      {ranges.length > 0 ? (
        <section className="space-y-4">
          <h3 className="font-serif text-lg">Ranges</h3>
          {ranges.map((key) => {
            const bounds = recipe[key];
            const minBound = bounds?.min ?? 0;
            const maxBound = bounds?.max ?? 100;
            return (
              <FacetRange
                key={key}
                label={`${RECIPE_LABELS[key]} (${minBound}–${maxBound})`}
                value={state[key]}
                minBound={minBound}
                maxBound={maxBound}
                onChange={(next) => patch({ [key]: next })}
              />
            );
          })}
        </section>
      ) : null}
      {lists.length > 0 ? (
        <section className="space-y-4">
          <h3 className="font-serif text-lg">Lists</h3>
          {lists.map((key) => (
            <FacetMultiSelect
              key={key}
              label={RECIPE_LABELS[key]}
              options={recipe[key] || []}
              value={state[key]}
              onChange={(next) => patch({ [key]: next })}
            />
          ))}
        </section>
      ) : null}
    </div>
  );
}

export function RecipeForm({
  recipe,
  initial,
  initialName = "",
  submitLabel,
  banner,
  onSubmit,
}: {
  recipe: RecipeFilters;
  initial?: RecipeFormState;
  initialName?: string;
  submitLabel: string;
  banner?: string;
  onSubmit: (body: WatchlistSave) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [state, setState] = useState<RecipeFormState>(initial ?? emptyFormState());
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const blocker = useBlocker(dirty && !pending);

  useEffect(() => {
    setName(initialName);
    if (initial) {
      setState(initial);
    }
  }, [initial, initialName]);

  function mark(next: RecipeFormState) {
    setDirty(true);
    setState(next);
  }

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required.");
      return;
    }
    setError("");
    setPending(true);
    try {
      await onSubmit({
        name: trimmed,
        payload: buildRequestBody(state, recipe),
      });
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      {banner ? (
        <p className="rounded-[8px] border border-warning px-4 py-3 text-sm text-warning">{banner}</p>
      ) : null}
      <Card className="space-y-4">
        <Field label="Name" htmlFor="wl-name">
          <Input
            id="wl-name"
            value={name}
            onChange={(event) => {
              setDirty(true);
              setName(event.target.value);
            }}
          />
        </Field>
      </Card>
      <Card>
        <RecipeFacets
          recipe={recipe}
          state={state}
          onChange={(next) => {
            setDirty(true);
            mark(next);
          }}
        />
      </Card>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button disabled={pending} onClick={() => void save()}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
      <Dialog
        open={blocker.state === "blocked"}
        title="Discard unsaved filters?"
        confirmLabel="Leave"
        danger
        onClose={() => blocker.reset?.()}
        onConfirm={() => blocker.proceed?.()}
      >
        Changes on this page are not saved yet.
      </Dialog>
    </div>
  );
}
