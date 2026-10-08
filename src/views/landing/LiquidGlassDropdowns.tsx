"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { RangeSlider } from "@/components/RangeSlider";

export interface DropdownOption {
  value: string;
  label: string;
  count?: number;
  subtitle?: string;
  icon?: React.ReactNode;
}

/* ==========================================================================
   1. LIQUID GLASS SELECT POPOVER (Searchable, Multi/Single, Custom Chips)
   ========================================================================== */
export interface LiquidGlassSelectProps {
  label: string;
  placeholder?: string;
  icon?: React.ReactNode;
  options: DropdownOption[];
  value: string[];
  onChange: (next: string[]) => void;
  multiSelect?: boolean;
  searchable?: boolean;
  align?: "start" | "end";
  className?: string;
}

export function LiquidGlassSelect({
  label,
  placeholder = "Select...",
  icon,
  options,
  value,
  onChange,
  multiSelect = true,
  searchable = true,
  align = "start",
  className = "",
}: LiquidGlassSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  // Close on outside click or Escape key
  useEffect(() => {
    function handlePointer(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handlePointer);
      document.addEventListener("keydown", handleKey);
    }
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Filter options based on query
  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  function toggle(val: string) {
    if (multiSelect) {
      if (value.includes(val)) {
        onChange(value.filter((item) => item !== val));
      } else {
        onChange([...value, val]);
      }
    } else {
      if (value.includes(val)) {
        onChange([]);
      } else {
        onChange([val]);
      }
      setOpen(false);
    }
  }

  function clearAll(e: React.MouseEvent) {
    e.stopPropagation();
    onChange([]);
  }

  // Generate trigger button label
  let triggerText = placeholder;
  if (value.length === 1) {
    const match = options.find((o) => o.value === value[0]);
    triggerText = match?.label ?? value[0];
  } else if (value.length > 1) {
    const match = options.find((o) => o.value === value[0]);
    triggerText = `${match?.label ?? value[0]} (+${value.length - 1})`;
  }

  return (
    <div ref={containerRef} className={`input-field-block lg-select-wrap ${className}`}>
      <span className="input-field-label">{label}</span>

      {/* Trigger Capsule */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => setOpen((prev) => !prev)}
        className={`lg-field-trigger ${open ? "is-open" : ""} ${value.length > 0 ? "has-value" : ""}`}
      >
        <div className="lg-trigger-left">
          {icon ? <span className="field-icon">{icon}</span> : null}
          <span className={`lg-trigger-text ${value.length === 0 ? "is-placeholder" : ""}`}>
            {triggerText}
          </span>
        </div>

        <div className="lg-trigger-right">
          {value.length > 0 ? (
            <span
              role="button"
              tabIndex={0}
              onClick={clearAll}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") clearAll(e as any);
              }}
              title="Clear selection"
              className="lg-clear-pill"
            >
              ×
            </span>
          ) : null}
        </div>
      </button>

      {/* Floating Liquid Glass Popover */}
      {open ? (
        <div
          id={popoverId}
          role="listbox"
          aria-multiselectable={multiSelect}
          className={`lg-popover-panel ${align === "end" ? "align-end" : "align-start"}`}
        >
          {/* Active Tag Chips (Multi-select) */}
          {multiSelect && value.length > 0 ? (
            <div className="lg-active-chips-bar">
              <div className="lg-chips-scroll">
                {value.map((val) => {
                  const match = options.find((o) => o.value === val);
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => toggle(val)}
                      className="lg-active-chip"
                      title="Remove"
                    >
                      <span>{match?.label ?? val}</span>
                      <span className="lg-chip-remove">×</span>
                    </button>
                  );
                })}
              </div>
              <button type="button" onClick={() => onChange([])} className="lg-clear-all-btn">
                Clear
              </button>
            </div>
          ) : null}

          {/* Search Box inside Popover */}
          {searchable ? (
            <div className="lg-popover-search">
              <svg viewBox="0 0 24 24" className="lg-search-glyph" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="lg-search-input"
                autoFocus
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} className="lg-search-clear">
                  ×
                </button>
              ) : null}
            </div>
          ) : null}

          {/* Options List */}
          <div className="lg-options-list">
            {filtered.length === 0 ? (
              <div className="lg-no-results">No matching options</div>
            ) : (
              filtered.map((opt) => {
                const isSelected = value.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggle(opt.value)}
                    className={`lg-option-row ${isSelected ? "is-selected" : ""}`}
                  >
                    <div className="lg-option-left">
                      {multiSelect ? (
                        <span className={`lg-checkbox-box ${isSelected ? "is-checked" : ""}`}>
                          {isSelected ? (
                            <svg viewBox="0 0 24 24" className="lg-check-svg" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : null}
                        </span>
                      ) : null}
                      {opt.icon ? <span className="lg-option-icon">{opt.icon}</span> : null}
                      <span className="lg-option-title">{opt.label}</span>
                      {opt.subtitle ? <span className="lg-option-sub">{opt.subtitle}</span> : null}
                    </div>

                    {opt.count !== undefined ? (
                      <span className="lg-option-count">{opt.count.toLocaleString()}</span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          {/* Bottom Action Footer for multi-select */}
          {multiSelect ? (
            <div className="lg-popover-footer">
              <span className="lg-footer-summary">
                {value.length === 0 ? "No filters selected" : `${value.length} selected`}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="lg-footer-apply-btn"
              >
                Done
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ==========================================================================
   2. LIQUID GLASS PRICE RANGE POPOVER (Presets + Dual Range Slider)
   ========================================================================== */
export interface LiquidGlassPriceRangeProps {
  label?: string;
  minPrice: number;
  maxPrice: number;
  onChange: (lo: number, hi: number) => void;
  absoluteMin?: number;
  absoluteMax?: number;
}

const PRICE_PRESETS = [
  { label: "Under $15k", min: 0, max: 15000 },
  { label: "$15k – $25k", min: 15000, max: 25000 },
  { label: "$25k – $35k", min: 25000, max: 35000 },
  { label: "$35k – $50k", min: 35000, max: 50000 },
  { label: "$50k+", min: 50000, max: 100000 },
];

export function LiquidGlassPriceRange({
  label = "Price",
  minPrice,
  maxPrice,
  onChange,
  absoluteMin = 0,
  absoluteMax = 100000,
}: LiquidGlassPriceRangeProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  useEffect(() => {
    function handlePointer(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handlePointer);
      document.addEventListener("keydown", handleKey);
    }
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const hasFilter = minPrice > absoluteMin || maxPrice < absoluteMax;

  let displayLabel = "Any Price";
  if (hasFilter) {
    if (minPrice === 0) {
      displayLabel = `Under $${(maxPrice / 1000).toFixed(0)}k`;
    } else if (maxPrice >= absoluteMax) {
      displayLabel = `$${(minPrice / 1000).toFixed(0)}k+`;
    } else {
      displayLabel = `$${(minPrice / 1000).toFixed(0)}k – $${(maxPrice / 1000).toFixed(0)}k`;
    }
  }

  function handleReset(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(absoluteMin, absoluteMax);
  }

  return (
    <div ref={containerRef} className="input-field-block lg-price-wrap">
      <span className="input-field-label">{label}</span>

      {/* Trigger Capsule */}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => setOpen((prev) => !prev)}
        className={`lg-field-trigger ${open ? "is-open" : ""} ${hasFilter ? "has-value" : ""}`}
      >
        <div className="lg-trigger-left">
          <span className="field-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
              <circle cx="7" cy="7" r=".5" fill="currentColor" />
            </svg>
          </span>
          <span className={`lg-trigger-text ${!hasFilter ? "is-placeholder" : ""}`}>
            {displayLabel}
          </span>
        </div>

        <div className="lg-trigger-right">
          {hasFilter ? (
            <span
              role="button"
              tabIndex={0}
              onClick={handleReset}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleReset(e as any);
              }}
              title="Reset price"
              className="lg-clear-pill"
            >
              ×
            </span>
          ) : null}
        </div>
      </button>

      {/* Floating Price Popover */}
      {open ? (
        <div id={popoverId} role="dialog" className="lg-popover-panel lg-price-popover">
          <div className="lg-price-header">
            <span className="lg-price-title">Price Range</span>
            {hasFilter ? (
              <button type="button" onClick={() => onChange(absoluteMin, absoluteMax)} className="lg-reset-link">
                Reset
              </button>
            ) : null}
          </div>

          {/* Quick Preset Pills */}
          <div className="lg-price-presets">
            {PRICE_PRESETS.map((preset) => {
              const active = minPrice === preset.min && maxPrice === preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChange(preset.min, preset.max)}
                  className={`lg-preset-pill ${active ? "is-active" : ""}`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Range Slider Container */}
          <div className="lg-slider-section">
            <RangeSlider
              label="Vehicle Price"
              min={absoluteMin}
              max={absoluteMax}
              step={1000}
              lo={minPrice}
              hi={maxPrice}
              format={(val) => `$${val.toLocaleString()}`}
              onChange={({ lo, hi }) => onChange(lo, hi)}
            />
          </div>

          {/* Min & Max Quick Inputs */}
          <div className="lg-price-inputs-row">
            <div className="lg-price-input-col">
              <span className="lg-price-sublabel">Min Price</span>
              <div className="lg-price-input-box">
                <span className="lg-currency">$</span>
                <input
                  type="number"
                  step="1000"
                  min={absoluteMin}
                  max={maxPrice}
                  value={minPrice}
                  onChange={(e) => onChange(Math.min(Number(e.target.value) || 0, maxPrice), maxPrice)}
                  className="lg-currency-input"
                />
              </div>
            </div>

            <span className="lg-price-dash">–</span>

            <div className="lg-price-input-col">
              <span className="lg-price-sublabel">Max Price</span>
              <div className="lg-price-input-box">
                <span className="lg-currency">$</span>
                <input
                  type="number"
                  step="1000"
                  min={minPrice}
                  max={absoluteMax}
                  value={maxPrice}
                  onChange={(e) => onChange(minPrice, Math.max(Number(e.target.value) || 0, minPrice))}
                  className="lg-currency-input"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="lg-popover-footer">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="lg-footer-apply-btn w-full"
            >
              Apply Filter
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
