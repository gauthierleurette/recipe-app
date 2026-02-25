import { vi } from "vitest";

export function createMockPrisma() {
  return {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    recipe: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    ingredient: {
      deleteMany: vi.fn(),
    },
    step: {
      deleteMany: vi.fn(),
    },
    recipeTag: {
      deleteMany: vi.fn(),
    },
    tag: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    image: {
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  };
}

export type MockPrisma = ReturnType<typeof createMockPrisma>;
