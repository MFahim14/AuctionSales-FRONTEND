"use client";

import { Suspense } from "react";
import { InventoryListPage } from "@/views/app/InventoryListPage";
import { Spinner } from "@/components/Spinner";

export default function Page() {
  return (
    <Suspense fallback={<Spinner label="Loading inventory..." />}>
      <InventoryListPage />
    </Suspense>
  );
}
