import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(recipe);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, cuisine, prepTime, cookTime, servings, ingredients, steps, tags } = body;

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

  await prisma.ingredient.deleteMany({ where: { recipeId: params.id } });
  await prisma.step.deleteMany({ where: { recipeId: params.id } });
  await prisma.recipeTag.deleteMany({ where: { recipeId: params.id } });

  const recipe = await prisma.recipe.update({
    where: { id: params.id },
    data: {
      title,
      description,
      cuisine: cuisine || null,
      prepTime: prepTime ? Number(prepTime) : null,
      cookTime: cookTime ? Number(cookTime) : null,
      servings: servings ? Number(servings) : null,
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

  return NextResponse.json(recipe);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.recipe.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
