import "@testing-library/jest-dom/vitest";
import React from "react";

// Mock next/navigation
const mockRouter = {
  push: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockRouter),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock next/image to render plain <img>
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const rest = Object.fromEntries(
      Object.entries(props).filter(([k]) => k !== "fill" && k !== "priority")
    );
    return React.createElement("img", rest);
  },
}));

// Mock next/link to render plain <a>
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => React.createElement("a", { href, ...rest }, children),
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({
    data: {
      user: { id: "user-1", name: "Test User", email: "test@test.com" },
    },
    status: "authenticated",
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));
