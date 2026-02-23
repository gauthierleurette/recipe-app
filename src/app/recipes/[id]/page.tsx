import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DeleteRecipeButton } from "@/components/DeleteRecipeButton";
import { RecipeImageGrid } from "@/components/RecipeImageGrid";
import { getT } from "@/i18n/translations";

export default async function RecipePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const locale = cookies().get("locale")?.value ?? "en";
  const t = getT(locale);

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

  const formattedDate = recipe.madeOn
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
        new Date(recipe.madeOn)
      )
    : null;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink leading-tight">{recipe.title}</h1>
          <p className="text-sm text-ink-3 mt-1">
            {t.by} {recipe.author.name}
            {recipe.cuisine && (
              <span className="ml-2 badge">{recipe.cuisine}</span>
            )}
          </p>
          {formattedDate && (
            <p className="text-sm text-ink-3 mt-0.5">
              {t.madeOnLabel} {formattedDate}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 shrink-0 ml-4">
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="text-sm text-brand hover:text-brand-hover font-medium"
          >
            {t.edit}
          </Link>
          <DeleteRecipeButton id={recipe.id} />
        </div>
      </div>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.tags.map(({ tag }) => (
            <span key={tag.id} className="tag-chip">#{t.tagLabels[tag.name] ?? tag.name}</span>
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="flex gap-4 text-sm text-ink-2 mb-6">
        {recipe.prepTime && <span>{t.prepTime} {recipe.prepTime} {t.min}</span>}
        {recipe.cookTime && <span>{t.cookTime} {recipe.cookTime} {t.min}</span>}
        {totalTime > 0 && <span className="font-medium">{t.totalTime} {totalTime} {t.min}</span>}
        {recipe.servings && <span>{t.servings(recipe.servings)}</span>}
      </div>

      {/* Description */}
      {recipe.description && (
        <p className="text-ink-2 mb-6">{recipe.description}</p>
      )}

      {/* Images */}
      <RecipeImageGrid images={recipe.images} title={recipe.title} />

      {/* Ingredients */}
      {recipe.ingredients.length > 0 && (
        <section className="bg-surface rounded-2xl border border-rim shadow-sm p-6 mb-6">
          <h2 className="font-display font-semibold text-ink mb-4">{t.ingredientsSection}</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id} className="flex gap-2 text-ink-2 text-sm">
                {ing.quantity && (
                  <span className="font-medium text-ink-3 shrink-0">
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
        <section className="bg-surface rounded-2xl border border-rim shadow-sm p-6">
          <h2 className="font-display font-semibold text-ink mb-4">{t.stepsSection}</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step) => (
              <li key={step.id} className="flex gap-4">
                <span className="shrink-0 w-6 h-6 bg-brand-mid text-brand rounded-full text-xs font-bold flex items-center justify-center mt-0.5">
                  {step.order}
                </span>
                <p className="text-ink-2 text-sm leading-relaxed">
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
