/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal: Azul oscuro → Verde inglés con degradados
        primary: {
          50: '#e6f4f1',   // Verde muy claro
          100: '#b3e0d6',  // Verde claro
          200: '#80ccbb',  // Verde medio claro
          300: '#4db8a0',  // Verde
          400: '#1aa485',  // Verde inglés
          500: '#16836b',  // Verde inglés oscuro
          600: '#126251',  // Verde más oscuro
          700: '#0e4137',  // Verde muy oscuro
          800: '#0a201d',  // Verde casi negro
          900: '#051410',  // Verde negro
        },
        secondary: {
          50: '#e8eef5',   // Azul muy claro
          100: '#b8cde3',  // Azul claro
          200: '#88acd1',  // Azul medio claro
          300: '#588bbf',  // Azul
          400: '#2869ad',  // Azul medio
          500: '#1e4d7b',  // Azul oscuro
          600: '#183d62',  // Azul muy oscuro
          700: '#122e49',  // Azul profundo
          800: '#0c1e30',  // Azul casi negro
          900: '#060f18',  // Azul negro
        },
        accent: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'gradient': 'gradient 8s linear infinite',
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideUp': 'slideUp 0.5s ease-out',
        'slideDown': 'slideDown 0.5s ease-out',
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #0c1e30 0%, #122e49 25%, #183d62 50%, #16836b 75%, #1aa485 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #0c1e30 0%, #16836b 50%, #4db8a0 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(26, 164, 133, 0.5)',
        'glow-secondary': '0 0 20px rgba(30, 77, 123, 0.5)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(26, 164, 133, 0.3)',
      },
    },
  },
  plugins: [],
} 