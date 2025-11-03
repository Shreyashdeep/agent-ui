import { ChartMessage, validateChartMessage } from '@/types/charts'

/**
 * Detailed validation result
 */
export interface ValidationResult {
  valid: boolean
  data?: ChartMessage
  errors?: string[]
  warnings?: string[]
}

/**
 * Validate chart and provide detailed results
 */
export const validateChartWithDetails = (data: unknown): ValidationResult => {
  try {
    // First check if it's an object
    if (!data || typeof data !== 'object') {
      return {
        valid: false,
        errors: ['Chart data must be an object']
      }
    }

    // Check for required fields
    const obj = data as Record<string, unknown>
    const missingFields: string[] = []

    if (!obj.content_type) missingFields.push('content_type')
    if (!obj.type) missingFields.push('type')
    if (!obj.fields) missingFields.push('fields')
    if (!obj.data) missingFields.push('data')
    if (!obj.meta) missingFields.push('meta')

    if (missingFields.length > 0) {
      return {
        valid: false,
        errors: [`Missing required fields: ${missingFields.join(', ')}`]
      }
    }

    // Validate with Zod schema
    const result = validateChartMessage(data)

    if (!result.valid) {
      return {
        valid: false,
        errors: result.errors,
        warnings: generateWarnings(data as any)
      }
    }

    // Check for common issues (warnings, not errors)
    const warnings = generateWarnings(result.data)

    return {
      valid: true,
      data: result.data,
      warnings
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return {
      valid: false,
      errors: [`Validation exception: ${errorMsg}`]
    }
  }
}

/**
 * Generate warnings for common chart issues
 */
const generateWarnings = (chart: ChartMessage): string[] => {
  const warnings: string[] = []

  // Warn if data is empty
  if (!chart.data || chart.data.length === 0) {
    warnings.push('Chart has no data. It may not display correctly.')
  }

  // Warn if data is very large
  if (chart.data && chart.data.length > 10000) {
    warnings.push(
      `Large dataset detected (${chart.data.length} rows). Consider downsampling for better performance.`
    )
  }

  // Warn if title is missing
  if (!chart.meta?.title) {
    warnings.push('Chart title is missing. Consider adding one for better UX.')
  }

  // Warn if accessibility info is missing
  if (!chart.meta?.a11y?.alt) {
    warnings.push('Alt text is missing. This is important for accessibility.')
  }

  return warnings
}

/**
 * Sanitize chart data to remove potentially harmful content
 */
export const sanitizeChartData = (chart: ChartMessage): ChartMessage => {
  return {
    ...chart,
    meta: {
      ...chart.meta,
      title: sanitizeString(chart.meta.title),
      xLabel: chart.meta.xLabel ? sanitizeString(chart.meta.xLabel) : undefined,
      yLabel: chart.meta.yLabel ? sanitizeString(chart.meta.yLabel) : undefined,
      unit: chart.meta.unit ? sanitizeString(chart.meta.unit) : undefined,
      notes: chart.meta.notes ? sanitizeString(chart.meta.notes) : undefined,
      a11y: chart.meta.a11y ? {
        alt: sanitizeString(chart.meta.a11y.alt),
        description: chart.meta.a11y.description
          ? sanitizeString(chart.meta.a11y.description)
          : undefined
      } : undefined
    }
  }
}

/**
 * Sanitize string to prevent XSS
 */
const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return str

  return str
    .replace(/[<>]/g, (char) => {
      const map = { '<': '&lt;', '>': '&gt;' }
      return map[char as keyof typeof map] || char
    })
    .slice(0, 500) // Limit length
}

/**
 * Check if chart data size is reasonable
 */
export const isChartDataReasonable = (chart: ChartMessage): { valid: boolean; message?: string } => {
  const MAX_ROWS = 50000
  const MAX_FIELDS = 100

  if (chart.data.length > MAX_ROWS) {
    return {
      valid: false,
      message: `Chart has too many data rows (${chart.data.length}). Maximum is ${MAX_ROWS}.`
    }
  }

  if (chart.data.length > 0) {
    const fieldCount = Object.keys(chart.data[0]).length
    if (fieldCount > MAX_FIELDS) {
      return {
        valid: false,
        message: `Chart has too many fields (${fieldCount}). Maximum is ${MAX_FIELDS}.`
      }
    }
  }

  return { valid: true }
}