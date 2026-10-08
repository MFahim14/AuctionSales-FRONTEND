import { Suspense } from "react";
import { PublicInventoryPage } from "@/views/public/PublicInventoryPage";

export default function InventoryRoute() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
      </div>
    }>
      <PublicInventoryPage />
    </Suspense>
  );
}
