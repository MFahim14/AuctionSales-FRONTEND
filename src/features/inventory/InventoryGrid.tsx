"use client";

import { Link } from "@/compat/router";
import type { InventoryItem } from "../../types/api";
import { paths } from "../../routes/paths";
import { toInventorySearch, type InventoryQuery } from "./query";
import { InventoryThumb } from "./InventoryThumb";
import { HeartFavoriteButton } from "./HeartFavoriteButton";

export function InventoryGrid({
  items,
  query,
  isFavorite,
  onToggleFavorite,
}: {
  items: InventoryItem[];
  query: InventoryQuery;
  isFavorite?: (stockNumber: string) => boolean;
  onToggleFavorite?: (item: InventoryItem) => void;
}) {
  const suffix = toInventorySearch(query, false).toString();
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.stockNumber} className="relative">
          <Link
            to={`${paths.inventoryItem(item.stockNumber)}${suffix ? `?${suffix}` : ""}`}
            className="block overflow-hidden rounded-[8px] border border-hairline bg-surface hover:border-accent"
          >
            <div className="relative">
              <InventoryThumb src={item.imageUrl} title={item.title} compact className="aspect-[16/10] w-full" />
              {isFavorite && onToggleFavorite ? (
                <div className="absolute top-2 right-2 z-10">
                  <HeartFavoriteButton
                    stockNumber={item.stockNumber}
                    isFavorite={isFavorite(item.stockNumber)}
                    onToggle={() => onToggleFavorite(item)}
                    size="md"
                    className="rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 shadow-sm"
                  />
                </div>
              ) : null}
            </div>
            <div className="space-y-1 p-3">
              <p className="font-medium leading-5">{item.title || item.stockNumber}</p>
              <p className="text-xs text-muted">
                {item.vehicleScore != null ? `Score ${item.vehicleScore}` : "No score"}
                {item.auctionDate ? ` · ${item.auctionDate}` : ""}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
