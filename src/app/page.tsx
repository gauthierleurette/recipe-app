import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RecipeGrid } from "@/components/RecipeGrid";
import { getT } from "@/i18n/translations";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const t = getT(cookies().get("locale")?.value);

  const recipes = await prisma.recipe.findMany({
    include: {
      author: { select: { id: true, name: true } },
      images: { take: 1 },
      ingredients: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">
        {recipes.length === 0 ? t.noRecipesYet : t.recipes(recipes.length)}
      </h1>

      {recipes.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-lg">{t.startBuilding}</p>
          <Link
            href="/recipes/new"
            className="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {t.addFirstRecipe}
          </Link>
        </div>
      ) : (
        <RecipeGrid recipes={recipes} />
      )}
    </div>
  );
}
