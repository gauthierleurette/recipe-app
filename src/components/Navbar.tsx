"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useLocale } from "@/context/LocaleContext";

function FlagFR() {
  return (
    <svg width="20" height="14" viewBox="0 0 30 20" className="rounded-sm inline-block align-middle">
      <rect width="10" height="20" fill="#002395" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#ED2939" />
    </svg>
  );
}

function FlagGB() {
  return (
    <svg width="20" height="14" viewBox="0 0 60 40" className="rounded-sm inline-block align-middle">
      <rect width="60" height="40" fill="#012169" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="5" />
      <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="13" />
      <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="8" />
    </svg>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const { t, locale, setLocale } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-stone-800">
          {t.appName}
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocale(locale === "en" ? "fr" : "en")}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 font-medium transition-colors"
          >
            {locale === "en" ? <FlagGB /> : <FlagFR />}
            <span>{locale === "en" ? "EN" : "FR"}</span>
          </button>

          {session && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="p-2 text-stone-500 hover:text-stone-800 transition-colors rounded-lg hover:bg-stone-100"
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  {/* Dropdown */}
                  <div className="absolute right-0 top-11 bg-white border border-stone-200 rounded-xl shadow-lg py-1 min-w-[180px] z-20">
                    <p className="px-4 py-2 text-sm font-medium text-stone-800 border-b border-stone-100">
                      {session.user.name}
                    </p>
                    <Link
                      href="/recipes/new"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      {t.addRecipe}
                    </Link>
                    <button
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-stone-50 transition-colors"
                    >
                      {t.signOut}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
