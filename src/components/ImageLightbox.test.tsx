import { render, screen, fireEvent } from "@testing-library/react";
import { ImageLightbox } from "./ImageLightbox";

const images = [
  { path: "/uploads/r1/a.jpg", alt: "Image A" },
  { path: "/uploads/r1/b.jpg", alt: "Image B" },
  { path: "/uploads/r1/c.jpg", alt: "Image C" },
];

describe("ImageLightbox", () => {
  it("renders image at initialIndex", () => {
    render(<ImageLightbox images={images} initialIndex={0} onClose={vi.fn()} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/uploads/r1/a.jpg");
    expect(img).toHaveAttribute("alt", "Image A");
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(<ImageLightbox images={images} initialIndex={0} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("navigates to next image on ArrowRight", () => {
    render(<ImageLightbox images={images} initialIndex={0} onClose={vi.fn()} />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Image B");
  });

  it("navigates to previous image on ArrowLeft", () => {
    render(<ImageLightbox images={images} initialIndex={1} onClose={vi.fn()} />);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Image A");
  });

  it("wraps around when navigating past last image", () => {
    render(<ImageLightbox images={images} initialIndex={2} onClose={vi.fn()} />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Image A");
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    const { container } = render(<ImageLightbox images={images} initialIndex={0} onClose={onClose} />);
    // The backdrop is the outermost div
    fireEvent.click(container.firstElementChild!);
    expect(onClose).toHaveBeenCalled();
  });
});
