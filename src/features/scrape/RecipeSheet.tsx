"use client";

import { useNavigate } from "@/compat/router";
import { IconTool } from "../../components/IconTool";
import { paths } from "../../routes/paths";

export { serializeCatalog } from "./RecipeEditor";

export function RecipeButton({ onClick }: { onClick?: () => void }) {
  const navigate = useNavigate();
  return (
    <IconTool label="Recipe" onClick={onClick ?? (() => navigate(paths.adminRecipe))}>
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="3.5" width="14" height="17" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
      </svg>
    </IconTool>
  );
}

// RecipeSheet is no longer used as a modal; stub kept so existing imports don't break.
export function RecipeSheet(_props: { open: boolean; onClose: () => void }) {
  return null;
}
