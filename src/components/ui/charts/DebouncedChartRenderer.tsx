'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { ChartRenderer } from './ChartRenderer'
import type { ChartMessage } from '@/types/charts'

interface DebouncedChartRendererProps {
  chart: ChartMessage
  height?: number
  debounceMs?: number
  onUpdate?: (chart: ChartMessage) => void
}

/**
 * Chart renderer with debounced updates
 * Prevents excessive re-renders during rapid updates
 */
export const DebouncedChartRenderer: React.FC<DebouncedChartRendererProps> = ({
  chart,
  height = 350,
  debounceMs = 200,
  onUpdate
}) => {
  const [displayChart, setDisplayChart] = useState<ChartMessage>(chart)
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  // Debounce chart updates
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer to update display
    debounceTimerRef.current = setTimeout(() => {
      setDisplayChart(chart)
      onUpdate?.(chart)
    }, debounceMs)

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [chart, debounceMs, onUpdate])

  return <ChartRenderer chart={displayChart} height={height} />
}