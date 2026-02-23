import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Serves files from /uploads in development.
// In production, Caddy serves /uploads directly (faster, no Node overhead).
export async function GET(
  _: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const filePath = path.join(process.cwd(), "uploads", ...params.path);

  // Prevent path traversal
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!filePath.startsWith(uploadsDir)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const file = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".gif"
        ? "image/gif"
        : ext === ".webp"
        ? "image/webp"
        : "image/jpeg";

    return new NextResponse(file, {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
