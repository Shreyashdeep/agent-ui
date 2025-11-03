import type { ChartMessage } from '@/types/charts'

/**
 * Utilities for chart accessibility
 */

/**
 * Generate accessible table from chart data
 * Useful for screen reader users
 */
export const generateAccessibleTable = (chart: ChartMessage): string => {
  if (!chart.data || chart.data.length === 0) {
    return 'No data available'
  }

  const headers = Object.keys(chart.data[0])
  const rows = chart.data

  // Create simple text table representation
  const columnWidths = headers.map(h => {
    const maxLen = Math.max(
      h.length,
      ...rows.map(r => String(r[h]).length)
    )
    return Math.min(maxLen + 2, 20)
  })

  let table = `\n${headers.map((h, i) => h.padEnd(columnWidths[i])).join('')}\n`
  table += `${headers.map((_, i) => '-'.repeat(columnWidths[i])).join('')}\n`

  rows.forEach(row => {
    table += `${headers.map((h, i) => String(row[h]).padEnd(columnWidths[i])).join('')}\n`
  })

  return table
}

/**
 * Generate ARIA label from chart metadata
 */
export const generateAriaLabel = (chart: ChartMessage): string => {
  let label = chart.meta.title || 'Chart'

  if (chart.meta.a11y?.alt) {
    label += ': ' + chart.meta.a11y.alt
  }

  return label
}

/**
 * Get keyboard navigation instructions
 */
export const getKeyboardInstructions = (chartType: string): string => {
  const baseInstructions = 'Use arrow keys to navigate the chart. Press Escape to close.'

  const typeInstructions: Record<string, string> = {
    line: 'Line chart: Use left/right arrows to move between data points.',
    bar: 'Bar chart: Use up/down arrows to move between bars.',
    pie: 'Pie chart: Use left/right arrows to move between slices.',
    area: 'Area chart: Use left/right arrows to move between data points.',
    funnel: 'Funnel chart: Use up/down arrows to move between steps.',
    retention: 'Retention chart: Use arrow keys to navigate the table.'
  }

  return `${baseInstructions} ${typeInstructions[chartType] || ''}`
}

/**
 * Test chart for accessibility issues
 */
export interface A11yCheckResult {
  passed: boolean
  issues: string[]
  warnings: string[]
}

export const checkChartAccessibility = (chart: ChartMessage): A11yCheckResult => {
  const issues: string[] = []
  const warnings: string[] = []

  // Check for alt text
  if (!chart.meta.a11y?.alt) {
    issues.push('Missing alt text for chart')
  }

  // Check for title
  if (!chart.meta.title) {
    issues.push('Chart has no title')
  }

  // Check for color-only differentiation (warn)
  if (
    chart.type === 'line' &&
    chart.fields &&
    'series' in chart.fields &&
    chart.fields.series.length > 1
  ) {
    warnings.push('Consider using different line styles in addition to colors for colorblind accessibility')
  }

  // Check for adequate contrast (simplified)
  if (chart.meta.colors) {
    warnings.push('Ensure sufficient color contrast with background')
  }

  // Check data size
  if (chart.data.length > 1000) {
    warnings.push('Large dataset may be difficult to understand via screen reader')
  }

  return {
    passed: issues.length === 0,
    issues,
    warnings
  }
}

/**
 * Generate accessible data summary
 */
export const generateDataSummary = (chart: ChartMessage): string => {
  const dataPoints = chart.data.length
  const summary: string[] = [
    `${chart.meta.title || 'Chart'}`,
    `Type: ${chart.type}`,
    `Data points: ${dataPoints}`
  ]

  // Add field info
  if (chart.fields && 'xKey' in chart.fields) {
    summary.push(`X-axis: ${chart.meta.xLabel || chart.fields.xKey}`)
  }

  if (chart.fields && 'yKey' in chart.fields) {
    summary.push(`Y-axis: ${chart.meta.yLabel || 'values'}`)
  }

  if (chart.meta.unit) {
    summary.push(`Unit: ${chart.meta.unit}`)
  }

  return summary.join('\n')
}