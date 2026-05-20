/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Vibrant modern palettes for SGE
        brand: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b8dcff',
          300: '#7abeff',
          400: '#339cff',
          500: '#007dfc', // Primary Accent
          600: '#0062cc',
          700: '#004fa6',
          800: '#00438a',
          900: '#063870',
          950: '#04234a',
        },
        dark: {
          50: '#f6f6f7',
          100: '#eef0f2',
          200: '#d7dbdf',
          300: '#b2b9c0',
          400: '#86919e',
          500: '#647180',
          600: '#4d5966',
          700: '#3f4954',
          800: '#23272e', // Deep Dark Base
          900: '#1a1c22',
          950: '#0f1013',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}
