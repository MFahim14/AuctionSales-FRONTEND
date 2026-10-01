"use client";

import { Suspense } from "react";
import { SignInPage } from "@/views/public/SignInPage";
import { RedirectIfSignedIn } from "@/routes/guards";
import { Spinner } from "@/components/Spinner";

export default function Page() {
  return (
    <Suspense fallback={<Spinner label="Loading sign in..." />}>
      <RedirectIfSignedIn>
        <SignInPage />
      </RedirectIfSignedIn>
    </Suspense>
  );
}
