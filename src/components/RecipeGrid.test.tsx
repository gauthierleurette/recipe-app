import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipeGrid } from "./RecipeGrid";
import { TestProviders } from "@/__tests__/helpers/test-wrappers";

function mockRecipe(id: string, title: string, cuisine: string | null = null, tags: string[] = []) {
  return {
    id,
    title,
    description: null,
    cuisine,
    madeOn: null,
    prepTime: null,
    cookTime: null,
    servings: null,
    images: [],
    ingredients: [],
    tags: tags.map((name, i) => ({ tag: { id: `t${i}`, name } })),
    author: { id: "u1", name: "Chef" },
  };
}

const recipes = [
  mockRecipe("r1", "Pasta Carbonara", "Italian", ["dinner"]),
  mockRecipe("r2", "Sushi Roll", "Japanese", ["dinner", "lunch"]),
  mockRecipe("r3", "French Toast", "French", ["breakfast"]),
];

describe("RecipeGrid", () => {
  it("renders empty state when no recipes", () => {
    render(<RecipeGrid recipes={[]} />, { wrapper: TestProviders });
    expect(screen.getByText("No recipes yet")).toBeInTheDocument();
    expect(screen.getByText("Add your first recipe")).toBeInTheDocument();
  });

  it("renders recipe cards for all recipes", () => {
    render(<RecipeGrid recipes={recipes} />, { wrapper: TestProviders });
    expect(screen.getByText("Pasta Carbonara")).toBeInTheDocument();
    expect(screen.getByText("Sushi Roll")).toBeInTheDocument();
    expect(screen.getByText("French Toast")).toBeInTheDocument();
  });

  it("filters recipes by search query", async () => {
    const user = userEvent.setup();
    render(<RecipeGrid recipes={recipes} />, { wrapper: TestProviders });

    await user.type(screen.getByPlaceholderText("Search recipes…"), "Pasta");
    expect(screen.getByText("Pasta Carbonara")).toBeInTheDocument();
    expect(screen.queryByText("Sushi Roll")).not.toBeInTheDocument();
  });

  it("filters by cuisine dropdown", async () => {
    const user = userEvent.setup();
    render(<RecipeGrid recipes={recipes} />, { wrapper: TestProviders });

    await user.selectOptions(screen.getByRole("combobox"), "Japanese");
    expect(screen.getByText("Sushi Roll")).toBeInTheDocument();
    expect(screen.queryByText("Pasta Carbonara")).not.toBeInTheDocument();
  });

  it("filters by tag chip click", async () => {
    const user = userEvent.setup();
    render(<RecipeGrid recipes={recipes} />, { wrapper: TestProviders });

    await user.click(screen.getByText("#breakfast"));
    expect(screen.getByText("French Toast")).toBeInTheDocument();
    expect(screen.queryByText("Pasta Carbonara")).not.toBeInTheDocument();
  });

  it("shows no results when filters match nothing", async () => {
    const user = userEvent.setup();
    render(<RecipeGrid recipes={recipes} />, { wrapper: TestProviders });

    await user.type(screen.getByPlaceholderText("Search recipes…"), "zzzznotexist");
    expect(screen.getByText("No recipes match your filters.")).toBeInTheDocument();
  });

  it("renders add recipe link", () => {
    render(<RecipeGrid recipes={recipes} />, { wrapper: TestProviders });
    const addLink = screen.getByText("+ Add recipe");
    expect(addLink).toBeInTheDocument();
    expect(addLink.closest("a")).toHaveAttribute("href", "/recipes/new");
  });
});
