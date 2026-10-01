import type {
  CreateWatchlistResult,
  PatchWatchlistBody,
  PatchWatchlistResult,
  RecipeFilters,
  WatchlistDetail,
  WatchlistSummary,
} from "../types/api";
import { apiGet, apiSend } from "./client";

export type PresetWrite = {
  name: string;
  isActive?: boolean;
  payload: RecipeFilters;
  schedule?: PatchWatchlistBody["schedule"];
};

export function createPreset(body: PresetWrite): Promise<CreateWatchlistResult> {
  return apiSend<CreateWatchlistResult>("/presets", "POST", body);
}

export function listPresets(query?: {
  lastRunStatus?: string;
  userId?: string;
  includeLlmFallback?: boolean;
  all?: boolean;
}): Promise<WatchlistSummary[]> {
  const params = new URLSearchParams();
  if (query?.lastRunStatus) {
    params.set("lastRunStatus", query.lastRunStatus);
  }
  if (query?.userId) {
    params.set("userId", query.userId);
  }
  if (query?.includeLlmFallback) {
    params.set("includeLlmFallback", "true");
  }
  if (query?.all) {
    params.set("all", "true");
  }
  const suffix = params.toString();
  return apiGet<WatchlistSummary[]>(suffix ? `/presets?${suffix}` : "/presets");
}

export function getPreset(presetId: string): Promise<WatchlistDetail> {
  return apiGet<WatchlistDetail>(`/presets/${encodeURIComponent(presetId)}`);
}

export function patchPreset(presetId: string, body: PatchWatchlistBody): Promise<PatchWatchlistResult> {
  return apiSend<PatchWatchlistResult>(`/presets/${encodeURIComponent(presetId)}`, "PATCH", body);
}

export function deletePreset(presetId: string): Promise<{ watchlistId: string; presetId?: string }> {
  return apiSend(`/presets/${encodeURIComponent(presetId)}`, "DELETE");
}

export function runPresetNow(presetId: string): Promise<{ presetId: string; executionArn?: string }> {
  return apiSend(`/presets/${encodeURIComponent(presetId)}/run`, "POST", {});
}
