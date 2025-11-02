import { useTheme } from 'next-themes'
import { useMemo } from 'react'

/**
 * Provides theme-aware colors and styles for charts
 * Supports dark mode and custom color palettes
 */
export const useChartTheme = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const colors = useMemo(
    () => ({
      // Chart color palette (Tailwind inspired)
      primary: isDark ? '#3b82f6' : '#2563eb',
      secondary: isDark ? '#8b5cf6' : '#7c3aed',
      success: isDark ? '#10b981' : '#059669',
      warning: isDark ? '#f59e0b' : '#d97706',
      danger: isDark ? '#ef4444' : '#dc2626',
      info: isDark ? '#06b6d4' : '#0891b2',

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
    colors,
    chartConfig
  }
}

/**
 * Get CSS variable color or fallback to hex
 * Supports both #hex and hsl(var(--color)) formats
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
    // Return the CSS value directly - Recharts will handle it
    return colorInput
  }

  // Named colors
  const namedColors: Record<string, string> = {
    primary: isDark ? '#3b82f6' : '#2563eb',
    secondary: isDark ? '#8b5cf6' : '#7c3aed',
    success: isDark ? '#10b981' : '#059669',
    warning: isDark ? '#f59e0b' : '#d97706',
    danger: isDark ? '#ef4444' : '#dc2626',
  }

  return namedColors[colorInput] || defaultColor
}