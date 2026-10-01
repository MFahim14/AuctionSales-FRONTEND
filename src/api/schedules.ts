import type { CrawlSchedule } from "../types/api";
import { apiGet, apiSend } from "./client";

export function listCrawlSchedules(): Promise<CrawlSchedule[]> {
  return apiGet<CrawlSchedule[]>("/admin/schedules");
}

export function createCrawlSchedule(body: Omit<CrawlSchedule, "scheduleId">): Promise<CrawlSchedule> {
  return apiSend<CrawlSchedule>("/admin/schedules", "POST", body);
}

export function patchCrawlSchedule(
  scheduleId: string,
  body: Partial<Omit<CrawlSchedule, "scheduleId">>,
): Promise<CrawlSchedule> {
  return apiSend<CrawlSchedule>(`/admin/schedules/${encodeURIComponent(scheduleId)}`, "PATCH", body);
}

export function deleteCrawlSchedule(scheduleId: string): Promise<{ scheduleId: string }> {
  return apiSend(`/admin/schedules/${encodeURIComponent(scheduleId)}`, "DELETE");
}
