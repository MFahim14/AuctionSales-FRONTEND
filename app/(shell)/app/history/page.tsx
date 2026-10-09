"use client";

import { Suspense } from "react";
import { ActivityPage } from "@/views/app/ActivityPage";
import { FairOrb } from "@/components/orb/FairOrb";

export default function Page() {
  return (
    <Suspense fallback={<FairOrb state="working" label="Loading history..." />}>
      <ActivityPage />
    </Suspense>
  );
}
