import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { DeleteRecipeButton } from "./DeleteRecipeButton";
import { TestProviders } from "@/__tests__/helpers/test-wrappers";

describe("DeleteRecipeButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  });

  it("renders delete button", () => {
    render(<DeleteRecipeButton id="r1" />, { wrapper: TestProviders });
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("shows confirmation dialog on click", async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn().mockReturnValue(false);
    render(<DeleteRecipeButton id="r1" />, { wrapper: TestProviders });

    await user.click(screen.getByText("Delete"));
    expect(window.confirm).toHaveBeenCalled();
  });

  it("calls DELETE API and navigates home when confirmed", async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn().mockReturnValue(true);
    render(<DeleteRecipeButton id="r1" />, { wrapper: TestProviders });

    await user.click(screen.getByText("Delete"));
    expect(global.fetch).toHaveBeenCalledWith("/api/recipes/r1", { method: "DELETE" });
    const router = vi.mocked(useRouter)();
    expect(router.push).toHaveBeenCalledWith("/");
  });

  it("does not call API when confirm is cancelled", async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn().mockReturnValue(false);
    render(<DeleteRecipeButton id="r1" />, { wrapper: TestProviders });

    await user.click(screen.getByText("Delete"));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
