import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipeImageGrid } from "./RecipeImageGrid";

const images = [
  { id: "i1", path: "/uploads/r1/a.jpg", alt: "Image A" },
  { id: "i2", path: "/uploads/r1/b.jpg", alt: "Image B" },
];

describe("RecipeImageGrid", () => {
  it("returns null when images is empty", () => {
    const { container } = render(<RecipeImageGrid images={[]} title="Test" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders images in grid", () => {
    render(<RecipeImageGrid images={images} title="Test" />);
    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(2);
    expect(imgs[0]).toHaveAttribute("src", "/uploads/r1/a.jpg");
  });

  it("opens lightbox when image is clicked", async () => {
    const user = userEvent.setup();
    render(<RecipeImageGrid images={images} title="Test" />);

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);

    // Lightbox should be open — look for close button
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
  });
});
