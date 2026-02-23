import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DeleteRecipeButton } from "@/components/DeleteRecipeButton";

export default async function RecipePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const recipe = await prisma.recipe.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true } },
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
      images: true,
      tags: { include: { tag: true } },
    },
  });

  if (!recipe) notFound();

  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">{recipe.title}</h1>
          <p className="text-sm text-stone-400 mt-1">
            by {recipe.author.name}
            {recipe.cuisine && (
              <span className="ml-2 badge">{recipe.cuisine}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0 ml-4">
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="text-sm text-orange-500 hover:text-orange-600 font-medium"
          >
            Edit
          </Link>
          <DeleteRecipeButton id={recipe.id} />
        </div>
      </div>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.tags.map(({ tag }) => (
            <span key={tag.id} className="tag-chip">#{tag.name}</span>
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="flex gap-4 text-sm text-stone-500 mb-6">
        {recipe.prepTime && <span>Prep: {recipe.prepTime} min</span>}
        {recipe.cookTime && <span>Cook: {recipe.cookTime} min</span>}
        {totalTime > 0 && <span className="font-medium">Total: {totalTime} min</span>}
        {recipe.servings && <span>{recipe.servings} servings</span>}
      </div>

      {/* Description */}
      {recipe.description && (
        <p className="text-stone-600 mb-6">{recipe.description}</p>
      )}

      {/* Images */}
      {recipe.images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-8">
          {recipe.images.map((img) => (
            <div key={img.id} className="relative h-52 rounded-xl overflow-hidden shadow-sm">
              <Image
                src={img.path}
                alt={img.alt || recipe.title}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Ingredients */}
      {recipe.ingredients.length > 0 && (
        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-stone-800 mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id} className="flex gap-2 text-stone-700 text-sm">
                {ing.quantity && (
                  <span className="font-medium text-stone-500 shrink-0">
                    {ing.quantity}
                    {ing.unit ? ` ${ing.unit}` : ""}
                  </span>
                )}
                <span>{ing.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Steps */}
      {recipe.steps.length > 0 && (
        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <h2 className="font-semibold text-stone-800 mb-4">Steps</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step) => (
              <li key={step.id} className="flex gap-4">
                <span className="shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full text-xs font-bold flex items-center justify-center mt-0.5">
                  {step.order}
                </span>
                <p className="text-stone-700 text-sm leading-relaxed">
                  {step.instruction}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
