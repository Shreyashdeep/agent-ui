'use client'

import React, { useMemo } from 'react'
import { checkChartAccessibility, generateDataSummary } from '@/lib/chartA11yUtils'
import type { ChartMessage } from '@/types/charts'
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChartAccessibilityTestProps {
  chart: ChartMessage
  show?: boolean
}

/**
 * Development component to test chart accessibility
 * Shows accessibility issues and provides debugging info
 */
export const ChartAccessibilityTest: React.FC<ChartAccessibilityTestProps> = ({
  chart,
  show = false
}) => {
  const a11yResult = useMemo(() => checkChartAccessibility(chart), [chart])
  const dataSummary = useMemo(() => generateDataSummary(chart), [chart])

  if (!show || process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950 mt-4">
      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
        ♿ Accessibility Test
      </h4>

      {/* Status */}
      <div className="mb-3 flex items-center gap-2">
        {a11yResult.passed ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300">No critical issues</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="text-red-700 dark:text-red-300">Issues found</span>
          </>
        )}
      </div>

      {/* Issues */}
      {a11yResult.issues.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Issues:</p>
          <ul className="space-y-1">
            {a11yResult.issues.map((issue, i) => (
              <li key={i} className="text-xs text-red-600 dark:text-red-400">
                • {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {a11yResult.warnings.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">Warnings:</p>
          <ul className="space-y-1">
            {a11yResult.warnings.map((warning, i) => (
              <li key={i} className="text-xs text-yellow-600 dark:text-yellow-400">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Summary */}
      <div className="mb-3">
        <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Data Summary:</p>
        <pre className="text-xs bg-white dark:bg-gray-950 rounded p-2 overflow-x-auto">
          {dataSummary}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const table = document.querySelector('[role="table"]')
            if (table) {
              table.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        >
          View Data Table
        </Button>
      </div>
    </div>
  )
}