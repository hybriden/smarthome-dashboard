import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#1e293b",
          light: "#334155",
          dark: "#0f172a",
        },
        accent: {
          DEFAULT: "#3b82f6",
          warm: "#f59e0b",
          success: "#22c55e",
          danger: "#ef4444",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
