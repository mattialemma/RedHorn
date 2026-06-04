/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        folder: "0 28px 42px rgba(0, 0, 0, 0.36)",
      },
    },
  },
  plugins: [],
};

