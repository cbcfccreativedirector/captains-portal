/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Captains FC brand palette — navy, gold, white (maritime)
        captain: {
          navy: '#0A1628',
          'navy-light': '#152240',
          'navy-mid': '#1E3A5F',
          gold: '#C9A84C',
          'gold-light': '#E8C97A',
          'gold-pale': '#F5E4B5',
          white: '#F8F6F0',
          mist: '#D4D9E0',
          anchor: '#6B7A94',
        },
      },
      fontFamily: {
        // Serif display for headings — maritime/classic feel
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        // Clean sans for body
        body: ['system-ui', '-apple-system', 'sans-serif'],
        // Monospace for data/stats
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      backgroundImage: {
        'rope-texture': "url('/images/rope-bg.png')",
        'wave-pattern': "repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(201,168,76,0.03) 10px, rgba(201,168,76,0.03) 20px)",
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
