"use client";

import { SessionProvider } from "next-auth/react";
import { LocaleProvider } from "@/context/LocaleContext";
import { ThemeProvider } from "@/context/ThemeContext";
import type { Locale } from "@/i18n/translations";

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
