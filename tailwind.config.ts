import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

// Bảng màu lấy cảm hứng từ yanteambuilding.vn (nâu đất #8d5141, chữ xám #666)
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#faf5f2',
          100: '#f2e6df',
          200: '#e2d8d5',
          300: '#cfa894',
          400: '#b07a62',
          500: '#8d5141',
          600: '#8a4733',
          700: '#6e3a2b',
          800: '#4f2b21',
          900: '#393324',
        },
        accent: '#3cc1f1',
        ink: '#333333',
        muted: '#666666',
      },
      fontFamily: {
        sans: ['"Open Sans"', 'Arial', 'Helvetica', 'sans-serif'],
        heading: ['Montserrat', '"Open Sans"', 'sans-serif'],
      },
      container: {
        center: true,
        padding: '1rem',
        screens: { '2xl': '1200px' },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
