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
        brand: {
          50: "#f1f7f3",
          100: "#dceee3",
          200: "#bbddc8",
          300: "#8cc4a4",
          400: "#5aa57c",
          500: "#3d8a61",
          600: "#2d6a4f",
          700: "#245a42",
          800: "#1e4736",
          900: "#1b3b2e",
        },
        earth: {
          50: "#faf7f2",
          100: "#f3ece0",
          200: "#e6d7c3",
          800: "#4a3f32",
          900: "#2c261f",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgb(44 38 31 / 0.06), 0 8px 24px rgb(44 38 31 / 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
