"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-stone-800">
          Our Recipes
        </Link>

        {session ? (
          <div className="flex items-center gap-4">
            <Link
              href="/recipes/new"
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              + Add recipe
            </Link>
            <span className="text-sm text-stone-500">{session.user.name}</span>
            <button
              onClick={() => signOut()}
              className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
