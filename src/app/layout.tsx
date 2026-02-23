import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import type { Locale } from "@/i18n/translations";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
});

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
      <body className={`${dmSans.variable} ${playfair.variable} font-sans bg-page min-h-screen`}>
        <Providers initialLocale={locale}>
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
