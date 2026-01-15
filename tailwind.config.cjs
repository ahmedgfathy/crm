/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        brand: {
          50: '#e7f9f8',
          100: '#c8f0ed',
          200: '#97e0dc',
          300: '#5bc7c2',
          400: '#30aea9',
          500: '#0ea5a4',
          600: '#0b8c8b',
          700: '#0f766e',
          800: '#0f5f59',
          900: '#0d4d48',
        },
      },
      boxShadow: {
        glow: '0 10px 60px -25px rgba(14, 165, 164, 0.6)',
      },
    },
  },
  plugins: [],
};
