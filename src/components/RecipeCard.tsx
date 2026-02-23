"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";

type RecipeCardProps = {
  recipe: {
    id: string;
    title: string;
    description: string | null;
    cuisine: string | null;
    madeOn: Date | string | null;
    prepTime: number | null;
    cookTime: number | null;
    servings: number | null;
    images: { path: string; alt: string }[];
    ingredients: { id: string; name: string; quantity: string | null; unit: string | null }[];
    tags: { tag: { id: string; name: string } }[];
    author: { id: string; name: string };
  };
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { t, locale } = useLocale();
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  const formattedDate = recipe.madeOn
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
        new Date(recipe.madeOn)
      )
    : null;

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col overflow-hidden">
        {recipe.images[0] ? (
          <div className="relative h-48 w-full">
            <Image
              src={recipe.images[0].path}
              alt={recipe.images[0].alt || recipe.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-48 bg-stone-100 flex items-center justify-center text-stone-300 text-4xl">
            🍽
          </div>
        )}

        <div className="p-4 flex flex-col flex-1">
          <h2 className="font-semibold text-stone-800 text-lg leading-tight mb-1">
            {recipe.title}
          </h2>

          <p className="text-xs text-stone-400 mb-1">{t.by} {recipe.author.name}</p>

          {recipe.cuisine && (
            <span className="badge mb-2 self-start">{recipe.cuisine}</span>
          )}

          {recipe.description && (
            <p className="text-sm text-stone-500 mb-3 line-clamp-2">
              {recipe.description}
            </p>
          )}

          <div className="mt-auto space-y-2">
            <div className="flex items-center gap-3 text-xs text-stone-400">
              {totalTime > 0 && <span>{totalTime} {t.min}</span>}
              {recipe.servings && <span>{t.servings(recipe.servings)}</span>}
              {recipe.ingredients.length > 0 && (
                <span>{t.ingredientsCount(recipe.ingredients.length)}</span>
              )}
            </div>

            {formattedDate && (
              <p className="text-xs text-stone-400">
                {t.madeOnLabel} {formattedDate}
              </p>
            )}

            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {recipe.tags.map(({ tag }) => (
                  <span key={tag.id} className="tag-chip">
                    #{t.tagLabels[tag.name] ?? tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
