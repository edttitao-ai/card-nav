/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#2563eb',
          light: '#eff6ff',
        },
      },
    },
  },
  plugins: [],
}