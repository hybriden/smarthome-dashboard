import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#1a1816",
          light: "#2a2622",
          dark: "#0c0b0a",
          card: "#1e1c19",
        },
        brand: {
          DEFAULT: "#c8943e",
          light: "#e0b05e",
          dim: "#8b6a2f",
          success: "#5cb85c",
          danger: "#d9534f",
        },
        muted: {
          DEFAULT: "#7a7168",
          light: "#a39889",
          dark: "#4a4440",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
