"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { patchMe } from "../../api/users";
import { Card } from "../../components/Card";
import { Dialog } from "../../components/Dialog";
import { EditableRow, StaticRow } from "../../components/EditableRow";
import { Field } from "../../components/Field";
import { Input } from "../../components/Input";
import { Pill } from "../../components/Pill";
import { useToast } from "../../components/Toast";
import { useTheme } from "../../theme/ThemeProvider";
import type { Appearance } from "../../theme/applyTheme";
import type { MeUser } from "../../types/api";

const appearanceOptions: Array<{ value: Appearance; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ProfileCard({ me }: { me: MeUser }) {
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const { appearance, setAppearance } = useTheme();
  const cap = me.watchlistCap ?? 5;
  const active = me.activeWatchlistCount ?? 0;
  const [nameOpen, setNameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(me.name ?? "");
  const [nameError, setNameError] = useState("");
  const [namePending, setNamePending] = useState(false);

  async function saveName() {
    setNameError("");
    setNamePending(true);
    try {
      await patchMe({ name: nameDraft.trim() });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      pushToast("Name saved", "success");
      setNameOpen(false);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Could not save name.");
    } finally {
      setNamePending(false);
    }
  }

  return (
    <Card className="space-y-5">
      <h2 className="font-serif text-xl">Profile</h2>
      <StaticRow label="Email" hint="Sign-in identity. Completion picks are sent here.">
        {me.email}
      </StaticRow>
      <EditableRow
        label="Name"
        value={me.name ?? ""}
        onEdit={() => {
          setNameDraft(me.name ?? "");
          setNameError("");
          setNameOpen(true);
        }}
      />
      <div className="grid gap-4 border-t border-hairline pt-4 sm:grid-cols-3">
        <StaticRow label="Role">{me.role}</StaticRow>
        <StaticRow label="Account">
          {me.isActive ? <Pill tone="success">Active</Pill> : <Pill tone="danger">Inactive</Pill>}
        </StaticRow>
        <StaticRow label="Active presets">
          <span className="tabular">
            {active} / {cap}
          </span>
        </StaticRow>
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-ink">Appearance</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {appearanceOptions.map((option) => {
            const selected = appearance === option.value;
            return (
              <label
                key={option.value}
                className={`cursor-pointer rounded-[6px] border px-4 py-2 text-sm ${
                  selected ? "border-accent bg-surface-muted" : "border-hairline"
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  name="appearance"
                  value={option.value}
                  checked={selected}
                  onChange={() => setAppearance(option.value)}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>
      <Dialog
        open={nameOpen}
        title="Edit name"
        confirmLabel="Save"
        pending={namePending}
        onClose={() => {
          if (!namePending) setNameOpen(false);
        }}
        onConfirm={() => void saveName()}
      >
        <Field label="Name" htmlFor="profile-name" error={nameError || undefined}>
          <Input
            id="profile-name"
            value={nameDraft}
            autoComplete="name"
            onChange={(event) => setNameDraft(event.target.value)}
          />
        </Field>
      </Dialog>
    </Card>
  );
}
