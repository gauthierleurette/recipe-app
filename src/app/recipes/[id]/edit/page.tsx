import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RecipeForm } from "@/components/RecipeForm";

export default async function EditRecipePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

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
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Edit recipe</h1>
      <RecipeForm
        initial={{
          id: recipe.id,
          title: recipe.title,
          description: recipe.description ?? "",
          cuisine: recipe.cuisine ?? "",
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
