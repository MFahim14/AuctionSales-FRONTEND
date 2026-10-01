"use client";

import { Suspense } from "react";
import { ActivityPage } from "@/views/app/ActivityPage";
import { Spinner } from "@/components/Spinner";

export default function Page() {
  return (
    <Suspense fallback={<Spinner label="Loading history..." />}>
      <ActivityPage />
    </Suspense>
  );
}
