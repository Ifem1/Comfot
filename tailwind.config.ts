import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        espresso:  "#0C0B09",
        panel:     "#131110",
        card:      "#1A1815",
        "card-hi": "#211F1B",
        gold:      "#C9A96E",
        "gold-dim":"#7A5F34",
        "gold-glow":"#DFC08A",
        terra:     "#C4714A",
        "terra-dim":"#7A3F28",
        ivory:     "#F2EDE4",
        "ivory-dim":"#8C8078",
        "ivory-faint":"#3A342E",
        border:    "#252220",
        "border-gold":"#3A3020",
        success:   "#4CAF7D",
        danger:    "#E05C4B",
        warning:   "#E6A817",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
        lg: "10px",
        xl: "14px",
        "2xl": "20px",
      },
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%":      { opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in":    "fade-in 0.35s ease-out",
        "slide-up":   "slide-up 0.4s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        shimmer:      "shimmer 2s linear infinite",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C9A96E 0%, #DFC08A 50%, #C9A96E 100%)",
        "panel-gradient":"linear-gradient(180deg, #1A1815 0%, #131110 100%)",
        "hero-gradient": "radial-gradient(ellipse at 50% 0%, #2A2215 0%, #0C0B09 60%)",
      },
    },
  },
  plugins: [],
}

export default config
