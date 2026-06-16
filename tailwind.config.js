/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          primary: '#C8791A',
          light: '#E8A84C',
        },
        bourbon: {
          bg: '#FDFAF6',
          surface: '#F5EFE6',
          text: '#1A1410',
          muted: '#6B5E52',
          success: '#3D6B4F',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
