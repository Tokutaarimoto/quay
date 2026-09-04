import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0B",
        surface: "#111113",
        elevated: "#18181B",
        border: "rgba(255,255,255,0.06)",
        "border-hover": "rgba(255,255,255,0.12)",
        "border-active": "rgba(255,255,255,0.18)",
        "text-primary": "rgba(255,255,255,0.92)",
        "text-secondary": "rgba(255,255,255,0.55)",
        "text-muted": "rgba(255,255,255,0.35)",
        accent: "#6366F1",
        "accent-hover": "#818CF8",
        "accent-subtle": "rgba(99,102,241,0.12)",
        "accent-border": "rgba(99,102,241,0.2)",
        "accent-text": "#A5B4FC",
        success: "#34D399",
        "success-glow": "rgba(52,211,153,0.35)",
        error: "#F87171",
        warning: "#FBBF24",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
      },
      maxWidth: {
        content: "1120px",
      },
      spacing: {
        card: "20px",
        "card-gap": "12px",
        "section-gap": "40px",
      },
      borderRadius: {
        card: "8px",
        button: "6px",
        input: "6px",
        badge: "4px",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [],
};
export default config;
