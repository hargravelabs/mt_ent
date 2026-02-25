/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mt-black': '#050505',
        'mt-white': '#f9f8f6',
        'mt-gray': '#666666',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      cursor: {
        none: 'none',
      },
    },
  },
  plugins: [],
}
