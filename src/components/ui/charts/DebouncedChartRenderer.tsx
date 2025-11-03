'use client'

import React, { useMemo, useEffect, useState, useCallback } from 'react'
import { ChartRenderer } from './ChartRenderer'
import type { ChartMessage } from '@/types/charts'
import { throttle } from '@/lib/throttle'

interface DebouncedChartRendererProps {
  chart: ChartMessage
  height?: number
  debounceMs?: number
  onUpdate?: (chart: ChartMessage) => void
  throttleMs?: number
}

/**
 * Optimized chart renderer with debounced updates
 * Prevents excessive re-renders during rapid updates
 * Includes throttling for streaming scenarios
 */
export const DebouncedChartRenderer: React.FC<DebouncedChartRendererProps> = ({
  chart,
  height = 350,
  debounceMs = 200,
  onUpdate,
  throttleMs = 100
}) => {
  const [displayChart, setDisplayChart] = useState<ChartMessage>(chart)
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  // Throttle callback to limit update frequency
  const throttledUpdate = useMemo(
    () => throttle((updatedChart: ChartMessage) => {
      setDisplayChart(updatedChart)
      onUpdate?.(updatedChart)
    }, throttleMs),
    [onUpdate, throttleMs]
  )

  // Debounce chart updates
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer to update display
    debounceTimerRef.current = setTimeout(() => {
      throttledUpdate(chart)
    }, debounceMs)

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [chart, debounceMs, throttledUpdate])

  return <ChartRenderer chart={displayChart} height={height} />
}