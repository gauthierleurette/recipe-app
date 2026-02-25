import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagPicker } from "./TagPicker";
import { TestProviders } from "@/__tests__/helpers/test-wrappers";

describe("TagPicker", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 })
    );
  });

  it("renders selected tags as chips", () => {
    render(<TagPicker selected={["dinner", "vegan"]} onChange={vi.fn()} />, {
      wrapper: TestProviders,
    });
    expect(screen.getByText(/#Dinner/)).toBeInTheDocument();
    expect(screen.getByText(/#Vegan/)).toBeInTheDocument();
  });

  it("calls onChange without removed tag when X clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagPicker selected={["dinner", "vegan"]} onChange={onChange} />, {
      wrapper: TestProviders,
    });

    const removeButtons = screen.getAllByText("✕");
    await user.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith(["vegan"]);
  });

  it("adds custom tag on Enter key", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagPicker selected={[]} onChange={onChange} />, {
      wrapper: TestProviders,
    });

    const input = screen.getByPlaceholderText("Type a tag and press Enter…");
    await user.type(input, "custom{Enter}");
    expect(onChange).toHaveBeenCalledWith(["custom"]);
  });

  it("opens dropdown on input focus", async () => {
    const user = userEvent.setup();
    render(<TagPicker selected={[]} onChange={vi.fn()} />, {
      wrapper: TestProviders,
    });

    const input = screen.getByPlaceholderText("Type a tag and press Enter…");
    await user.click(input);
    // Predefined category labels should appear
    expect(screen.getByText("Diet")).toBeInTheDocument();
    expect(screen.getByText("Meal")).toBeInTheDocument();
  });
});
