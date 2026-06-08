import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Kiwi Party brand — party purple/pink
        kiwi: {
          50: "#f3f1ff",
          100: "#e9e5ff",
          200: "#d6ceff",
          300: "#b8a7ff",
          400: "#9575ff",
          500: "#7c4dff",
          600: "#6b2fe6",
          700: "#5a23c4",
          800: "#4b1fa0",
          900: "#3f1d83",
        },
        party: {
          pink: "#ff4d9d",
          amber: "#ffb020",
        },
      },
    },
  },
  plugins: [],
};

export default config;
