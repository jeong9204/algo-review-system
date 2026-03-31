/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0f172a",
          900: "#162033",
          700: "#334155",
          500: "#64748b",
        },
        line: {
          200: "#dbe4f0",
          100: "#e9eef5",
        },
        surface: {
          0: "#ffffff",
          50: "#f8fafc",
          100: "#f1f5f9",
        },
        accent: {
          50: "#ecfeff",
          500: "#0f766e",
          600: "#0d9488",
        },
      },
    },
  },
  plugins: [],
};
