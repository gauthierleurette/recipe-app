"use client";

import { useState, useMemo } from "react";
import { RecipeCard } from "./RecipeCard";

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  cuisine: string | null;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  images: { path: string; alt: string }[];
  ingredients: { id: string; name: string; quantity: string | null; unit: string | null }[];
  tags: { tag: { id: string; name: string } }[];
  author: { id: string; name: string };
};

export function RecipeGrid({ recipes }: { recipes: Recipe[] }) {
  const [query, setQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const cuisines = useMemo(() => {
    const set = new Set(recipes.map((r) => r.cuisine).filter(Boolean) as string[]);
    return ["All", ...Array.from(set).sort()];
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
      const matchesCuisine = selectedCuisine === "All" || r.cuisine === selectedCuisine;
      const recipeTags = r.tags.map(({ tag }) => tag.name);
      const matchesTags = selectedTags.every((t) => recipeTags.includes(t));
      return matchesQuery && matchesCuisine && matchesTags;
    });
  }, [recipes, query, selectedCuisine, selectedTags]);

  const hasFilters = query || selectedCuisine !== "All" || selectedTags.length > 0;

  return (
    <div>
      {/* Search + cuisine filter */}
      <div className="flex gap-3 mb-4">
        <input
          type="search"
          placeholder="Search recipes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="field flex-1"
        />
        {cuisines.length > 1 && (
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="field w-auto"
          >
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
            <p>No recipes match your filters.</p>
          ) : (
            <p>No recipes yet.</p>
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
