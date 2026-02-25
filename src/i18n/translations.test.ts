import { getT } from "@/i18n/translations";

describe("getT", () => {
  it('returns English translations when locale is "en"', () => {
    const t = getT("en");
    expect(t.appName).toBe("Our Recipes");
  });

  it('returns French translations when locale is "fr"', () => {
    const t = getT("fr");
    expect(t.appName).toBe("Nos Recettes");
  });

  it("falls back to English when locale is null", () => {
    const t = getT(null);
    expect(t.appName).toBe("Our Recipes");
  });

  it("falls back to English when locale is undefined", () => {
    const t = getT(undefined);
    expect(t.appName).toBe("Our Recipes");
  });

  it("falls back to English when locale is invalid", () => {
    const t = getT("invalid");
    expect(t.appName).toBe("Our Recipes");
  });

  it('English recipes function returns correct plural forms', () => {
    const t = getT("en");
    expect(t.recipes(1)).toBe("1 recipe");
    expect(t.recipes(2)).toBe("2 recipes");
    expect(t.recipes(0)).toBe("0 recipe");
  });

  it("French servings function returns correct plural forms", () => {
    const t = getT("fr");
    expect(t.servings(1)).toBe("1 portion");
    expect(t.servings(2)).toBe("2 portions");
    expect(t.servings(0)).toBe("0 portion");
  });
});
