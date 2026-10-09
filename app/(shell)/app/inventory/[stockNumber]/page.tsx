"use client";

import { Suspense } from "react";
import { InventoryDetailPage } from "@/views/app/InventoryDetailPage";
import { FairOrb } from "@/components/orb/FairOrb";

export default function Page() {
  return (
    <Suspense fallback={<FairOrb state="working" label="Loading vehicle details..." />}>
      <InventoryDetailPage />
    </Suspense>
  );
}
