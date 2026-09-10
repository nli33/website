/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#faf6ef",
        ink: "#2b2420",
        line: "#e7dbc9",
        accent: {
          50: "#f7ece1",
          100: "#f0dcc7",
          400: "#c97a45",
          500: "#b3502a",
          600: "#9c4322",
          700: "#7c3419",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "ui-serif", "serif"],
      },
    },
  },
  plugins: [],
};