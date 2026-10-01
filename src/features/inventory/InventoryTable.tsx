"use client";

import { useNavigate } from "@/compat/router";
import { Table, type Column } from "../../components/Table";
import type { InventoryItem } from "../../types/api";
import { paths } from "../../routes/paths";
import { toInventorySearch, type InventoryQuery } from "./query";
import { InventoryThumb } from "./InventoryThumb";

function money(value?: number) {
  if (value == null) {
    return "—";
  }
  return `$${value.toLocaleString("en-US")}`;
}

export function InventoryTable({
  items,
  query,
}: {
  items: InventoryItem[];
  query: InventoryQuery;
}) {
  const navigate = useNavigate();
  const suffix = toInventorySearch(query, false).toString();
  const columns: Array<Column<InventoryItem>> = [
    {
      key: "thumb",
      header: "",
      cell: (row) => (
        <InventoryThumb src={row.imageUrl} title={row.title} compact className="h-16 w-24 rounded-[6px]" />
      ),
    },
    {
      key: "title",
      header: "Lot",
      cell: (row) => (
        <span>
          <span className="block font-medium">{row.title || row.stockNumber}</span>
          <span className="block text-xs text-muted">{row.stockNumber}</span>
        </span>
      ),
    },
    { key: "year", header: "Year", className: "tabular", cell: (row) => row.year ?? "—" },
    { key: "odo", header: "Odo", className: "tabular", cell: (row) => row.odometer?.toLocaleString() ?? "—" },
    { key: "score", header: "Score", className: "tabular", cell: (row) => row.vehicleScore ?? "—" },
    { key: "damage", header: "Damage", cell: (row) => row.primaryDamage || "—" },
    { key: "auction", header: "Auction", cell: (row) => row.auctionDate || "—" },
    { key: "buy", header: "Buy now", className: "tabular", cell: (row) => money(row.buyNowPrice) },
  ];

  return (
    <Table
      columns={columns}
      rows={items}
      rowKey={(row) => row.stockNumber}
      onRowClick={(row) =>
        navigate(`${paths.inventoryItem(row.stockNumber)}${suffix ? `?${suffix}` : ""}`)
      }
    />
  );
}
