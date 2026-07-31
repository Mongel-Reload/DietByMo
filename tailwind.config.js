/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#eef3f0',
          100: '#d8e5dd',
          200: '#b0cbba',
          300: '#83ad93',
          400: '#57906f',
          500: '#3a7455',
          600: '#295b42',
          700: '#1f4b3f',
          800: '#183a31',
          900: '#122c26'
        },
        sand: {
          50: '#faf9f6',
          100: '#f7f8f5',
          200: '#eef0ea'
        },
        mango: {
          400: '#ffa563',
          500: '#ff8c42',
          600: '#f26f1f'
        },
        sage: {
          400: '#8fa998',
          500: '#728f7d'
        },
        ink: '#16241e'
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      boxShadow: {
        soft: '0 4px 20px rgba(22, 36, 30, 0.06)'
      }
    }
  },
  plugins: []
}
