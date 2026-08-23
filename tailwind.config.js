/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
        signature: ['var(--font-signature)'],
      },
      colors: {
        navy: {
          DEFAULT: '#0F1B2D',
          50: '#EEF1F5',
          100: '#D7DEE8',
          200: '#AFBED1',
          300: '#869DBA',
          400: '#5E7CA3',
          500: '#3D5E88',
          600: '#294669',
          700: '#1B324D',
          800: '#0F1B2D',
          900: '#080F1A',
        },
        gold: {
          DEFAULT: '#C9A227',
          50: '#FBF6E7',
          100: '#F5E7BE',
          200: '#EBCF7D',
          300: '#DFB74B',
          400: '#C9A227',
          500: '#A8851C',
          600: '#846815',
        },
        cream: '#FAF7F1',
        ink: '#1A1A1A',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
}
