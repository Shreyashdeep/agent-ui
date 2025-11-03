import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        chart: {
          '1': 'hsl(var(--chart-1) / <alpha-value>)',
          '2': 'hsl(var(--chart-2) / <alpha-value>)',
          '3': 'hsl(var(--chart-3) / <alpha-value>)',
          '4': 'hsl(var(--chart-4) / <alpha-value>)',
          '5': 'hsl(var(--chart-5) / <alpha-value>)',
          '6': 'hsl(var(--chart-6) / <alpha-value>)',
          '7': 'hsl(var(--chart-7) / <alpha-value>)',
          '8': 'hsl(var(--chart-8) / <alpha-value>)',
          '9': 'hsl(var(--chart-9) / <alpha-value>)',
          '10': 'hsl(var(--chart-10) / <alpha-value>)',
          '11': 'hsl(var(--chart-11) / <alpha-value>)',
          '12': 'hsl(var(--chart-12) / <alpha-value>)',
        },
        primary: '#FAFAFA',
        primaryAccent: '#18181B',
        brand: '#FF4017',
        background: {
          DEFAULT: '#111113',
          secondary: '#27272A'
        },
        secondary: '#f5f5f5',
        border: 'rgba(var(--color-border-default))',
        accent: '#27272A',
        muted: '#A1A1AA',
        destructive: '#E53935',
        positive: '#22C55E'
      },
      fontFamily: {
        geist: 'var(--font-geist-sans)',
        dmmono: 'var(--font-dm-mono)'
      },
      borderRadius: {
        xl: '10px'
      }
    }
  },
  plugins: [tailwindcssAnimate]
} satisfies Config
