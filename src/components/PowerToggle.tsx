"use client";

export function PowerToggle({
  on,
  label,
  onClick,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-[color,box-shadow] duration-300 ease-out motion-reduce:transition-none ${
        on ? "text-[#30d158]" : "text-[#ff453a]"
      }`}
      style={{ boxShadow: "0 0 12px color-mix(in srgb, currentColor 42%, transparent)" }}
    >
      <span aria-hidden="true" className="absolute inset-0 rounded-full bg-current opacity-[0.16]" />
      <svg viewBox="0 0 24 24" className="relative h-[18px] w-[18px]" fill="none" aria-hidden="true">
        <path
          d="M7.05 6.4a7.15 7.15 0 1 0 9.9 0"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
        <path d="M12 3.15v6.7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    </button>
  );
}
