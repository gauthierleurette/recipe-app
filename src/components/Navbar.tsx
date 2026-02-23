"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useLocale } from "@/context/LocaleContext";

export function Navbar() {
  const { data: session } = useSession();
  const { t, locale, setLocale } = useLocale();

  return (
    <nav className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-stone-800">
          {t.appName}
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocale(locale === "en" ? "fr" : "en")}
            className="text-sm text-stone-500 hover:text-stone-800 font-medium transition-colors"
          >
            {t.switchLang}
          </button>

          {session ? (
            <>
              <Link
                href="/recipes/new"
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                {t.addRecipe}
              </Link>
              <span className="text-sm text-stone-500">{session.user.name}</span>
              <button
                onClick={() => signOut()}
                className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
              >
                {t.signOut}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
