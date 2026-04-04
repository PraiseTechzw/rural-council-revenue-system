import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f7f4",
          100: "#e2ece2",
          200: "#c5d9c5",
          300: "#95ba97",
          400: "#659a6b",
          500: "#4c7f53",
          600: "#365f3f",
          700: "#2b4d34",
          800: "#243e2a",
          900: "#1f3323"
        }
      }
    }
  },
  plugins: []
};

export default config;