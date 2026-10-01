"use client";

import { Suspense } from "react";
import { ForgotConfirmPage } from "@/views/public/ForgotConfirmPage";
import { Spinner } from "@/components/Spinner";

export default function Page() {
  return (
    <Suspense fallback={<Spinner label="Loading..." />}>
      <ForgotConfirmPage />
    </Suspense>
  );
}
