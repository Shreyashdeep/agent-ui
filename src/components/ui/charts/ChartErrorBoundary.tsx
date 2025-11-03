'use client'

import React, { ReactNode, useCallback } from 'react'
import { AlertCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChartErrorBoundaryProps {
  children: ReactNode
  onError?: (error: Error) => void
  chartData?: any
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary for chart rendering
 * Catches rendering errors and displays user-friendly messages
 */
export class ChartErrorBoundary extends React.Component<
  ChartErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart rendering error:', error, errorInfo)
    this.props.onError?.(error)
  }

  downloadChartJSON = () => {
    if (!this.props.chartData) return

    const element = document.createElement('a')
    const file = new Blob([JSON.stringify(this.props.chartData, null, 2)], {
      type: 'application/json'
    })
    element.href = URL.createObjectURL(file)
    element.download = 'chart-data.json'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Chart Rendering Error
              </h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">
                {this.state.error?.message || 'An unexpected error occurred while rendering this chart.'}
              </p>
              {this.props.chartData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.downloadChartJSON}
                  className="mt-3"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Chart Data
                </Button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}