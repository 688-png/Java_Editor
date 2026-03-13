/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        editor: '#1e1e1e',
        sidebar: '#0f172a',
        terminal: '#000000'
      }
    },
  },
  plugins: [],
}