import { parseMessageForCharts } from '@/lib/messageChartIntegration'
import { validateChartWithDetails, isChartDataReasonable, sanitizeChartData } from '@/lib/chartValidationUtils'
import { chartErrorLogger, ErrorSeverity } from '@/lib/chartErrorLogger'
import type { ChartMessage } from '@/types/charts'

/**
 * Safe message parsing with validation and error logging
 */
export interface SafeParseResult {
  text: string
  charts: ChartMessage[]
  hasCharts: boolean
  errors: Array<{
    chartIndex: number
    message: string
    severity: ErrorSeverity
  }>
}

/**
 * Safely parse message for charts with validation
 */
export const safeParseMessageForCharts = (message: unknown): SafeParseResult => {
  const result: SafeParseResult = {
    text: '',
    charts: [],
    hasCharts: false,
    errors: []
  }

  try {
    // Parse message
    const parsed = parseMessageForCharts(message)
    result.text = parsed.text
    result.hasCharts = parsed.hasCharts

    // Validate each chart
    for (let i = 0; i < parsed.charts.length; i++) {
      const chart = parsed.charts[i]

      // Validate chart
      const validation = validateChartWithDetails(chart)

      if (!validation.valid) {
        chartErrorLogger.log(
          `Chart ${i} validation failed: ${validation.errors?.join(', ')}`,
          ErrorSeverity.HIGH,
          chart as any
        )

        result.errors.push({
          chartIndex: i,
          message: validation.errors?.join(', ') || 'Unknown validation error',
          severity: ErrorSeverity.HIGH
        })
        continue
      }

      // Check data reasonableness
      const sizeCheck = isChartDataReasonable(validation.data!)

      if (!sizeCheck.valid) {
        chartErrorLogger.log(
          `Chart ${i} data size issue: ${sizeCheck.message}`,
          ErrorSeverity.MEDIUM,
          validation.data as any
        )

        result.errors.push({
          chartIndex: i,
          message: sizeCheck.message || 'Data size exceeded',
          severity: ErrorSeverity.MEDIUM
        })
        continue
      }

      // Sanitize chart
      const sanitized = sanitizeChartData(validation.data!)

      // Add to results
      result.charts.push(sanitized)

      // Log warnings
      if (validation.warnings && validation.warnings.length > 0) {
        chartErrorLogger.log(
          `Chart ${i} warnings: ${validation.warnings.join(', ')}`,
          ErrorSeverity.LOW,
          sanitized
        )
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    chartErrorLogger.log(
      `Failed to parse message for charts: ${errorMsg}`,
      ErrorSeverity.CRITICAL,
      undefined,
      error instanceof Error ? error.stack : undefined
    )

    result.errors.push({
      chartIndex: -1,
      message: `Critical error: ${errorMsg}`,
      severity: ErrorSeverity.CRITICAL
    })
  }

  return result
}