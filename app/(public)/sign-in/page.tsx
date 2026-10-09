"use client";

import { Suspense } from "react";
import { SignInPage } from "@/views/public/SignInPage";
import { RedirectIfSignedIn } from "@/routes/guards";
import { FairOrb } from "@/components/orb/FairOrb";

export default function Page() {
  return (
    <Suspense fallback={<FairOrb state="working" label="Loading sign in..." />}>
      <RedirectIfSignedIn>
        <SignInPage />
      </RedirectIfSignedIn>
    </Suspense>
  );
}
