import type { PublicRecipe } from "../types/api";
import { apiGet } from "./client";

export function getRecipe(): Promise<PublicRecipe> {
  return apiGet<PublicRecipe>("/recipe");
}
