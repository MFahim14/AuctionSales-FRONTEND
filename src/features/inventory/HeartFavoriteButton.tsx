"use client";

import { useState } from "react";

export function HeartFavoriteButton({
  stockNumber,
  isFavorite,
  onToggle,
  disabled = false,
  className = "",
  size = "md",
  showLabel = false,
}: {
  stockNumber: string;
  isFavorite: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  const [animating, setAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
    onToggle();
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const buttonPaddings = {
    sm: "p-1 rounded-md",
    md: "p-1.5 rounded-lg",
    lg: "p-2 rounded-lg",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={isFavorite}
      aria-label={
        isFavorite
          ? `Remove stock #${stockNumber} from interested`
          : `Mark stock #${stockNumber} as interested`
      }
      title={
        isFavorite
          ? "Interested (Admin notified to confirm bid)"
          : "Express interest (Notify team for bidding)"
      }
      className={`group relative inline-flex items-center gap-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c4673a] ${buttonPaddings[size]} ${
        isFavorite
          ? "bg-[#c4673a]/10 text-[#c4673a] hover:bg-[#c4673a]/20"
          : "text-muted hover:bg-surface-muted hover:text-ink"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`${iconSizes[size]} transition-transform duration-200 ${
          animating ? "scale-125" : ""
        } ${
          isFavorite
            ? "fill-[#c4673a] text-[#c4673a]"
            : "fill-transparent stroke-current hover:stroke-[#c4673a]"
        }`}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showLabel ? (
        <span
          className={`text-xs font-semibold ${
            isFavorite ? "text-[#c4673a]" : "text-muted group-hover:text-ink"
          }`}
        >
          {isFavorite ? "Interested" : "Interested?"}
        </span>
      ) : null}
    </button>
  );
}
