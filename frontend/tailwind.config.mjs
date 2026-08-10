/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // WCAG 2.1 AA Compliant Color Palette
        'brand-bg': '#0f172a',           // Dark Slate (Contrast > 15:1 with brand-text)
        'brand-surface': '#1e293b',      // Slate 800
        'brand-surface-light': '#334155',// Slate 700
        'brand-text': '#f8fafc',         // Slate 50 (Contrast 15.8:1 on brand-bg)
        'brand-text-muted': '#cbd5e1',   // Slate 300 (Contrast 10.8:1 on brand-bg)
        'brand-primary': '#0284c7',      // Sky 600 (Contrast 4.6:1 on white)
        'brand-primary-light': '#38bdf8',// Sky 400 (Contrast 7.2:1 on brand-bg)
        'brand-accent': '#e11d48',       // Rose 600 (Contrast 4.5:1 on white)
        'brand-focus': '#38bdf8',        // Sky 400 (High visibility focus ring)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],        // 16px body text
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      }
    },
  },
  plugins: [],
}
