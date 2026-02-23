"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { RecipeCard } from "./RecipeCard";
import { useLocale } from "@/context/LocaleContext";

type Recipe = {
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

export function RecipeGrid({ recipes }: { recipes: Recipe[] }) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const cuisines = useMemo(() => {
    const set = new Set(recipes.map((r) => r.cuisine).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [recipes]);

  const allTags = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const r of recipes) {
      for (const { tag } of r.tags) map.set(tag.id, tag);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [recipes]);

  function toggleTag(name: string) {
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  }

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      const matchesQuery = r.title.toLowerCase().includes(query.toLowerCase());
      const matchesCuisine = selectedCuisine === "all" || r.cuisine === selectedCuisine;
      const recipeTags = r.tags.map(({ tag }) => tag.name);
      const matchesTags = selectedTags.every((t) => recipeTags.includes(t));
      return matchesQuery && matchesCuisine && matchesTags;
    });
  }, [recipes, query, selectedCuisine, selectedTags]);

  const hasFilters = query || selectedCuisine !== "all" || selectedTags.length > 0;

  if (recipes.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-stone-800 mb-6">{t.noRecipesYet}</h1>
        <div className="text-center py-16 text-stone-400">
          <p className="text-lg">{t.startBuilding}</p>
          <Link
            href="/recipes/new"
            className="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {t.addFirstRecipe}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">{t.recipes(recipes.length)}</h1>

      {/* Search + cuisine filter */}
      <div className="flex gap-3 mb-4">
        <input
          type="search"
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="field flex-1"
        />
        {cuisines.length > 0 && (
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="field w-auto"
          >
            <option value="all">{t.allCuisines}</option>
            {cuisines.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {allTags.map((tag) => {
            const active = selectedTags.includes(tag.name);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.name)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                  active
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-stone-600 border-stone-300 hover:border-orange-400 hover:text-orange-600"
                }`}
              >
                #{tag.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          {hasFilters ? (
            <p>{t.noResults}</p>
          ) : (
            <p>{t.noRecipesYet}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
