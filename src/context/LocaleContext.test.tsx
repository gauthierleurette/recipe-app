import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocaleProvider, useLocale } from "@/context/LocaleContext";

function TestComponent() {
  const { locale, t, setLocale } = useLocale();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="appName">{t.appName}</span>
      <button onClick={() => setLocale("fr")}>Switch to FR</button>
    </div>
  );
}

describe("LocaleProvider", () => {
  it("provides locale and translations based on initialLocale", () => {
    render(
      <LocaleProvider initialLocale="en">
        <TestComponent />
      </LocaleProvider>
    );
    expect(screen.getByTestId("locale")).toHaveTextContent("en");
    expect(screen.getByTestId("appName")).toHaveTextContent("Our Recipes");
  });

  it("switches locale and updates translations", async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider initialLocale="en">
        <TestComponent />
      </LocaleProvider>
    );

    await user.click(screen.getByText("Switch to FR"));
    expect(screen.getByTestId("locale")).toHaveTextContent("fr");
    expect(screen.getByTestId("appName")).toHaveTextContent("Nos Recettes");
  });

  it("provides French translations when locale is fr", () => {
    render(
      <LocaleProvider initialLocale="fr">
        <TestComponent />
      </LocaleProvider>
    );
    expect(screen.getByTestId("appName")).toHaveTextContent("Nos Recettes");
  });
});
