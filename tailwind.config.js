/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,js,vue,jsx,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
    fontFamily: {
      'sans': ['Poppins', 'sans-serif'],
    }
  }
  },
  plugins: [],
}
