"use client";

import { Suspense } from "react";
import { AppShell } from "@/layouts/AppShell";
import { RequireAuth } from "@/routes/guards";
import { Spinner } from "@/components/Spinner";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Spinner label="Loading..." />}>
      <RequireAuth>
        <AppShell>{children}</AppShell>
      </RequireAuth>
    </Suspense>
  );
}
