"use client";

import { Suspense } from "react";
import { UserListPage } from "@/views/admin/UserListPage";
import { Spinner } from "@/components/Spinner";

export default function Page() {
  return (
    <Suspense fallback={<Spinner label="Loading user details..." />}>
      <UserListPage />
    </Suspense>
  );
}
