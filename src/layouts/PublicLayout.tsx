"use client";

import { Outlet } from "@/compat/router";
import type { ReactNode } from "react";
import { BrandWordmark } from "@/components/layout/BrandWordmark";

export function PublicLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-5 py-12">
        <BrandWordmark size="display" />
        <div className="mt-8">
          {children ?? <Outlet />}
        </div>
      </div>
      <p className="pb-6 text-center text-xs text-muted">Invite only.</p>
    </div>
  );
}
