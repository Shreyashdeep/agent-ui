import type { ChartMessage } from '@/types/charts'
import { getApproximateSize } from './bundleSizeUtils'

/**
 * Performance optimization checklist
 */
export interface PerformanceChecklistItem {
  name: string
  status: 'pass' | 'warn' | 'fail'
  message: string
  suggestion?: string
}

/**
 * Run performance checks on a chart
 */
export const runPerformanceChecks = (chart: ChartMessage): PerformanceChecklistItem[] => {
  const checks: PerformanceChecklistItem[] = []

  // Check 1: Data size
  const dataSize = getApproximateSize(chart.data)
  if (dataSize > 1024 * 1024) {
    checks.push({
      name: 'Data Size',
      status: 'fail',
      message: `Chart data is very large (${(dataSize / 1024).toFixed(2)}KB)`,
      suggestion: 'Consider downsampling or paginating data'
    })
  } else if (dataSize > 512 * 1024) {
    checks.push({
      name: 'Data Size',
      status: 'warn',
      message: `Chart data is large (${(dataSize / 1024).toFixed(2)}KB)`,
      suggestion: 'Consider downsampling for better performance'
    })
  } else {
    checks.push({
      name: 'Data Size',
      status: 'pass',
      message: `Chart data is optimal (${(dataSize / 1024).toFixed(2)}KB)`
    })
  }

  // Check 2: Data points count
  if (chart.data.length > 10000) {
    checks.push({
      name: 'Data Points',
      status: 'fail',
      message: `${chart.data.length} data points - too many for smooth rendering`,
      suggestion: 'Downsample to <5000 points'
    })
  } else if (chart.data.length > 5000) {
    checks.push({
      name: 'Data Points',
      status: 'warn',
      message: `${chart.data.length} data points - may impact performance`,
      suggestion: 'Consider downsampling'
    })
  } else {
    checks.push({
      name: 'Data Points',
      status: 'pass',
      message: `${chart.data.length} data points - optimal`
    })
  }

  // Check 3: Series count
  if (chart.fields && 'series' in chart.fields) {
    const seriesCount = (chart.fields as any).series.length
    if (seriesCount > 20) {
      checks.push({
        name: 'Series Count',
        status: 'warn',
        message: `${seriesCount} series - too many for clear visualization`,
        suggestion: 'Consider limiting to <10 series'
      })
    } else {
      checks.push({
        name: 'Series Count',
        status: 'pass',
        message: `${seriesCount} series - optimal`
      })
    }
  }

  // Check 4: Colors defined
  if (!chart.meta.colors) {
    checks.push({
      name: 'Colors',
      status: 'warn',
      message: 'No custom colors defined',
      suggestion: 'Define colors to avoid re-calculation'
    })
  } else {
    checks.push({
      name: 'Colors',
      status: 'pass',
      message: 'Colors pre-defined'
    })
  }

  // Check 5: Memoization hints
  checks.push({
    name: 'Memoization',
    status: 'pass',
    message: 'Use MemoizedLineChartV and similar for better performance'
  })

  return checks
}

/**
 * Log performance checks
 */
export const logPerformanceChecks = (chart: ChartMessage): void => {
  const checks = runPerformanceChecks(chart)

  console.group(`[Performance] Checks for "${chart.meta.title}"`)

  checks.forEach(check => {
    const emoji = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌'
    console.log(`${emoji} ${check.name}: ${check.message}`)
    if (check.suggestion) {
      console.log(`   💡 ${check.suggestion}`)
    }
  })

  console.groupEnd()
}