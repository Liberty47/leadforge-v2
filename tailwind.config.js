/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#111111',
        'surface-hover': '#1a1a1a',
        border: '#222222',
        'border-subtle': '#1a1a1a',
        accent: '#22c55e',
        'accent-hover': '#16a34a',
        'accent-muted': '#166534',
        text: '#fafafa',
        'text-muted': '#a1a1a1',
        'text-subtle': '#525252',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
