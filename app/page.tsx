import { Suspense } from "react";
import { LandingPage } from "@/views/landing/LandingPage";

export default function RootPage() {
  return (
    <Suspense>
      <LandingPage />
    </Suspense>
  );
}
