import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const recipeId = formData.get("recipeId") as string;

  if (!file || !recipeId) {
    return NextResponse.json({ error: "file and recipeId are required" }, { status: 400 });
  }

  const imageCount = await prisma.image.count({ where: { recipeId } });
  if (imageCount >= 10) {
    return NextResponse.json({ error: "Max 10 images per recipe" }, { status: 400 });
  }

  const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 413 });
  }

  const filename = `${randomUUID()}.jpg`;
  const dir = path.join(process.cwd(), "uploads", recipeId);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const compressed = await sharp(buffer)
    .rotate()                                    // fix EXIF orientation (phone photos)
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  await writeFile(path.join(dir, filename), compressed);

  const image = await prisma.image.create({
    data: {
      path: `/uploads/${recipeId}/${filename}`,
      recipeId,
    },
  });

  return NextResponse.json(image, { status: 201 });
}
