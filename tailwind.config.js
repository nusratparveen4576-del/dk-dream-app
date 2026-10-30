/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Exact palette sampled from the client's existing website
        forest: "#1D3C2C",
        forestdeep: "#16301F",
        cream: "#F1E9D4",
        paper: "#F8F5EC",
        ink: "#1C3D2C",
      },
    },
  },
  plugins: [],
};
