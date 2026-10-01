"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { patchMe } from "../../api/users";
import { Card } from "../../components/Card";
import { useToast } from "../../components/Toast";
import type { MeUser } from "../../types/api";

export function EmailOnZeroCard({ me }: { me: MeUser }) {
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const [pending, setPending] = useState(false);
  const on = Boolean(me.emailOnZeroMatches);

  async function toggle() {
    setPending(true);
    try {
      await patchMe({ emailOnZeroMatches: !on });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      pushToast(!on ? "Zero-match mail on" : "Zero-match mail off", "success");
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Could not save.", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="space-y-3">
      <h2 className="font-serif text-xl">Email on zero matches</h2>
      <p className="text-sm text-muted">
        Off by default. When on, Gmail still sends if the 09:00 desk finds no lots for a watchlist.
      </p>
      <label className="flex items-center justify-between gap-4 text-sm">
        <span>{on ? "On" : "Off"}</span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          disabled={pending}
          onClick={() => void toggle()}
          className={`relative h-7 w-12 rounded-full transition-colors duration-[120ms] ${
            on ? "bg-accent" : "bg-hairline"
          } disabled:opacity-40`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white transition-transform duration-[120ms] ${
              on ? "translate-x-5" : ""
            }`}
          />
        </button>
      </label>
    </Card>
  );
}
