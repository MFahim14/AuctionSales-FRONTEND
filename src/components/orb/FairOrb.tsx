"use client";

import { ThinkingOrb, type OrbState } from "thinking-orbs";
import "./fair-orb.css";

type OrbPlace = "inline" | "page" | "panel";

export function FairOrb({
  state,
  size = 64,
  label,
  place = "page",
}: {
  state: OrbState;
  size?: 20 | 64;
  label?: string;
  place?: OrbPlace;
}) {
  const caption = label ?? (place === "inline" ? undefined : "Loading");
  const orb = <ThinkingOrb state={state} size={size} theme="auto" aria-label={caption || "Loading"} />;

  if (place === "inline") {
    return (
      <div className="fair-orb-inline" role="status">
        {orb}
        {caption ? <span>{caption}</span> : null}
      </div>
    );
  }

  return (
    <div className={place === "page" ? "fair-orb-page" : "fair-orb-panel"} role="status">
      <div className="fair-orb-stack">
        {orb}
        {caption ? <span>{caption}</span> : null}
      </div>
    </div>
  );
}
