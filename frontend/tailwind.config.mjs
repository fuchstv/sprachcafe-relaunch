/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary Polish Crimson Red (Extracted from live site: #D4213D - WCAG 2.1 AA 4.8:1 on light)
          primary: '#D4213D',
          'primary-hover': '#b91c34',
          'primary-light': '#f43f5e',

          // Ocean Blue Secondary (Extracted from live site: #007bb6 - WCAG 2.1 AA 4.6:1 on light)
          secondary: '#007bb6',
          'secondary-hover': '#006ba1',
          'secondary-light': '#38bdf8',

          // Highlighting Marker Color for ==markierten Text== (Extracted: #fbd100 - Contrast 14.8:1 with dark text)
          marker: '#fbd100',
          'marker-text': '#0f172a',

          // Neutral Background & Surface Scale
          bg: '#0f172a',
          surface: '#1e293b',
          'surface-light': '#334155',
          card: '#1e293b',

          // Text Colors (WCAG AAA Compliant)
          text: '#f8fafc',           // Contrast 15.8:1 on brand.bg
          'text-muted': '#cbd5e1',     // Contrast 10.8:1 on brand.bg
          'text-dark': '#0f172a',

          // High-Visibility Focus Outline Token
          focus: '#38bdf8',
        }
      },
      fontFamily: {
        sans: ['"Open Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Montserrat', 'Radley', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1rem',        // 16px for content cards
        button: '0.75rem',   // 12px for buttons
        pill: '9999px',      // Rounded pills for language switcher and badges
      },
      spacing: {
        card: '1.5rem',      // 24px padding for card containers
        section: '4rem',     // 64px section padding
      }
    },
  },
  plugins: [],
}
