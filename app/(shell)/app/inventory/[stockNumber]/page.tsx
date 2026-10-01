"use client";

import { Suspense } from "react";
import { InventoryDetailPage } from "@/views/app/InventoryDetailPage";
import { Spinner } from "@/components/Spinner";

export default function Page() {
  return (
    <Suspense fallback={<Spinner label="Loading vehicle details..." />}>
      <InventoryDetailPage />
    </Suspense>
  );
}
