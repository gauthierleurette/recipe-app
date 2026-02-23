"use client";

import { createContext, useContext, useState } from "react";
import { getT, type Locale, type T } from "@/i18n/translations";

type LocaleContextValue = {
  locale: Locale;
  t: T;
  setLocale: (l: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  t: getT("en"),
  setLocale: () => {},
});

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  function setLocale(l: Locale) {
    setLocaleState(l);
    document.cookie = `locale=${l}; path=/; max-age=31536000; SameSite=Lax`;
    try {
      localStorage.setItem("locale", l);
    } catch {}
  }

  return (
    <LocaleContext.Provider value={{ locale, t: getT(locale), setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
