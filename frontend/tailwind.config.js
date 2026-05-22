/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e8eef6',
          100: '#c5d3e8',
          200: '#9eb5d5',
          300: '#7697c2',
          400: '#5880b4',
          500: '#1D4E89',
          600: '#164073',
          700: '#0f2f5a',
          800: '#0B1F3A',
          900: '#071528',
          950: '#030c18',
        },
        gov: {
          red:    '#D62828',
          'red-light': '#f05252',
          'red-dark':  '#a11e1e',
          green:  '#2A9D8F',
          'green-light': '#3bbdad',
          'green-dark':  '#1d7068',
          amber:  '#F4A261',
          'amber-light': '#f7bc8e',
          'amber-dark':  '#d4813a',
          steel:  '#1D4E89',
          navy:   '#0B1F3A',
          gray:   '#F5F7FA',
          white:  '#FFFFFF',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'gov-card':  '0 1px 3px rgba(11,31,58,0.1), 0 1px 2px rgba(11,31,58,0.06)',
        'gov-card-hover': '0 4px 6px -1px rgba(11,31,58,0.1), 0 2px 4px -1px rgba(11,31,58,0.06)',
        'gov-panel': '0 10px 25px -5px rgba(11,31,58,0.1), 0 8px 10px -6px rgba(11,31,58,0.1)',
        'steel':     '0 0 0 2px rgba(29,78,137,0.2)',
      },
      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'ping-slow':     'ping 2.5s cubic-bezier(0,0,0.2,1) infinite',
        'fade-in':       'fadeIn 0.35s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'marquee':       'marquee 28s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%':   { transform: 'translateX(-100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)',      opacity: 1 },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
