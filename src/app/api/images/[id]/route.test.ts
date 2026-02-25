// @vitest-environment node
import { createMockPrisma, type MockPrisma } from "@/__tests__/helpers/mock-prisma";
import { mockSession, mockSessionAlt, mockUnauthenticated } from "@/__tests__/helpers/mock-session";

vi.mock("@/lib/db", () => ({ prisma: createMockPrisma() }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("fs/promises", () => ({
  unlink: vi.fn().mockResolvedValue(undefined),
}));

import { DELETE } from "./route";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { unlink } from "fs/promises";
import { NextRequest } from "next/server";

const mockPrisma = prisma as unknown as MockPrisma;
const params = { id: "img-1" };
const req = new NextRequest("http://localhost/api/images/img-1");

describe("DELETE /api/images/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockUnauthenticated);
    const res = await DELETE(req, { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when image not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.image.findUnique.mockResolvedValue(null);
    const res = await DELETE(req, { params });
    expect(res.status).toBe(404);
  });

  it("returns 403 when user does not own the recipe", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSessionAlt);
    mockPrisma.image.findUnique.mockResolvedValue({ id: "img-1", recipeId: "r1", path: "/uploads/r1/a.jpg" });
    mockPrisma.recipe.findUnique.mockResolvedValue({ id: "r1", authorId: "user-1" });
    const res = await DELETE(req, { params });
    expect(res.status).toBe(403);
  });

  it("deletes file and DB record on success", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.image.findUnique.mockResolvedValue({ id: "img-1", recipeId: "r1", path: "/uploads/r1/a.jpg" });
    mockPrisma.recipe.findUnique.mockResolvedValue({ id: "r1", authorId: "user-1" });

    const res = await DELETE(req, { params });
    expect(res.status).toBe(204);
    expect(unlink).toHaveBeenCalled();
    expect(mockPrisma.image.delete).toHaveBeenCalledWith({ where: { id: "img-1" } });
  });

  it("continues even if file deletion fails", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.image.findUnique.mockResolvedValue({ id: "img-1", recipeId: "r1", path: "/uploads/r1/a.jpg" });
    mockPrisma.recipe.findUnique.mockResolvedValue({ id: "r1", authorId: "user-1" });
    vi.mocked(unlink).mockRejectedValue(new Error("ENOENT"));

    const res = await DELETE(req, { params });
    expect(res.status).toBe(204);
    expect(mockPrisma.image.delete).toHaveBeenCalled();
  });
});
