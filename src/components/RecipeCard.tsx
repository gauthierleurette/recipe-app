import Link from "next/link";
import Image from "next/image";

type RecipeCardProps = {
  recipe: {
    id: string;
    title: string;
    description: string | null;
    prepTime: number | null;
    cookTime: number | null;
    servings: number | null;
    images: { path: string; alt: string }[];
    ingredients: { id: string; name: string; quantity: string | null; unit: string | null }[];
    author: { id: string; name: string };
  };
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
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

          {recipe.description && (
            <p className="text-sm text-stone-500 mb-3 line-clamp-2">
              {recipe.description}
            </p>
          )}

          <div className="mt-auto flex items-center gap-3 text-xs text-stone-400">
            {totalTime > 0 && <span>{totalTime} min</span>}
            {recipe.servings && <span>{recipe.servings} servings</span>}
            {recipe.ingredients.length > 0 && (
              <span>{recipe.ingredients.length} ingredients</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
