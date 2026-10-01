import type { ActivityLog, ActivityLogDetail } from "../types/api";
import { chicagoTodayDate } from "../date/chicago";
import { apiGet } from "./client";

export function listHistory(query?: { date?: string; userIds?: string[] }): Promise<ActivityLog[]> {
  const params = new URLSearchParams();
  params.set("date", query?.date || chicagoTodayDate());
  if (query?.userIds && query.userIds.length > 0) {
    params.set("userId", query.userIds.join(","));
  }
  return apiGet<ActivityLog[]>(`/history?${params.toString()}`);
}

export function getHistory(runId: string): Promise<ActivityLogDetail> {
  const params = new URLSearchParams();
  params.set("runId", runId);
  return apiGet<ActivityLogDetail>(`/history?${params.toString()}`);
}
