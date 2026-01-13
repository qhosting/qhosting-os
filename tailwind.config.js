
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cyan: {
          400: '#00AEEF',
          500: '#0096cc',
        },
        slate: {
          950: '#020617',
        }
      },
      backgroundImage: {
        'titan-gradient': 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.9) 100%)',
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0, 174, 239, 0.4)',
      }
    },
  },
  plugins: [],
}
