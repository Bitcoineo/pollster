import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-border": "var(--card-border)",
        muted: "var(--muted)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        "primary-fg": "var(--primary-fg)",
        accent: "var(--accent)",
        "accent-light": "var(--accent-light)",
        danger: "var(--danger)",
        "danger-light": "var(--danger-light)",
        "input-border": "var(--input-border)",
        "input-bg": "var(--input-bg)",
        divider: "var(--divider)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [],
};
export default config;
