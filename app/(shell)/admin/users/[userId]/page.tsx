"use client";

import { Suspense } from "react";
import { UserListPage } from "@/views/admin/UserListPage";
import { FairOrb } from "@/components/orb/FairOrb";

export default function Page() {
  return (
    <Suspense fallback={<FairOrb state="working" label="Loading user details..." />}>
      <UserListPage />
    </Suspense>
  );
}
