import { Suspense } from "react";
import { PublicLayout } from "@/layouts/PublicLayout";
import { Spinner } from "@/components/Spinner";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      <Suspense fallback={<Spinner label="Loading..." />}>
        {children}
      </Suspense>
    </PublicLayout>
  );
}
