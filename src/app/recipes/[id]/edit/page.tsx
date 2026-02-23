import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RecipeForm } from "@/components/RecipeForm";
import { getT } from "@/i18n/translations";

export default async function EditRecipePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const t = getT(cookies().get("locale")?.value);

  const recipe = await prisma.recipe.findUnique({
    where: { id: params.id },
    include: {
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
      tags: { include: { tag: true } },
    },
  });

  if (!recipe) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">{t.editRecipe}</h1>
      <RecipeForm
        initial={{
          id: recipe.id,
          title: recipe.title,
          description: recipe.description ?? "",
          cuisine: recipe.cuisine ?? "",
          madeOn: recipe.madeOn ? recipe.madeOn.toISOString() : null,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          ingredients: recipe.ingredients.map((i) => ({
            name: i.name,
            quantity: i.quantity ?? "",
            unit: i.unit ?? "",
          })),
          steps: recipe.steps.map((s) => ({ instruction: s.instruction })),
          tags: recipe.tags.map(({ tag }) => tag.name),
        }}
      />
    </div>
  );
}
