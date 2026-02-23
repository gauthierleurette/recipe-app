import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const image = await prisma.image.findUnique({ where: { id: params.id } });
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify the requesting user owns the recipe
  const recipe = await prisma.recipe.findUnique({ where: { id: image.recipeId } });
  if (!recipe || recipe.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete file from disk (best-effort)
  try {
    await unlink(path.join(process.cwd(), image.path));
  } catch {
    // File may not exist on disk — continue to delete DB record
  }

  await prisma.image.delete({ where: { id: params.id } });

  return new NextResponse(null, { status: 204 });
}
