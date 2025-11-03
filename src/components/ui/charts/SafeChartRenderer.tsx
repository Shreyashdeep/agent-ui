'use client'

import React, { useMemo, useState } from 'react'
import type { ChartMessage } from '@/types/charts'
import { validateChartMessage } from '@/types/charts'
import { ChartRenderer } from './ChartRenderer'
import { ChartValidationError } from './ChartValidationError'
import { ChartErrorBoundary } from './ChartErrorBoundary'

interface SafeChartRendererProps {
  chart: ChartMessage | unknown
  height?: number
  className?: string
  showDebugInfo?: boolean
}

/**
 * Safe chart renderer with validation and error handling
 * 
 * Features:
 * - Validates chart data with Zod
 * - Shows friendly error messages
 * - Provides data recovery options
 * - Error boundary for runtime errors
 * - Optional debug info
 */
export const SafeChartRenderer: React.FC<SafeChartRendererProps> = ({
  chart,
  height = 350,
  className = '',
  showDebugInfo = false
}) => {
  const [validationErrors, setValidationErrors] = useState<string[] | null>(null)
  const [showValidationError, setShowValidationError] = useState(false)

  // Validate chart data
  const validationResult = useMemo(() => {
    try {
      const result = validateChartMessage(chart)
      if (!result.valid) {
        setValidationErrors(result.errors)
        setShowValidationError(true)
        return { valid: false, data: null }
      }
      setValidationErrors(null)
      setShowValidationError(false)
      return { valid: true, data: result.data }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown validation error'
      setValidationErrors([errorMsg])
      setShowValidationError(true)
      return { valid: false, data: null }
    }
  }, [chart])

  // Show validation error
  if (showValidationError && validationErrors) {
    return (
      <div className={className}>
        <ChartValidationError
          errors={validationErrors}
          rawData={showDebugInfo ? chart : undefined}
          onRetry={() => setShowValidationError(false)}
        />
      </div>
    )
  }

  // Validation passed, render chart with error boundary
  if (validationResult.valid && validationResult.data) {
    return (
      <div className={className}>
        <ChartErrorBoundary
          chartData={validationResult.data}
          onError={(error) => {
            console.error('Chart error:', error)
            setValidationErrors([error.message])
            setShowValidationError(true)
          }}
        >
          <ChartRenderer chart={validationResult.data} height={height} />
        </ChartErrorBoundary>
      </div>
    )
  }

  return null
}