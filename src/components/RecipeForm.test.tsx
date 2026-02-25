import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipeForm } from "./RecipeForm";
import { TestProviders } from "@/__tests__/helpers/test-wrappers";

// Mock TagPicker to avoid its fetch calls
vi.mock("./TagPicker", () => ({
  TagPicker: ({ selected }: { selected: string[]; onChange: (t: string[]) => void }) => (
    <div data-testid="tag-picker">
      {selected.map((t) => (
        <span key={t}>{t}</span>
      ))}
    </div>
  ),
}));

describe("RecipeForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "new-recipe" }), { status: 201 })
    );
  });

  it("renders create mode with empty title", () => {
    render(<RecipeForm />, { wrapper: TestProviders });
    expect(screen.getByText("Create recipe")).toBeInTheDocument();
    const titleInput = screen.getAllByRole("textbox")[0]; // First textbox is title
    expect(titleInput).toHaveValue("");
  });

  it("renders edit mode with prefilled title", () => {
    render(
      <RecipeForm initial={{ id: "r1", title: "Pasta", ingredients: [], steps: [] }} />,
      { wrapper: TestProviders }
    );
    expect(screen.getByText("Save changes")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Pasta")).toBeInTheDocument();
  });

  it("adds ingredient row when add button clicked", async () => {
    const user = userEvent.setup();
    render(<RecipeForm />, { wrapper: TestProviders });

    const addBtn = screen.getByText("+ Add ingredient");
    await user.click(addBtn);

    const nameInputs = screen.getAllByPlaceholderText("Ingredient name");
    expect(nameInputs.length).toBe(2);
  });

  it("removes ingredient row when X clicked", async () => {
    const user = userEvent.setup();
    render(
      <RecipeForm
        initial={{
          ingredients: [
            { name: "Salt", quantity: "1", unit: "tsp" },
            { name: "Pepper", quantity: "2", unit: "tsp" },
          ],
          steps: [],
        }}
      />,
      { wrapper: TestProviders }
    );

    const removeButtons = screen.getAllByText("✕");
    await user.click(removeButtons[0]);
    expect(screen.queryByDisplayValue("Salt")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Pepper")).toBeInTheDocument();
  });

  it("submits via POST for new recipe", async () => {
    const user = userEvent.setup();
    render(<RecipeForm />, { wrapper: TestProviders });

    const titleInput = screen.getAllByRole("textbox")[0]; // First textbox is title
    await user.type(titleInput, "New Soup");
    await user.click(screen.getByText("Create recipe"));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/recipes",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("submits via PUT for editing recipe", async () => {
    const user = userEvent.setup();
    render(
      <RecipeForm initial={{ id: "r1", title: "Soup", ingredients: [], steps: [] }} />,
      { wrapper: TestProviders }
    );

    await user.click(screen.getByText("Save changes"));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/recipes/r1",
      expect.objectContaining({ method: "PUT" })
    );
  });
});
