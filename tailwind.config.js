/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme (Field)
        dark: {
          primary: '#030508',
          secondary: '#0a0f14',
          tertiary: '#0d1117',
          border: '#1a2332',
          text: {
            primary: '#ffffff',
            secondary: '#8899aa',
            muted: '#667788',
          },
        },
        // Light theme (Office)
        light: {
          primary: '#f0f4f8',
          secondary: '#ffffff',
          tertiary: '#f8fafc',
          border: '#e2e8f0',
          text: {
            primary: '#1e293b',
            secondary: '#64748b',
            muted: '#94a3b8',
          },
        },
        // Accent colors
        accent: {
          cyan: '#00d4ff',
          blue: '#0066cc',
        },
        status: {
          success: '#00ff88',
          'success-light': '#16a34a',
          warning: '#ffaa00',
          'warning-light': '#d97706',
          error: '#ff4466',
          'error-light': '#dc2626',
        },
        mode: {
          auto: '#00d4ff',
          loiter: '#8855ff',
          rtl: '#ffaa00',
          manual: '#ff4466',
          guided: '#00ff88',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
