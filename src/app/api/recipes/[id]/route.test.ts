// @vitest-environment node
import { createMockPrisma, type MockPrisma } from "@/__tests__/helpers/mock-prisma";
import { mockSession, mockUnauthenticated } from "@/__tests__/helpers/mock-session";

vi.mock("@/lib/db", () => ({ prisma: createMockPrisma() }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { GET, PUT, DELETE } from "./route";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

const mockPrisma = prisma as unknown as MockPrisma;
const params = { id: "recipe-1" };

function putReq(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/recipes/recipe-1", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET /api/recipes/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockUnauthenticated);
    const res = await GET(new NextRequest("http://localhost/api/recipes/recipe-1"), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when recipe not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.recipe.findUnique.mockResolvedValue(null);
    const res = await GET(new NextRequest("http://localhost/api/recipes/recipe-1"), { params });
    expect(res.status).toBe(404);
  });

  it("returns recipe with all relations", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const recipe = { id: "recipe-1", title: "Pasta", ingredients: [], steps: [] };
    mockPrisma.recipe.findUnique.mockResolvedValue(recipe);
    const res = await GET(new NextRequest("http://localhost/api/recipes/recipe-1"), { params });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(recipe);
  });
});

describe("PUT /api/recipes/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockUnauthenticated);
    const res = await PUT(putReq({ title: "Updated" }), { params });
    expect(res.status).toBe(401);
  });

  it("deletes existing relations before recreating", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.recipe.update.mockResolvedValue({ id: "recipe-1" });

    await PUT(putReq({ title: "Updated", ingredients: [], steps: [], tags: [] }), { params });

    expect(mockPrisma.ingredient.deleteMany).toHaveBeenCalledWith({ where: { recipeId: "recipe-1" } });
    expect(mockPrisma.step.deleteMany).toHaveBeenCalledWith({ where: { recipeId: "recipe-1" } });
    expect(mockPrisma.recipeTag.deleteMany).toHaveBeenCalledWith({ where: { recipeId: "recipe-1" } });
  });

  it("returns updated recipe", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const updated = { id: "recipe-1", title: "Updated" };
    mockPrisma.recipe.update.mockResolvedValue(updated);

    const res = await PUT(putReq({ title: "Updated" }), { params });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
  });
});

describe("DELETE /api/recipes/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockUnauthenticated);
    const res = await DELETE(new NextRequest("http://localhost/api/recipes/recipe-1"), { params });
    expect(res.status).toBe(401);
  });

  it("deletes recipe and returns 204", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.recipe.delete.mockResolvedValue({ id: "recipe-1" });
    const res = await DELETE(new NextRequest("http://localhost/api/recipes/recipe-1"), { params });
    expect(res.status).toBe(204);
    expect(mockPrisma.recipe.delete).toHaveBeenCalledWith({ where: { id: "recipe-1" } });
  });
});
