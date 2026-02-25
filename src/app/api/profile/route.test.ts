// @vitest-environment node
import { createMockPrisma, type MockPrisma } from "@/__tests__/helpers/mock-prisma";
import { mockSession, mockUnauthenticated } from "@/__tests__/helpers/mock-session";

vi.mock("@/lib/db", () => ({ prisma: createMockPrisma() }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("bcryptjs", () => ({ default: { compare: vi.fn(), hash: vi.fn() } }));

import { PUT } from "./route";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const mockPrisma = prisma as unknown as MockPrisma;

function req(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/profile", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("PUT /api/profile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockUnauthenticated);
    const res = await PUT(req({ currentPassword: "old", newPassword: "newpasswd" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when currentPassword is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const res = await PUT(req({ newPassword: "newpasswd" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when newPassword is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const res = await PUT(req({ currentPassword: "oldpasswd" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 with passwordTooShort when newPassword < 8 chars", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    const res = await PUT(req({ currentPassword: "old12345", newPassword: "short" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "passwordTooShort" });
  });

  it("returns 404 when user not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res = await PUT(req({ currentPassword: "old12345", newPassword: "new12345" }));
    expect(res.status).toBe(404);
  });

  it("returns 400 with incorrectPassword when current password wrong", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1", passwordHash: "hash" });
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const res = await PUT(req({ currentPassword: "wrongpw1", newPassword: "new12345" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "incorrectPassword" });
  });

  it("updates password and returns ok on success", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1", passwordHash: "hash" });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(bcrypt.hash).mockResolvedValue("new-hash" as never);

    const res = await PUT(req({ currentPassword: "old12345", newPassword: "new12345" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { passwordHash: "new-hash" },
    });
  });
});
