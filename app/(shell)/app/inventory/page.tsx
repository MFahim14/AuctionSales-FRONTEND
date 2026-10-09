"use client";

import { Suspense } from "react";
import { InventoryListPage } from "@/views/app/InventoryListPage";
import { FairOrb } from "@/components/orb/FairOrb";

export default function Page() {
  return (
    <Suspense fallback={<FairOrb state="working" label="Loading inventory..." />}>
      <InventoryListPage />
    </Suspense>
  );
}
