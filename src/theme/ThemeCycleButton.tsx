"use client";

import { ThemeGlyph } from "./ThemeGlyph";
import { useTheme } from "./ThemeProvider";
import type { Appearance } from "./applyTheme";

const ORDER: Appearance[] = ["light", "dark", "system"];

export function ThemeCycleButton() {
  const { appearance, setAppearance } = useTheme();
  const next = ORDER[(ORDER.indexOf(appearance) + 1) % ORDER.length];
  const label = `Theme ${appearance}. Click for ${next}.`;

  return (
    <button
      type="button"
      className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-muted hover:bg-surface-muted hover:text-ink"
      aria-label={label}
      title={label}
      onClick={() => setAppearance(next)}
    >
      <ThemeGlyph appearance={appearance} />
    </button>
  );
}
