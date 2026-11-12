/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        monolith: {
          void: '#080807',
          surface: '#141310',
          elevated: '#1c1a16',
          card: '#181714',
          text: '#fbfbf9',
          amber: '#ff9500',
          amberLight: '#ffa726',
          amberDark: '#e68500',
          champagne: '#e8dcc4',
          silver: '#e5e0d8',
          muted: '#a8a29a',
          fog: '#7e786f',
          taupe: '#8e867b',
          dust: '#dcd7cf',
          border: 'rgba(168, 162, 154, 0.15)',
          borderHover: 'rgba(255, 149, 0, 0.4)',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
        display: ['Space Grotesk', 'Manrope', 'sans-serif']
      },
      boxShadow: {
        'amber-glow': '0 0 35px -5px rgba(255, 149, 0, 0.35)',
        'amber-glow-lg': '0 0 70px -10px rgba(255, 149, 0, 0.28)',
        'taupe-glow': '0 0 50px -10px rgba(255, 149, 0, 0.15)',
        'taupe-glow-lg': '0 0 80px -15px rgba(255, 149, 0, 0.22)',
        'glass-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'pulse-subtle': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
