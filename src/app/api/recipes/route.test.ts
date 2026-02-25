// @vitest-environment node
import { createMockPrisma, type MockPrisma } from "@/__tests__/helpers/mock-prisma";
import { mockSession, mockUnauthenticated } from "@/__tests__/helpers/mock-session";

vi.mock("@/lib/db", () => ({ prisma: createMockPrisma() }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { GET, POST } from "./route";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

const mockPrisma = prisma as unknown as MockPrisma;

function postReq(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/recipes", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET /api/recipes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockUnauthenticated);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns recipes on success", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const recipes = [{ id: "r1", title: "Pasta" }];
    mockPrisma.recipe.findMany.mockResolvedValue(recipes);

    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(recipes);
  });
});

describe("POST /api/recipes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockUnauthenticated);
    const res = await POST(postReq({ title: "Test" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when title is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const res = await POST(postReq({ description: "no title" }));
    expect(res.status).toBe(400);
  });

  it("creates recipe with nested relations", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.tag.upsert.mockResolvedValue({ id: "t1", name: "dinner" });
    const created = { id: "r1", title: "Soup" };
    mockPrisma.recipe.create.mockResolvedValue(created);

    const res = await POST(
      postReq({
        title: "Soup",
        ingredients: [{ name: "Water", quantity: "1", unit: "cup" }],
        steps: [{ instruction: "Boil" }],
        tags: ["dinner"],
      })
    );

    expect(res.status).toBe(201);
    expect(mockPrisma.recipe.create).toHaveBeenCalled();
    const createCall = mockPrisma.recipe.create.mock.calls[0][0];
    expect(createCall.data.title).toBe("Soup");
    expect(createCall.data.authorId).toBe("user-1");
  });

  it("upserts tags before creating recipe", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.tag.upsert.mockResolvedValue({ id: "t1", name: "vegan" });
    mockPrisma.recipe.create.mockResolvedValue({ id: "r1" });

    await POST(postReq({ title: "Salad", tags: ["vegan"] }));

    expect(mockPrisma.tag.upsert).toHaveBeenCalledWith({
      where: { name: "vegan" },
      update: {},
      create: { name: "vegan" },
    });
  });

  it("handles empty arrays gracefully", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.recipe.create.mockResolvedValue({ id: "r1" });

    const res = await POST(postReq({ title: "Simple" }));
    expect(res.status).toBe(201);
  });
});
