import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChartMessage } from '@/types/charts'
import { validateChartMessage } from '@/types/charts'

/**
 * Chart update operation types
 */
export type ChartOperation = 'replace' | 'append' | 'patch'

/**
 * State for streaming chart updates
 */
export interface StreamingChartState {
  charts: Map<string, ChartMessage> // chartId -> chart
  updateQueue: Array<{ id: string; update: Partial<ChartMessage>; operation: ChartOperation }>
  isProcessing: boolean
}

/**
 * Hook to manage chart streaming updates with debouncing
 * 
 * Features:
 * - Handles replace, append, patch operations
 * - Debounces updates for performance
 * - Validates updates before applying
 * - Maintains chart state by ID
 */
export const useChartStreaming = (debounceMs: number = 100) => {
  const [charts, setCharts] = useState<Map<string, ChartMessage>>(new Map())
  const [isProcessing, setIsProcessing] = useState(false)
  const updateQueueRef = useRef<Array<{ id: string; update: Partial<ChartMessage>; operation: ChartOperation }>>([])
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Process queued updates with debouncing
   */
  const processQueue = useCallback(() => {
    if (updateQueueRef.current.length === 0) {
      setIsProcessing(false)
      return
    }

    setIsProcessing(true)
    setCharts(prevCharts => {
      const newCharts = new Map(prevCharts)

      // Process all queued updates
      while (updateQueueRef.current.length > 0) {
        const { id, update, operation } = updateQueueRef.current.shift()!

        const currentChart = newCharts.get(id)

        switch (operation) {
          case 'replace': {
            // Replace entire chart
            const validation = validateChartMessage(update)
            if (validation.valid) {
              newCharts.set(id, validation.data)
              console.log(`✅ Chart ${id} replaced`)
            } else {
              console.error(`❌ Chart ${id} validation failed:`, validation.errors)
            }
            break
          }

          case 'append': {
            // Append data rows to existing chart
            if (currentChart && update.data && Array.isArray(update.data)) {
              const appendedChart: ChartMessage = {
                ...currentChart,
                data: [...currentChart.data, ...update.data]
              }
              newCharts.set(id, appendedChart)
              console.log(`✅ Chart ${id} appended with ${update.data.length} rows`)
            } else {
              console.warn(`⚠️ Chart ${id} not found or no data to append`)
            }
            break
          }

          case 'patch': {
            // Patch specific fields
            if (currentChart) {
              const patchedChart: ChartMessage = {
                ...currentChart,
                ...update,
                meta: { ...currentChart.meta, ...(update.meta || {}) },
                fields: { ...currentChart.fields, ...(update.fields || {}) }
              }

              // Validate patched chart
              const validation = validateChartMessage(patchedChart)
              if (validation.valid) {
                newCharts.set(id, validation.data)
                console.log(`✅ Chart ${id} patched`)
              } else {
                console.error(`❌ Chart ${id} patch validation failed:`, validation.errors)
              }
            } else {
              console.warn(`⚠️ Chart ${id} not found for patching`)
            }
            break
          }
        }
      }

      return newCharts
    })

    setIsProcessing(false)
  }, [])

  /**
   * Handle chart update with debouncing
   */
  const updateChart = useCallback(
    (id: string, update: Partial<ChartMessage>, operation: ChartOperation = 'replace') => {
      // Add to queue
      updateQueueRef.current.push({ id, update, operation })

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        processQueue()
      }, debounceMs)
    },
    [debounceMs, processQueue]
  )

  /**
   * Replace entire chart
   */
  const replaceChart = useCallback(
    (id: string, chart: ChartMessage) => {
      updateChart(id, chart, 'replace')
    },
    [updateChart]
  )

  /**
   * Append data to existing chart
   */
  const appendChartData = useCallback(
    (id: string, newData: Record<string, any>[]) => {
      updateChart(id, { data: newData } as Partial<ChartMessage>, 'append')
    },
    [updateChart]
  )

  /**
   * Patch specific chart fields
   */
  const patchChart = useCallback(
    (id: string, patch: Partial<ChartMessage>) => {
      updateChart(id, patch, 'patch')
    },
    [updateChart]
  )

  /**
   * Get chart by ID
   */
  const getChart = useCallback((id: string): ChartMessage | undefined => {
    return charts.get(id)
  }, [charts])

  /**
   * Get all charts
   */
  const getAllCharts = useCallback((): ChartMessage[] => {
    return Array.from(charts.values())
  }, [charts])

  /**
   * Clear all charts
   */
  const clearCharts = useCallback(() => {
    setCharts(new Map())
    updateQueueRef.current = []
  }, [])

  /**
   * Force process queue immediately (useful for testing)
   */
  const flush = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    processQueue()
  }, [processQueue])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    charts,
    isProcessing,
    updateChart,
    replaceChart,
    appendChartData,
    patchChart,
    getChart,
    getAllCharts,
    clearCharts,
    flush
  }
}