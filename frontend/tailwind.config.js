/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        kanit: ['Kanit', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        serif: ['"Instrument Serif"', '"Playfair Display"', 'Georgia', 'serif'],
        editorial: ['"Instrument Serif"', '"Playfair Display"', 'serif'],
        'tt-norms': ['"TT Norms Pro"', 'system-ui', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        inter: ['"Inter Tight"', 'sans-serif'],
      },
      colors: {
        median: {
          taupe: '#9F8170',
          'taupe-light': '#b59b8c',
          'taupe-dark': '#836555',
          cream: '#FAF8F5',
          dark: '#141414',
          black: '#000000',
          white: '#ffffff',
          line: 'rgba(159, 129, 112, 0.25)',
          'line-dark': 'rgba(0, 0, 0, 0.1)',
        },
        void: '#08090B',
        deep: '#0D1117',
        surface: {
          DEFAULT: '#121820',
          soft: '#18212B',
          card: 'rgba(18, 24, 32, 0.7)',
        },
        cyan: {
          400: '#7DE7FF',
          500: '#22D3EE',
          300: '#A5F3FC',
        },
        orange: {
          400: '#FFB26B',
          500: '#FF7A3D',
          600: '#D96B27',
          700: '#88300A',
        },
        ice: '#C9F3FF',
        muted: '#AAB3BF',
      },
      boxShadow: {
        'glow-cyan': '0 0 35px rgba(125, 231, 255, 0.25)',
        'glow-orange': '0 0 35px rgba(255, 122, 61, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'marquee-reverse': 'marquee-reverse 25s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee-left': 'marqueeLeft 35s linear infinite',
        'marquee-right': 'marqueeRight 35s linear infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        marqueeLeft: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeRight: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      }
    },
  },
  plugins: [],
}
