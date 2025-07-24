/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2DBEFF',
        secondary: '#1A1A1A',
        tertiary: '#6F8B90',
      },
    },
  },
  plugins: [],
  important: true,
}
