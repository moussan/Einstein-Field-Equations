/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1', // Indigo
          dark: '#4f46e5',
          light: '#818cf8'
        },
        secondary: {
          DEFAULT: '#10b981', // Emerald
          dark: '#059669',
          light: '#34d399'
        },
        background: {
          DEFAULT: '#121212',
          paper: '#1e1e1e',
          light: '#2d2d2d'
        },
        text: {
          primary: '#f3f4f6',
          secondary: '#d1d5db',
          disabled: '#6b7280'
        }
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        math: ['STIX Two Math', 'serif']
      },
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        'dark': '0 1px 3px 0 rgba(0, 0, 0, 0.5), 0 1px 2px 0 rgba(0, 0, 0, 0.6)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.6)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.6)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.6)',
      }
    },
  },
  plugins: [],
} 