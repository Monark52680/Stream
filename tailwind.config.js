/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#E6F9FF',
          100: '#B3F0FF',
          200: '#80E7FF',
          300: '#4DDEFF',
          400: '#1AD5FF',
          500: '#00D4FF',
          600: '#00A3CC',
          700: '#007299',
          800: '#004166',
          900: '#001033',
        },
        purple: {
          50: '#F3F1FF',
          100: '#E0DBFF',
          200: '#CCC5FF',
          300: '#B8AFFF',
          400: '#A499FF',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        gaming: {
          dark: '#0F0F0F',
          darker: '#0A0A0A',
          card: '#1A1A1A',
          border: '#2A2A2A',
          text: '#E5E5E5',
          muted: '#9CA3AF',
        }
      },
      backgroundImage: {
        'gradient-gaming': 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)',
        'gradient-card': 'linear-gradient(145deg, #1A1A1A 0%, #2A2A2A 100%)',
        'gradient-primary': 'linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 212, 255, 0.8)' },
        }
      }
    },
  },
  plugins: [],
};