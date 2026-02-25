import { render, screen } from "@testing-library/react";
import { RecipeCard } from "./RecipeCard";
import { TestProviders } from "@/__tests__/helpers/test-wrappers";

function mockRecipe(overrides = {}) {
  return {
    id: "r1",
    title: "Test Recipe",
    description: "A tasty dish",
    cuisine: "Italian",
    madeOn: null,
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    images: [{ path: "/uploads/r1/img.jpg", alt: "food" }],
    ingredients: [{ id: "i1", name: "Salt", quantity: "1", unit: "tsp" }],
    tags: [{ tag: { id: "t1", name: "dinner" } }],
    author: { id: "u1", name: "Chef" },
    ...overrides,
  };
}

describe("RecipeCard", () => {
  it("renders recipe title", () => {
    render(<RecipeCard recipe={mockRecipe()} />, { wrapper: TestProviders });
    expect(screen.getByText("Test Recipe")).toBeInTheDocument();
  });

  it("renders author name", () => {
    render(<RecipeCard recipe={mockRecipe()} />, { wrapper: TestProviders });
    expect(screen.getByText(/Chef/)).toBeInTheDocument();
  });

  it("renders image when available", () => {
    render(<RecipeCard recipe={mockRecipe()} />, { wrapper: TestProviders });
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/uploads/r1/img.jpg");
  });

  it("renders placeholder when no image", () => {
    render(<RecipeCard recipe={mockRecipe({ images: [] })} />, { wrapper: TestProviders });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders cuisine badge when present", () => {
    render(<RecipeCard recipe={mockRecipe()} />, { wrapper: TestProviders });
    expect(screen.getByText("Italian")).toBeInTheDocument();
  });

  it("renders total time", () => {
    render(<RecipeCard recipe={mockRecipe()} />, { wrapper: TestProviders });
    expect(screen.getByText("30 min")).toBeInTheDocument();
  });

  it("renders tag chips", () => {
    render(<RecipeCard recipe={mockRecipe()} />, { wrapper: TestProviders });
    expect(screen.getByText("#Dinner")).toBeInTheDocument();
  });
});
