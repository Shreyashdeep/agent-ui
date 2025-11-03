'use client'

import React, { useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp, Download, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ChartValidationErrorProps {
  errors: string[]
  rawData?: any
  chartTitle?: string
  onRetry?: () => void
}

/**
 * Component to display chart validation errors
 * Shows detailed error messages and provides data recovery options
 */
export const ChartValidationError: React.FC<ChartValidationErrorProps> = ({
  errors,
  rawData,
  chartTitle = 'Chart',
  onRetry
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const downloadJSON = () => {
    if (!rawData) return

    const element = document.createElement('a')
    const file = new Blob([JSON.stringify(rawData, null, 2)], {
      type: 'application/json'
    })
    element.href = URL.createObjectURL(file)
    element.download = `${chartTitle.toLowerCase().replace(/\s+/g, '-')}-data.json`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const copyToClipboard = () => {
    if (!rawData) return

    navigator.clipboard.writeText(JSON.stringify(rawData, null, 2))
    toast.success('Chart data copied to clipboard!')
  }

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400 mt-0.5" />
        
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
            Invalid Chart Data
          </h3>
          
          <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
            The chart could not be rendered due to validation errors:
          </p>

          {/* Error list */}
          <div className="mt-3 space-y-1">
            {errors.slice(0, isExpanded ? undefined : 2).map((error, idx) => (
              <p
                key={idx}
                className="text-xs text-yellow-700 dark:text-yellow-300 font-mono bg-yellow-100 dark:bg-yellow-900/30 rounded px-2 py-1"
              >
                • {error}
              </p>
            ))}
          </div>

          {errors.length > 2 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3" /> Hide ({errors.length - 2} more)
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" /> Show ({errors.length - 2} more)
                </>
              )}
            </button>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="text-yellow-700 dark:text-yellow-300"
              >
                Retry
              </Button>
            )}
            {rawData && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-yellow-700 dark:text-yellow-300"
                >
                  <Copy className="h-4 w-4 mr-2" /> Copy JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadJSON}
                  className="text-yellow-700 dark:text-yellow-300"
                >
                  <Download className="h-4 w-4 mr-2" /> Download JSON
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}