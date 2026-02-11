/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zongPink: '#19295d', // User bubble color
        zongGreen: '#dddddd', // Bot bubble color
      },
    },
  },
  plugins: [],
}