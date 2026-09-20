/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#14161A',
        panel: '#1B1E24',
        panel2: '#22262E',
        line: '#2E333C',
        ink: '#E8E6E0',
        muted: '#8B9099',
        copper: '#C97A3D',
        copperDim: '#8A5429',
        teal: '#4FB6A8',
        danger: '#C1554A',

        // Priority badges (جديد)
        'priority-haute': '#C1554A',
        'priority-moyenne': '#C97A3D',
        'priority-basse': '#8B9099',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}