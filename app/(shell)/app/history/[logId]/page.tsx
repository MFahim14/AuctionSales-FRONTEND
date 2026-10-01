"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const logId = params?.logId as string;

  useEffect(() => {
    if (logId) {
      router.replace(`/app/history?log=${encodeURIComponent(logId)}`);
    } else {
      router.replace("/app/history");
    }
  }, [logId, router]);

  return null;
}
