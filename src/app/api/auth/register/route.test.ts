// @vitest-environment node
import { createMockPrisma, type MockPrisma } from "@/__tests__/helpers/mock-prisma";

vi.mock("@/lib/db", () => ({ prisma: createMockPrisma() }));
vi.mock("bcryptjs", () => ({ default: { hash: vi.fn() } }));

import { POST } from "./route";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const mockPrisma = prisma as unknown as MockPrisma;

function req(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when name is missing", async () => {
    const res = await POST(req({ email: "a@b.com", password: "12345678" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(req({ name: "Test", password: "12345678" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const res = await POST(req({ name: "Test", email: "a@b.com" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 with passwordTooShort when password < 8 chars", async () => {
    const res = await POST(req({ name: "Test", email: "a@b.com", password: "short" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "passwordTooShort" });
  });

  it("returns 409 with emailTaken when email already exists", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "u1" });
    const res = await POST(req({ name: "Test", email: "taken@b.com", password: "12345678" }));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "emailTaken" });
  });

  it("returns 201 and creates user on success", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-pw" as never);
    mockPrisma.user.create.mockResolvedValue({ id: "new-user" });

    const res = await POST(req({ name: "New", email: "new@b.com", password: "12345678" }));
    expect(res.status).toBe(201);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: { name: "New", email: "new@b.com", passwordHash: "hashed-pw" },
    });
  });

  it("calls bcrypt.hash with 12 rounds", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed" as never);
    mockPrisma.user.create.mockResolvedValue({ id: "u" });

    await POST(req({ name: "A", email: "a@b.com", password: "longenough" }));
    expect(bcrypt.hash).toHaveBeenCalledWith("longenough", 12);
  });
});
