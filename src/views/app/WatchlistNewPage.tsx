"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@/compat/router";
import { getMe } from "../../api/users";
import { getRecipe } from "../../api/recipe";
import { createPreset } from "../../api/presets";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { FairOrb } from "../../components/orb/FairOrb";
import { emptyFormState } from "../../features/watchlists/formState";
import { watchlistCreateBlock } from "../../features/watchlists/helpers";
import { RecipeForm } from "../../features/watchlists/RecipeForm";
import { paths } from "../../routes/paths";

export function WatchlistNewPage() {
  const me = useQuery({ queryKey: ["me"], queryFn: getMe });
  const recipe = useQuery({ queryKey: ["recipe"], queryFn: getRecipe });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const block = watchlistCreateBlock(me.data);

  if (me.isLoading || recipe.isLoading) {
    return <FairOrb state="working" />;
  }
  if (block.blocked) {
    return (
      <Card className="space-y-3">
        <h1 className="font-serif text-[28px] leading-9 tracking-[-0.03em] break-words lg:text-[34px] lg:leading-10">New preset</h1>
        <p className="text-sm text-ink">{block.reason}</p>
        {block.href ? (
          <Link to={block.href} className="text-sm text-accent">
            Continue
          </Link>
        ) : (
          <Button variant="secondary" onClick={() => navigate(paths.watchlists)}>
            Back
          </Button>
        )}
      </Card>
    );
  }
  if (recipe.error || !recipe.data?.filters) {
    return (
      <Card className="space-y-3">
        <h1 className="font-serif text-[28px] leading-9 tracking-[-0.03em]">New preset</h1>
        <p className="text-sm text-danger">{recipe.error?.message || "Company recipe missing — ask an Admin."}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Link
          to={paths.watchlists}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Presets
        </Link>
        <h1 className="mt-2 font-serif text-[28px] leading-9 tracking-[-0.03em] break-words lg:text-[34px] lg:leading-10">New preset</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          A new preset starts enabled and runs every day at 8:00 AM Chicago.
        </p>
      </div>
      <RecipeForm
        recipe={recipe.data.filters}
        initial={emptyFormState()}
        submitLabel="Save preset"
        onSubmit={async (body) => {
          const created = await createPreset(body);
          await queryClient.invalidateQueries({ queryKey: ["me"] });
          await queryClient.invalidateQueries({ queryKey: ["watchlists"] });
          navigate(paths.watchlist(created.watchlistId));
        }}
      />
    </div>
  );
}
