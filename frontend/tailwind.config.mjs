/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm Community Narrative Design System Tokens
        surface: {
          DEFAULT: '#FDFBF7',
          dim: '#ded9d7',
          bright: '#fef8f6',
          lowest: '#ffffff',
          low: '#f8f2f0',
          container: '#f2edeb',
          high: '#ece7e5',
          highest: '#e7e1df',
        },
        'on-surface': {
          DEFAULT: '#1d1b1a',
          variant: '#5b403d',
        },
        'inverse-surface': {
          DEFAULT: '#32302f',
          on: '#f5f0ee',
        },
        outline: {
          DEFAULT: '#906f6c',
          variant: '#e4beba',
        },
        primary: {
          DEFAULT: '#DD3333',
          dark: '#b9151e',
          container: '#dd3333',
          'on-container': '#fffeff',
          fixed: '#ffdad6',
          'fixed-dim': '#ffb3ac',
        },
        secondary: {
          DEFAULT: '#5e5e5c',
          container: '#e1dfdc',
          'on-container': '#636360',
        },
        tertiary: {
          DEFAULT: '#43AD48',
          dark: '#006c1a',
          container: '#148828',
          'on-container': '#fdfff7',
        },
        accent: {
          'berry-red': '#DD3333',
          'cafe-cream': '#FDFBF7',
          'sage-green': '#43AD48',
          'gold-yellow': '#F2B705',
          'paper-white': '#FFFFFF',
        },
        brand: {
          primary: '#DD3333',
          'primary-hover': '#b9151e',
          'primary-light': '#DD3333',
          secondary: '#43AD48',
          'secondary-hover': '#006c1a',
          'secondary-light': '#43AD48',
          marker: '#F2B705',
          'marker-text': '#1d1b1a',
          bg: '#FDFBF7',
          surface: '#FFFFFF',
          'surface-light': '#f8f2f0',
          card: '#FFFFFF',
          text: '#1d1b1a',
          'text-muted': '#5b403d',
          'text-dark': '#1d1b1a',
          focus: '#DD3333',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Literata"', 'Georgia', 'serif'],
        heading: ['"Literata"', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
        card: '1rem',
        button: '9999px',
        pill: '9999px',
      },
      boxShadow: {
        tactile: '0 4px 20px rgba(51, 49, 48, 0.05)',
        'tactile-hover': '0 8px 30px rgba(51, 49, 48, 0.09)',
      },
      spacing: {
        unit: '8px',
        gutter: '24px',
        'margin-mobile': '16px',
        'margin-desktop': '40px',
        'container-max': '1200px',
      }
    },
  },
  plugins: [],
}
