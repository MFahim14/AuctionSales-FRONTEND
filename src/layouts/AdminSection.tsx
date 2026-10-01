"use client";

import { Outlet } from "@/compat/router";
import type { ReactNode } from "react";

export function AdminSection({ children }: { children?: ReactNode } = {}) {
  return children ? <>{children}</> : <Outlet />;
}
