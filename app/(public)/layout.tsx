import { Suspense } from "react";
import { PublicLayout } from "@/layouts/PublicLayout";
import { FairOrb } from "@/components/orb/FairOrb";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      <Suspense fallback={<FairOrb state="working" label="Loading..." />}>
        {children}
      </Suspense>
    </PublicLayout>
  );
}
