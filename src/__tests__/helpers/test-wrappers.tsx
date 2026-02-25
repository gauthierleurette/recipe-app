import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { LocaleProvider } from "@/context/LocaleContext";
import type { Locale } from "@/i18n/translations";

export function TestProviders({
  children,
  locale = "en",
}: {
  children: React.ReactNode;
  locale?: Locale;
}) {
  return (
    <ThemeProvider>
      <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
    </ThemeProvider>
  );
}
