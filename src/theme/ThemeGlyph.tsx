import type { Appearance } from "./applyTheme";

function Icon({
  path,
  label,
}: {
  path: string;
  label: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <title>{label}</title>
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ThemeGlyph({ appearance }: { appearance: Appearance }) {
  if (appearance === "dark") {
    return (
      <Icon
        label="Dark"
        path="M21 14.3A8.5 8.5 0 1 1 9.7 3 7 7 0 0 0 21 14.3z"
      />
    );
  }
  if (appearance === "system") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <title>System</title>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 20h8M12 17v3" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <title>Light</title>
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 3v1.5M12 19.5V21M4.9 4.9l1.1 1.1M18 18l1.1 1.1M3 12h1.5M19.5 12H21M4.9 19.1 6 18M18 6l1.1-1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
