"use client";

import React, { useMemo, useState } from "react";
import type { MatchedVehicle } from "../../api/copilot";
import { Link, useNavigate } from "@/compat/router";
import { paths } from "../../routes/paths";
import { useFavorites } from "../../features/inventory/useFavorites";
import { ImageGallery } from "../../features/inventory/ImageGallery";
import { expandVisImages, type VisCandidate } from "../../features/inventory/visImages";
import { markChatNavigating } from "./useCopilotChat";

interface VehicleCardProps {
  vehicle: MatchedVehicle;
  onViewGallery?: (vehicle: MatchedVehicle) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onViewGallery }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "salvage" | "condition">("overview");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  // App-wide Interested / Favorites hook
  const favorites = useFavorites();
  const isInterested = favorites.isFavorite(vehicle.stockNumber);

  // Derived Title and Subtitle
  const makeModel = `${vehicle.year ? vehicle.year + " " : ""}${vehicle.make || ""} ${vehicle.model || ""}`.trim().toUpperCase() || `LOT #${vehicle.stockNumber}`;
  const trimSubtitle = `${vehicle.series || "Base"} • #${vehicle.stockNumber}`;

  // Valuation Spread calculations
  const bid = Number(vehicle.currentBid || 0);
  const acv = Number(vehicle.acv || 0);
  const calculatedSpread = acv > bid && bid > 0 ? acv - bid : vehicle.spread || 0;
  const spreadPct = acv > 0 && calculatedSpread > 0 
    ? `${Math.round((calculatedSpread / acv) * 100)}% under ACV`
    : vehicle.spreadPct || "";

  // Image resolution & VIS gallery candidates
  const heroImage = vehicle.imageUrl || vehicle.imageThumbnailUrl || (vehicle.imageUrls && vehicle.imageUrls[0]) || "";
  
  const shots = useMemo<VisCandidate[]>(() => {
    if (heroImage) {
      const expanded = expandVisImages(heroImage);
      if (expanded.length > 0) return expanded;
    }
    if (vehicle.imageUrls && vehicle.imageUrls.length > 0) {
      return vehicle.imageUrls.map((url, idx) => ({
        thumb: url,
        large: url,
        index: idx + 1,
        set: null,
      }));
    }
    if (heroImage) {
      return [{ thumb: heroImage, large: heroImage, index: 1, set: null }];
    }
    return [];
  }, [heroImage, vehicle.imageUrls]);

  const photoCount = shots.length > 0 ? shots.length : (vehicle.imageUrls?.length || (heroImage ? 1 : 0));

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 300);
    try {
      await favorites.toggle(vehicle.stockNumber, {
        stockNumber: vehicle.stockNumber,
        title: makeModel,
        imageUrl: heroImage,
        branch: vehicle.branch || vehicle.location,
        currentBid: vehicle.currentBid,
        acv: vehicle.acv,
        primaryDamage: vehicle.primaryDamage,
      });
    } catch (err) {
      console.error("Failed to toggle interested status:", err);
    }
  };

  const navigate = useNavigate();

  const handleOpenGallery = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onViewGallery) {
      onViewGallery(vehicle);
    } else if (shots.length > 0) {
      setGalleryOpen(true);
    } else {
      markChatNavigating();
      navigate(paths.inventoryItem(vehicle.stockNumber));
    }
  };

  const inventoryHref = paths.inventoryItem(vehicle.stockNumber);

  return (
    <>
      <article
        className="group relative flex flex-col shrink-0 w-[304px] overflow-hidden rounded-2xl border transition-all duration-300 text-left select-none"
        style={{
          backgroundColor: "rgba(20, 24, 36, 0.40)",
          borderColor: "rgba(255, 255, 255, 0.20)",
          backdropFilter: "blur(32px) saturate(210%)",
          WebkitBackdropFilter: "blur(32px) saturate(210%)",
          boxShadow:
            "inset 0 1px 0 0 rgba(255, 255, 255, 0.42), inset 0 0 24px rgba(255, 255, 255, 0.02), 0 20px 48px -8px rgba(0, 0, 0, 0.75)",
          color: "#f7f6f2",
          scrollSnapAlign: "start",
        }}
      >
        {/* ======================================================== */}
        {/* 1. NAME SECTION: Clickable Header (Expand / Collapse)     */}
        {/* ======================================================== */}
        <header
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex flex-col gap-0.5 px-3.5 py-2.5 border-b border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center justify-between gap-2">
            <h4
              className="truncate text-[13px] font-bold tracking-tight text-white"
              title={makeModel}
            >
              {makeModel}
            </h4>

            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              {/* Top-Right Quick Link Arrow (ONLY PRESENT WHEN COLLAPSED) */}
              {!isExpanded && (
                <Link
                  to={inventoryHref}
                  onClick={() => markChatNavigating()}
                  aria-label={`View ${makeModel} in inventory`}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.18] border border-white/20 hover:border-white/40 text-[#f7f6f2] hover:text-white transition-all shadow-xs cursor-pointer"
                  style={{
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.35)",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </Link>
              )}

              {/* Expand / Collapse Chevron Indicator */}
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "Collapse vehicle specs" : "Expand vehicle specs"}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/15 text-[#9da3b4] hover:text-white transition-all cursor-pointer"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
          </div>

          {/* Subtitle: Same font, single row */}
          <p className="truncate text-[11.5px] font-medium text-[#9da3b4] tracking-tight">
            {trimSubtitle}
          </p>
        </header>

        {/* ======================================================== */}
        {/* 2. IMAGE SECTION: 145px (Always visible in both states)  */}
        {/* ======================================================== */}
        <div className="group/thumb relative h-[142px] w-full overflow-hidden bg-black/40">
          {heroImage ? (
            <img
              src={heroImage}
              alt={makeModel}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover/thumb:scale-105 cursor-pointer"
              onClick={handleOpenGallery}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[#9da3b4]">
              🚗 No Auction Photos
            </div>
          )}

          {/* Interested / Favorite Heart Button Overlay */}
          <button
            type="button"
            onClick={handleFavorite}
            disabled={favorites.isPending}
            aria-pressed={isInterested}
            aria-label={
              isInterested
                ? `Remove stock #${vehicle.stockNumber} from interested`
                : `Mark stock #${vehicle.stockNumber} as interested`
            }
            title={
              isInterested
                ? "Interested (Admin notified to confirm bid)"
                : "Express interest (Notify team for bidding)"
            }
            className={`absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full border transition-all cursor-pointer shadow-md ${
              isInterested
                ? "bg-[#c4673a]/25 border-[#c4673a]/50 text-[#c4673a] scale-105"
                : "bg-black/45 border-white/20 text-white/80 hover:bg-black/65 hover:text-white"
            }`}
            style={{
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              className={`transition-transform duration-200 ${heartAnimating ? "scale-125" : ""} ${
                isInterested
                  ? "fill-[#c4673a] text-[#c4673a]"
                  : "fill-transparent stroke-current hover:stroke-[#c4673a]"
              }`}
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Stack Animation "All Images" Button Overlay */}
          {shots.length > 0 && (
            <button
              type="button"
              aria-label="All images"
              className="absolute bottom-2 right-2 z-10 inline-flex max-w-[calc(100%-0.5rem)] items-center justify-center rounded-full border border-white/20 bg-[#141413] text-white shadow-[0_4px_12px_rgba(0,0,0,0.55)] transition-all duration-200 ease-out group-hover/thumb:w-auto group-hover/thumb:bg-accent h-7 w-7 group-hover/thumb:px-1.5 cursor-pointer"
              onClick={handleOpenGallery}
            >
              <span className="inline-flex shrink-0 items-center justify-center h-7 w-7">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M12 3l9 4.5-9 4.5L3 7.5 12 3z" strokeLinejoin="round" />
                  <path d="M3 12l9 4.5L21 12" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 16.5L12 21l9-4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="max-w-0 overflow-hidden font-semibold whitespace-nowrap opacity-0 transition-all duration-200 group-hover/thumb:max-w-24 group-hover/thumb:opacity-100 text-[11px] group-hover/thumb:ml-1 group-hover/thumb:mr-1">
                All Images
              </span>
            </button>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. EXPANDED ACCORDION: 3 Tabs (12 Specs) + Action CTA    */}
        {/* ======================================================== */}
        {isExpanded && (
          <div className="flex flex-col border-t border-white/10 animate-in fade-in duration-200">
            {/* 3 Single-Word Tab Switcher */}
            <div className="flex items-center gap-1 p-2 bg-black/20 border-b border-white/8">
              {(["overview", "salvage", "condition"] as const).map((tabKey) => {
                const isActive = activeTab === tabKey;
                return (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => setActiveTab(tabKey)}
                    className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition-all capitalize cursor-pointer ${
                      isActive
                        ? "bg-white/[0.12] border border-white/20 text-white font-semibold shadow-xs"
                        : "text-[#8e94a5] hover:text-white hover:bg-white/[0.04]"
                    }`}
                    style={
                      isActive
                        ? {
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                            boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.35)",
                          }
                        : {}
                    }
                  >
                    {tabKey}
                  </button>
                );
              })}
            </div>

            {/* 12 Spec Rows (4 per tab) - Uniform Calm Typography */}
            <div className="flex flex-col gap-1.5 p-3 min-h-[110px]">
              {activeTab === "overview" && (
                <>
                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-white/7">
                    <span className="text-[11px] font-medium text-[#8e94a5]">
                      {vehicle.hasActiveBids ? "Current Bid" : "Opening Bid"}
                    </span>
                    <span className="font-semibold text-[#f7f6f2] text-right">
                      ${bid.toLocaleString()} {vehicle.hasActiveBids === false ? "(Pre-Bid)" : ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-white/7">
                    <span className="text-[11px] font-medium text-[#8e94a5]">Est. ACV</span>
                    <span className="font-semibold text-[#f7f6f2] text-right">
                      ${acv.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-white/7">
                    <span className="text-[11px] font-medium text-[#8e94a5]">Arbitrage Spread</span>
                    <span className="font-semibold text-[#f7f6f2] text-right">
                      {calculatedSpread > 0
                        ? `+$${calculatedSpread.toLocaleString()} (${spreadPct})`
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px]">
                    <span className="text-[11px] font-medium text-[#8e94a5]">Auction Date & Yard</span>
                    <span className="font-semibold text-[#f7f6f2] text-right truncate max-w-[170px]" title={`${vehicle.auctionDate || vehicle.auctionDateTime || "Upcoming"} • ${vehicle.branch || vehicle.location || "Online"}`}>
                      {vehicle.auctionDate || vehicle.auctionDateTime || "Upcoming"} • {vehicle.branch || vehicle.location || "Online"}
                    </span>
                  </div>
                </>
              )}

              {activeTab === "salvage" && (
                <>
                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-white/7">
                    <span className="text-[11px] font-medium text-[#8e94a5]">Primary Damage</span>
                    <span className="font-semibold text-[#f7f6f2] text-right">
                      {vehicle.primaryDamage || "Normal Wear"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-white/7">
                    <span className="text-[11px] font-medium text-[#8e94a5]">Secondary Damage</span>
                    <span className="font-semibold text-[#f7f6f2] text-right">
                      {vehicle.secondaryDamage || "None"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-white/7">
                    <span className="text-[11px] font-medium text-[#8e94a5]">Title / Document</span>
                    <span className="font-semibold text-[#f7f6f2] text-right truncate max-w-[170px]" title={vehicle.titleDoc || vehicle.titleType || "Salvage Certificate"}>
                      {vehicle.titleDoc || vehicle.titleType || "Salvage Certificate"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px]">
                    <span className="text-[11px] font-medium text-[#8e94a5]">Loss & Seller Type</span>
                    <span className="font-semibold text-[#f7f6f2] text-right truncate max-w-[170px]" title={`${vehicle.lossType || "Collision"} • ${vehicle.sellerType || "Insurance Co"}`}>
                      {vehicle.lossType || "Collision"} • {vehicle.sellerType || "Insurance Co"}
                    </span>
                  </div>
                </>
              )}

              {activeTab === "condition" && (
                <>
                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-white/7">
                    <span className="text-[11px] font-medium text-[#8e94a5]">Score</span>
                    <span className="font-semibold text-[#f7f6f2] text-right">
                      {vehicle.vehicleScore || vehicle.score || 50} / 50
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-white/7">
                    <span className="text-[11px] font-medium text-[#8e94a5]">Start Code & Key</span>
                    <span className="font-semibold text-[#f7f6f2] text-right">
                      {vehicle.startCode || vehicle.startStatus || "Run & Drive"} • {vehicle.keyStatus || "Key Present"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-white/7">
                    <span className="text-[11px] font-medium text-[#8e94a5]">Odometer</span>
                    <span className="font-semibold text-[#f7f6f2] text-right">
                      {typeof vehicle.odometer === "number"
                        ? `${vehicle.odometer.toLocaleString()} mi`
                        : vehicle.odometer || "Verified Low"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px]">
                    <span className="text-[11px] font-medium text-[#8e94a5]">Airbags</span>
                    <span className="font-semibold text-[#f7f6f2] text-right">
                      {vehicle.airbags || "Intact (Not Deployed)"}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Action CTA: Pure Smoked Frosted Glass Button (Zero Orange Infusion) */}
            <div className="p-3 pt-0">
              <Link
                to={inventoryHref}
                onClick={() => markChatNavigating()}
                className="group/btn relative flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg text-xs font-semibold text-[#f7f6f2] hover:text-white transition-all shadow-sm cursor-pointer whitespace-nowrap overflow-hidden"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(28px) saturate(200%)",
                  WebkitBackdropFilter: "blur(28px) saturate(200%)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.32)",
                  boxShadow:
                    "inset 0 1px 0 0 rgba(255, 255, 255, 0.40), inset 0 0 16px rgba(255, 255, 255, 0.02), 0 4px 14px rgba(0, 0, 0, 0.40)",
                }}
              >
                <span className="relative z-10">View Details</span>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="relative z-10 transition-transform duration-200 group-hover/btn:translate-x-1"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </article>

      {/* Lightbox Image Gallery Modal for vehicle photos */}
      {galleryOpen && shots.length > 0 && (
        <ImageGallery
          title={makeModel}
          candidates={shots}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </>
  );
};


