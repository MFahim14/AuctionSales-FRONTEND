"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPublicInventoryItem } from "../../api/publicInventory";
import { Spinner } from "../../components/Spinner";
import { CopilotDrawer } from "../../components/copilot/CopilotDrawer";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { InventoryThumb } from "../../features/inventory/InventoryThumb";
import { CARD_GROUPS, formatCardValue } from "../../features/inventory/cardFields";
import { SHOWCASE_INVENTORY } from "../../features/inventory/showcaseData";
import { paths } from "../../routes/paths";

export function PublicInventoryDetailPage() {
  const params = useParams();
  const stockNumber = (params?.stockNumber as string) || "";
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const itemQuery = useQuery({
    queryKey: ["public-inventory-item", stockNumber],
    queryFn: async () => {
      try {
        const live = await getPublicInventoryItem(stockNumber);
        if (live && live.stockNumber) return live;
      } catch {
        // Fallback to showcase inventory for preview
      }
      const found = SHOWCASE_INVENTORY.find((i) => i.stockNumber === stockNumber);
      if (found) return found;
      // If direct match not found, return first showcase item as demo
      return SHOWCASE_INVENTORY[0];
    },
    enabled: Boolean(stockNumber),
  });

  if (itemQuery.isLoading) {
    return (
      <div className="flex min-h-dvh flex-col bg-canvas text-ink">
        <PublicHeader mode="inventory" />
        <div className="public-page-frame flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  const row = itemQuery.data || SHOWCASE_INVENTORY[0];
  const heading = row.title || row.stockNumber;

  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-ink">
      <PublicHeader mode="inventory" />

      <main className="public-page-frame min-w-0 flex-1 space-y-3">
        <Link href="/inventory" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Inventory
        </Link>

        <h1 className="text-balance font-serif text-[28px] leading-9 tracking-[-0.03em] lg:text-[40px] lg:leading-[1.15] text-ink">
          {heading}
        </h1>

        <div className="grid min-h-0 gap-5 lg:grid-cols-[minmax(24rem,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          {/* Main Thumbnail with Favorite Heart */}
          <div className="relative group/thumb overflow-hidden rounded-[8px]">
            <InventoryThumb
              src={row.imageUrl}
              title={row.title}
              className="aspect-[16/10] w-full rounded-[8px] border border-hairline lg:aspect-auto lg:h-[min(420px,48vh)] lg:max-h-[min(420px,48vh)]"
            />
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              aria-label="Save to watchlist"
              title="Save to watchlist"
              className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white/90 backdrop-blur-md transition-all shadow-md hover:bg-black/80 hover:scale-110 active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none text-white stroke-white" strokeWidth="2">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Facts Specifications Grid */}
          <div className="grid min-h-0 grid-cols-2 gap-x-5 gap-y-4 xl:grid-cols-4">
            {CARD_GROUPS.map((group) => {
              const facts = group.fields
                .map((field) => ({ field, value: formatCardValue(row, field.id) }))
                .filter((fact) => fact.value !== "—");
              if (facts.length === 0) return null;
              return (
                <section key={group.id} className="min-w-0 space-y-2">
                  <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
                    {group.label}
                  </h2>
                  <dl className="space-y-2">
                    {facts.map(({ field, value }) => (
                      <div key={field.id} className="min-w-0">
                        <dt className="text-xs text-muted">{field.label}</dt>
                        <dd className="break-words text-[15px] leading-5 text-ink" title={value}>
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              );
            })}
          </div>
        </div>

        {/* CTA Bar */}
        <div className="pt-4 flex flex-wrap items-center gap-3">
          <Link
            href={`${paths.signIn}?next=/inventory/${row.stockNumber}`}
            className="flex h-11 items-center justify-center rounded-[10px] bg-accent px-6 text-[13px] font-semibold text-white shadow-sm hover:opacity-95 transition"
          >
            Sign In to Bid / Watch Lot
          </Link>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="flex h-11 items-center justify-center rounded-[10px] border border-hairline bg-surface px-5 text-[13px] font-medium text-ink hover:bg-surface-muted transition"
          >
            Express Interest
          </button>
        </div>
      </main>

      {/* 3. COPILOT DRAWER */}
      <CopilotDrawer publicDock />

      {/* 4. GUEST WATCHLIST MODAL */}
      {authModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setAuthModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[380px] rounded-[16px] border border-hairline bg-surface p-6 shadow-2xl space-y-4"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-accent/15 text-accent">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-[20px] leading-6 tracking-[-0.02em] text-ink">
                Save Lot #{row.stockNumber}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                Sign in to your FairPy account to track live bids, set damage alerts, and receive instant SMS notifications when lots run on the block.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href={`${paths.signIn}?next=/inventory/${row.stockNumber}`}
                className="flex h-10 w-full items-center justify-center rounded-[10px] bg-accent text-[13px] font-medium text-white shadow-sm hover:opacity-95 transition"
              >
                Sign In / Register
              </Link>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="flex h-10 w-full items-center justify-center rounded-[10px] border border-hairline bg-surface text-[13px] font-medium text-muted hover:bg-surface-muted hover:text-ink transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
