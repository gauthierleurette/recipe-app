import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        page:          "var(--page-bg)",
        surface:       "var(--surface)",
        "surface-alt": "var(--surface-alt)",
        rim:           "var(--rim)",
        "rim-strong":  "var(--rim-strong)",
        ink:           "var(--ink)",
        "ink-2":       "var(--ink-2)",
        "ink-3":       "var(--ink-3)",
        brand:         "var(--brand)",
        "brand-hover": "var(--brand-hover)",
        "brand-tint":  "var(--brand-tint)",
        "brand-mid":   "var(--brand-mid)",
        "brand-line":  "var(--brand-line)",
      },
      fontFamily: {
        sans:    ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
