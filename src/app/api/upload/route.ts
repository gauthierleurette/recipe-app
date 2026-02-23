import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const recipeId = formData.get("recipeId") as string;

  if (!file || !recipeId) {
    return NextResponse.json({ error: "file and recipeId are required" }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "uploads", recipeId);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  const image = await prisma.image.create({
    data: {
      path: `/uploads/${recipeId}/${filename}`,
      recipeId,
    },
  });

  return NextResponse.json(image, { status: 201 });
}
