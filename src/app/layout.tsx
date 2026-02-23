import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import type { Locale } from "@/i18n/translations";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Our Recipes",
  description: "A personal recipe book for two",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (cookies().get("locale")?.value ?? "en") as Locale;

  return (
    <html lang={locale}>
      <body className={`${inter.className} bg-stone-100 min-h-screen`}>
        <Providers initialLocale={locale}>
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
