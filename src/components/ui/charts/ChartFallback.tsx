'use client'

import React from 'react'
import { AlertTriangle, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChartFallbackProps {
  title?: string
  message?: string
  onRetry?: () => void
  type?: 'error' | 'empty' | 'unsupported'
}

/**
 * Fallback component for chart rendering failures
 */
export const ChartFallback: React.FC<ChartFallbackProps> = ({
  title,
  message,
  onRetry,
  type = 'error'
}) => {
  const fallbackContent = {
    error: {
      title: title || 'Unable to Display Chart',
      message: message || 'An error occurred while rendering this chart. Please try again.',
      icon: AlertTriangle
    },
    empty: {
      title: title || 'No Data Available',
      message: message || 'The chart has no data to display.',
      icon: BarChart3
    },
    unsupported: {
      title: title || 'Chart Type Not Supported',
      message: message || 'This chart type is not currently supported.',
      icon: AlertTriangle
    }
  }

  const content = fallbackContent[type]
  const Icon = content.icon

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900" style={{ minHeight: '350px' }}>
      <Icon className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{content.title}</h3>
      <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
        {content.message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4"
        >
          Try Again
        </Button>
      )}
    </div>
  )
}