import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSession } from "next-auth/react";
import { Navbar } from "./Navbar";
import { TestProviders } from "@/__tests__/helpers/test-wrappers";

describe("Navbar", () => {
  beforeEach(() => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "u1", name: "Test User", email: "test@test.com" }, expires: "2099-01-01" },
      status: "authenticated",
      update: vi.fn(),
    });
  });

  it("renders app name as link to home", () => {
    render(<Navbar />, { wrapper: TestProviders });
    const link = screen.getByText("Our Recipes");
    expect(link.closest("a")).toHaveAttribute("href", "/");
  });

  it("shows theme toggle button", () => {
    render(<Navbar />, { wrapper: TestProviders });
    expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
  });

  it("shows locale switcher", () => {
    render(<Navbar />, { wrapper: TestProviders });
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("shows user menu when authenticated", async () => {
    const user = userEvent.setup();
    render(<Navbar />, { wrapper: TestProviders });

    await user.click(screen.getByLabelText("Menu"));
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("+ Add recipe")).toBeInTheDocument();
  });

  it("hides menu when not authenticated", () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: vi.fn(),
    });
    render(<Navbar />, { wrapper: TestProviders });
    expect(screen.queryByLabelText("Menu")).not.toBeInTheDocument();
  });
});
