// @vitest-environment node
import { createMockPrisma, type MockPrisma } from "@/__tests__/helpers/mock-prisma";

vi.mock("@/lib/db", () => ({ prisma: createMockPrisma() }));
vi.mock("bcryptjs", () => ({ default: { compare: vi.fn() } }));

import { authorize, authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const mockPrisma = prisma as unknown as MockPrisma;

describe("authorize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when credentials are undefined", async () => {
    const result = await authorize(undefined);
    expect(result).toBeNull();
  });

  it("returns null when email is missing", async () => {
    const result = await authorize({ email: "", password: "password123" });
    expect(result).toBeNull();
  });

  it("returns null when password is missing", async () => {
    const result = await authorize({ email: "test@test.com", password: "" });
    expect(result).toBeNull();
  });

  it("returns null when user not found in DB", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const result = await authorize({ email: "nobody@test.com", password: "password123" });
    expect(result).toBeNull();
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "nobody@test.com" },
    });
  });

  it("returns null when password does not match", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      name: "Test User",
      email: "test@test.com",
      passwordHash: "hashed",
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const result = await authorize({ email: "test@test.com", password: "wrong" });
    expect(result).toBeNull();
  });

  it("returns {id, name, email} on valid credentials", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      name: "Test User",
      email: "test@test.com",
      passwordHash: "hashed",
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await authorize({ email: "test@test.com", password: "correctpassword" });
    expect(result).toEqual({
      id: "user-1",
      name: "Test User",
      email: "test@test.com",
    });
  });
});

describe("authOptions callbacks", () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { jwt, session } = authOptions.callbacks!;

  it("jwt callback adds user.id to token when user is present", () => {
    const token = { sub: "abc" } as Record<string, unknown>;
    const user = { id: "user-1", name: "Test", email: "test@test.com" };
    const result = jwt!({ token, user, account: null, trigger: "signIn" } as Parameters<NonNullable<typeof jwt>>[0]);
    expect(result).toHaveProperty("id", "user-1");
  });

  it("jwt callback returns token unchanged when no user", () => {
    const token = { sub: "abc" } as Record<string, unknown>;
    const result = jwt!({ token, user: undefined, account: null, trigger: "update" } as unknown as Parameters<NonNullable<typeof jwt>>[0]);
    expect(result).not.toHaveProperty("id");
    expect(result).toHaveProperty("sub", "abc");
  });

  it("session callback adds token.id to session.user.id", () => {
    const sess = { user: { name: "Test", email: "test@test.com" }, expires: "2099-01-01" } as Parameters<NonNullable<typeof session>>[0]["session"];
    const token = { id: "user-1" } as Record<string, unknown>;
    const result = session!({ session: sess, token, user: undefined } as unknown as Parameters<NonNullable<typeof session>>[0]);
    expect((result as { user: { id: string } }).user.id).toBe("user-1");
  });
});
