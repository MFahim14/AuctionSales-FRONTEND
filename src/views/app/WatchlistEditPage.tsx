"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@/compat/router";
import { getMe } from "../../api/users";
import { getRecipe } from "../../api/recipe";
import { getPreset, patchPreset } from "../../api/presets";
import { Card } from "../../components/Card";
import { Spinner } from "../../components/Spinner";
import { hydrateFormState } from "../../features/watchlists/formState";
import { RecipeForm } from "../../features/watchlists/RecipeForm";
import { paths } from "../../routes/paths";
import type { RecipeFilters } from "../../types/filters";

export function WatchlistEditPage() {
  const { watchlistId = "" } = useParams();
  const watchlist = useQuery({
    queryKey: ["watchlist", watchlistId],
    queryFn: () => getPreset(watchlistId),
    enabled: Boolean(watchlistId),
  });
  const recipe = useQuery({ queryKey: ["recipe"], queryFn: getRecipe });
  const me = useQuery({ queryKey: ["me"], queryFn: getMe });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (watchlist.isLoading || me.isLoading || recipe.isLoading) {
    return <Spinner />;
  }
  if (watchlist.error) {
    return (
      <Card>
        <p className="text-sm text-danger">{watchlist.error.message}</p>
      </Card>
    );
  }
  if (recipe.error || !recipe.data?.filters) {
    return (
      <Card>
        <p className="text-sm text-danger">{recipe.error?.message || "Company recipe missing — ask an Admin."}</p>
      </Card>
    );
  }
  const item = watchlist.data;
  if (!item) {
    return (
      <Card>
        <p>Preset not found</p>
      </Card>
    );
  }
  const payload = typeof item.payload === "object" ? item.payload : undefined;
  const adminBanner =
    me.data && item.userId !== me.data.userId
      ? `Editing another user’s preset. (${item.username || item.userId})`
      : undefined;

  return (
    <div className="space-y-4">
      <div>
        <Link
          to={paths.watchlist(watchlistId)}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {item.name || "Preset"}
        </Link>
        <h1 className="mt-2 font-serif text-[28px] leading-9 tracking-[-0.03em] break-words lg:text-[34px] lg:leading-10">Edit preset</h1>
        <p className="mt-2 text-sm text-muted">
          Saved filters apply to the next automatic run.
        </p>
      </div>
      <RecipeForm
        recipe={recipe.data.filters}
        initial={hydrateFormState((payload ?? {}) as RecipeFilters)}
        initialName={item.name || ""}
        submitLabel="Save preset"
        banner={adminBanner}
        onSubmit={async (body) => {
          await patchPreset(watchlistId, body);
          await queryClient.invalidateQueries({ queryKey: ["watchlist", watchlistId] });
          await queryClient.invalidateQueries({ queryKey: ["watchlists"] });
          await queryClient.invalidateQueries({ queryKey: ["me"] });
          navigate(paths.watchlist(watchlistId));
        }}
      />
    </div>
  );
}
