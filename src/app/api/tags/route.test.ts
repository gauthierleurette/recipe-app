// @vitest-environment node
import { createMockPrisma, type MockPrisma } from "@/__tests__/helpers/mock-prisma";
import { mockSession, mockUnauthenticated } from "@/__tests__/helpers/mock-session";

vi.mock("@/lib/db", () => ({ prisma: createMockPrisma() }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { GET } from "./route";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

const mockPrisma = prisma as unknown as MockPrisma;

describe("GET /api/tags", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockUnauthenticated);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns tags ordered by name", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const tags = [{ id: "1", name: "breakfast" }, { id: "2", name: "dinner" }];
    mockPrisma.tag.findMany.mockResolvedValue(tags);

    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(tags);
    expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({ orderBy: { name: "asc" } });
  });

  it("returns empty array when no tags exist", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.tag.findMany.mockResolvedValue([]);

    const res = await GET();
    expect(await res.json()).toEqual([]);
  });
});
