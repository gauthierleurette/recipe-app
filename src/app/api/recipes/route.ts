import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const recipes = await prisma.recipe.findMany({
    include: {
      author: { select: { id: true, name: true } },
      images: { take: 1 },
      ingredients: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(recipes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, cuisine, prepTime, cookTime, servings, ingredients, steps, tags } = body;

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  // Upsert tags and collect their IDs
  const tagConnects = await Promise.all(
    (tags ?? [] as string[]).map(async (name: string) => {
      const tag = await prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      return { tagId: tag.id };
    })
  );

  const recipe = await prisma.recipe.create({
    data: {
      title,
      description,
      cuisine: cuisine || null,
      prepTime: prepTime ? Number(prepTime) : null,
      cookTime: cookTime ? Number(cookTime) : null,
      servings: servings ? Number(servings) : null,
      authorId: session.user.id,
      ingredients: {
        create: (ingredients ?? []).map(
          (ing: { name: string; quantity?: string; unit?: string }, i: number) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            order: i,
          })
        ),
      },
      steps: {
        create: (steps ?? []).map((s: { instruction: string }, i: number) => ({
          order: i + 1,
          instruction: s.instruction,
        })),
      },
      tags: { create: tagConnects },
    },
    include: { ingredients: true, steps: true, images: true, tags: { include: { tag: true } } },
  });

  return NextResponse.json(recipe, { status: 201 });
}
