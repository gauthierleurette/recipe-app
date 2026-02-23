import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RecipeGrid } from "@/components/RecipeGrid";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const recipes = await prisma.recipe.findMany({
    include: {
      author: { select: { id: true, name: true } },
      images: { take: 1 },
      ingredients: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <RecipeGrid recipes={recipes} />;
}
