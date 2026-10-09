"use client";

import { Suspense } from "react";
import { AppShell } from "@/layouts/AppShell";
import { RequireAuth } from "@/routes/guards";
import { FairOrb } from "@/components/orb/FairOrb";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<FairOrb state="working" label="Loading..." />}>
      <RequireAuth>
        <AppShell>{children}</AppShell>
      </RequireAuth>
    </Suspense>
  );
}
