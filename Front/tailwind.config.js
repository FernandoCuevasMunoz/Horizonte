export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        root: '#1E4D40',
        cream: '#fbfbf8',
        forest: '#0f4a3d',
        'forest-dark': '#123f35',
        mint: '#79a77d',
        'mint-light': '#87bd88',
        moss: '#5e6a66',
        'moss-light': '#4d5a58',
        border: '#e2e8e4',
        'border-input': '#dfe5e2',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
}
