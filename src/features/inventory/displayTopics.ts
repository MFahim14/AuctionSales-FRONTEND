import type { CardFieldId } from "./cardFields";
import { fieldLabel, formatCardValue } from "./cardFields";
import type { InventoryItem } from "../../types/api";

export type DisplayTopicId = "vehicle" | "condition" | "build" | "sale" | "auction";

export type DisplayTopic = {
  id: DisplayTopicId;
  label: string;
  fields: CardFieldId[];
};

export const DISPLAY_TOPICS: DisplayTopic[] = [
  {
    id: "vehicle",
    label: "Vehicle",
    fields: [
      "stockNumber",
      "year",
      "titleDoc",
      "primaryDamage",
      "secondaryDamage",
      "lossType",
      "newInvTime",
      "vehicleType",
      "vehicleSubtype",
    ],
  },
  {
    id: "condition",
    label: "Condition",
    fields: ["odometer", "vehicleScore", "startCode", "airbags", "keyStatus", "extColor", "intColor"],
  },
  {
    id: "build",
    label: "Build data",
    fields: ["engine", "fuelType", "cylinders", "vin", "transmission", "drivelineType", "bodyStyle", "countryOfOrigin"],
  },
  {
    id: "sale",
    label: "Sale info",
    fields: ["branch", "laneRun", "market", "seller", "sellerType", "acv", "region"],
  },
  {
    id: "auction",
    label: "Auction",
    fields: ["auctionDate", "buyNowPrice"],
  },
];

const LABELED = new Set<CardFieldId>(["stockNumber", "vehicleScore", "acv"]);

export function visibleTopics(selected: CardFieldId[]): DisplayTopic[] {
  const on = new Set(selected);
  return DISPLAY_TOPICS.filter((topic) => topic.id === "vehicle" || topic.fields.some((id) => on.has(id))).map(
    (topic) => ({
      ...topic,
      fields: topic.fields.filter((id) => on.has(id)),
    }),
  );
}

export function formatFactLine(item: InventoryItem, id: CardFieldId): string | null {
  const text = formatCardValue(item, id);
  if (text === "—") {
    return null;
  }
  if (id === "buyNowPrice") {
    return `Buy now ${text}`;
  }
  if (!LABELED.has(id)) {
    return text;
  }
  const label = fieldLabel(id);
  if (id === "vin" || id === "acv") {
    return `${label} · ${text}`;
  }
  return `${label}: ${text}`;
}
