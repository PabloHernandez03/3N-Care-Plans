/** @type {import('tailwindcss').Config} */
export default {
  content: [ 
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        slideUp: {
          'from': { transform: 'translateY(400px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        'in': 'slideUp 0.3s ease-out',
        'bounce': 'bounce 1s infinite'
      },
      transitionDelay: {
        '100': '100ms',
        '200': '200ms'
      },
      height: {
        'screen-75': 'calc(100vh - 120px)',
        'screen-50': '50vh'
      }
    },
  },
  plugins: [],
}

