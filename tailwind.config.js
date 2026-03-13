/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        editor: '#1e293b',
        terminal: '#020617'
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
}