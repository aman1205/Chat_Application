/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: '#78C1F3',
        mint: '#9BE8D8',
        sage: '#9E2F6CA',
        yellow: '#F8FDCF'
      }
    },
  },
  plugins: [],
}