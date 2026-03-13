/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        editor: '#1e1e1e',
        sidebar: '#252526',
        terminal: '#0f172a'
      }
    },
  },
  plugins: [],
}