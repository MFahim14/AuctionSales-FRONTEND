"use client";

import { Suspense } from "react";
import { ForgotConfirmPage } from "@/views/public/ForgotConfirmPage";
import { FairOrb } from "@/components/orb/FairOrb";

export default function Page() {
  return (
    <Suspense fallback={<FairOrb state="working" label="Loading..." />}>
      <ForgotConfirmPage />
    </Suspense>
  );
}
