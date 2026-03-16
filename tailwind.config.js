export default {
  content: [ 
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        fadeOut: {
          '0%': { opacity: '1' },
          '60%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        fadeOut: 'fadeOut 2s ease-out forwards',
      },
      colors: {
        primario: '#617afa',
        secundario: '#f59e42',
        acento: '#10b981',
      },
    },
  },
  plugins: [],
}

