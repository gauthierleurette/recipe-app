// @vitest-environment node
import { createMockPrisma, type MockPrisma } from "@/__tests__/helpers/mock-prisma";
import { mockSession, mockUnauthenticated } from "@/__tests__/helpers/mock-session";

vi.mock("@/lib/db", () => ({ prisma: createMockPrisma() }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("sharp", () => ({
  default: vi.fn(() => ({
    rotate: vi.fn().mockReturnThis(),
    resize: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from("compressed")),
  })),
}));
vi.mock("fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("crypto", async () => {
  const actual = await vi.importActual("crypto");
  return { ...actual, randomUUID: () => "test-uuid" };
});

import { POST } from "./route";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { mkdir, writeFile } from "fs/promises";
import sharp from "sharp";
import { NextRequest } from "next/server";

const mockPrisma = prisma as unknown as MockPrisma;

function uploadReq(file: File | null, recipeId: string | null) {
  const formData = new FormData();
  if (file) formData.set("file", file);
  if (recipeId) formData.set("recipeId", recipeId);
  return new NextRequest("http://localhost/api/upload", { method: "POST", body: formData });
}

describe("POST /api/upload", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockUnauthenticated);
    const file = new File(["img"], "test.jpg", { type: "image/jpeg" });
    const res = await POST(uploadReq(file, "r1"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when file is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const res = await POST(uploadReq(null, "r1"));
    expect(res.status).toBe(400);
  });

  it("returns 400 when recipeId is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const file = new File(["img"], "test.jpg", { type: "image/jpeg" });
    const res = await POST(uploadReq(file, null));
    expect(res.status).toBe(400);
  });

  it("returns 400 when recipe already has 10 images", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.image.count.mockResolvedValue(10);
    const file = new File(["img"], "test.jpg", { type: "image/jpeg" });
    const res = await POST(uploadReq(file, "r1"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Max 10 images per recipe" });
  });

  it("returns 413 when file exceeds 20MB", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.image.count.mockResolvedValue(0);
    // Create a blob large enough to exceed the 20MB limit
    const bigBuffer = new Uint8Array(21 * 1024 * 1024);
    const file = new File([bigBuffer], "big.jpg", { type: "image/jpeg" });
    const res = await POST(uploadReq(file, "r1"));
    expect(res.status).toBe(413);
  });

  it("processes image through sharp and writes to disk", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.image.count.mockResolvedValue(0);
    mockPrisma.image.create.mockResolvedValue({ id: "img1", path: "/uploads/r1/test-uuid.jpg" });
    const file = new File(["img-data"], "photo.jpg", { type: "image/jpeg" });

    await POST(uploadReq(file, "r1"));

    expect(sharp).toHaveBeenCalled();
    expect(mkdir).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalled();
  });

  it("returns 201 with created image record", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.image.count.mockResolvedValue(0);
    const img = { id: "img1", path: "/uploads/r1/test-uuid.jpg", recipeId: "r1" };
    mockPrisma.image.create.mockResolvedValue(img);
    const file = new File(["data"], "test.jpg", { type: "image/jpeg" });

    const res = await POST(uploadReq(file, "r1"));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(img);
  });
});
