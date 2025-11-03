import { useTheme } from 'next-themes'
import { useMemo } from 'react'

/**
 * Provides theme-aware colors and styles for charts
 * Supports dark mode and CSS variable-based color palette
 */
export const useChartTheme = () => {
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  const colors = useMemo(
    () => ({
      // Primary palette - using CSS variables
      primary: 'hsl(var(--chart-1))',
      secondary: 'hsl(var(--chart-2))',
      tertiary: 'hsl(var(--chart-3))',
      accent1: 'hsl(var(--chart-4))',
      accent2: 'hsl(var(--chart-5))',
      accent3: 'hsl(var(--chart-6))',
      
      // Status colors
      success: 'hsl(var(--chart-7))',
      warning: 'hsl(var(--chart-6))',
      danger: isDark ? '#ef4444' : '#dc2626',
      info: 'hsl(var(--chart-9))',

      // Background and text
      background: isDark ? '#1f2937' : '#ffffff',
      foreground: isDark ? '#f3f4f6' : '#111827',
      border: isDark ? '#374151' : '#e5e7eb',
      gridStroke: isDark ? '#4b5563' : '#e5e7eb',

      // Axes and labels
      axisStroke: isDark ? '#6b7280' : '#d1d5db',
      axisText: isDark ? '#9ca3af' : '#6b7280',

      // Tooltip
      tooltipBackground: isDark ? '#1f2937' : '#ffffff',
      tooltipBorder: isDark ? '#4b5563' : '#d1d5db',
      tooltipText: isDark ? '#f3f4f6' : '#111827',

      // Legend
      legendText: isDark ? '#d1d5db' : '#374151',
    }),
    [isDark]
  )

  const chartConfig = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      margin: {
        top: 20,
        right: 30,
        bottom: 20,
        left: 0
      }
    }),
    []
  )

  return {
    isDark,
    theme: currentTheme,
    colors,
    chartConfig
  }
}

/**
 * Get CSS variable color or fallback to hex
 * Supports both #hex, hsl(var(--color)), and named colors
 */
export const resolveChartColor = (
  colorInput: string | undefined,
  isDark: boolean,
  defaultColor: string
): string => {
  if (!colorInput) return defaultColor

  // If it's already a hex color, return as-is
  if (colorInput.startsWith('#')) return colorInput

  // If it's a CSS var reference like hsl(var(--chart-1))
  if (colorInput.includes('var(')) {
    return colorInput
  }

  // Named colors
  const namedColors: Record<string, string> = {
    primary: 'hsl(var(--chart-1))',
    secondary: 'hsl(var(--chart-2))',
    success: 'hsl(var(--chart-7))',
    warning: 'hsl(var(--chart-6))',
    danger: isDark ? '#ef4444' : '#dc2626',
    info: 'hsl(var(--chart-9))',
    chart1: 'hsl(var(--chart-1))',
    chart2: 'hsl(var(--chart-2))',
    chart3: 'hsl(var(--chart-3))',
    chart4: 'hsl(var(--chart-4))',
    chart5: 'hsl(var(--chart-5))',
    chart6: 'hsl(var(--chart-6))',
  }

  return namedColors[colorInput] || defaultColor
}