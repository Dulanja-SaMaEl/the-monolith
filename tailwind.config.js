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
          void: '#0a0908',
          surface: '#141311',
          elevated: '#1c1a17',
          card: '#161513',
          text: '#f5f4f0',
          silver: '#e3dfd8',
          muted: '#a39d96',
          fog: '#7a756f',
          taupe: '#8c857b',
          dust: '#d6d2cd',
          border: 'rgba(163, 157, 150, 0.16)',
          borderHover: 'rgba(214, 210, 205, 0.35)',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
        display: ['Space Grotesk', 'Manrope', 'sans-serif']
      },
      boxShadow: {
        'taupe-glow': '0 0 50px -10px rgba(163, 157, 150, 0.12)',
        'taupe-glow-lg': '0 0 80px -15px rgba(214, 210, 205, 0.15)',
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
