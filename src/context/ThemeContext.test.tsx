import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme}</button>;
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("defaults to light theme", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByRole("button")).toHaveTextContent("light");
  });

  it("toggles between light and dark", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("dark");

    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("light");
  });

  it("persists theme to localStorage", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await user.click(screen.getByRole("button"));
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
