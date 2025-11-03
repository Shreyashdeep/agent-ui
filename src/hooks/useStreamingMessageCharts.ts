import { useState, useCallback, useRef } from 'react'
import type { ChartMessage } from '@/types/charts'
import { detectChart } from '@/lib/chartDetection'

/**
 * Hook to manage charts from streaming message updates
 * Handles detection and updates for charts in real-time
 */
export const useStreamingMessageCharts = () => {
  const [charts, setCharts] = useState<ChartMessage[]>([])
  const chartMapRef = useRef<Map<string, ChartMessage>>(new Map())

  /**
   * Handle incoming chunk that might contain a chart
   */
  const onChunkReceived = useCallback((chunk: unknown) => {
    // Try to detect chart in this chunk
    const detection = detectChart(chunk, false)

    if (detection.hasChart && detection.chart) {
      const chartId = detection.chart.id || `chart-${Date.now()}`

      if (detection.source === 'content_type') {
        // Direct chart payload - replace or create
        const operation = detection.chart.operation || 'replace'

        if (operation === 'replace') {
          chartMapRef.current.set(chartId, detection.chart)
        } else if (operation === 'append' && chartMapRef.current.has(chartId)) {
          // Append new data
          const existing = chartMapRef.current.get(chartId)!
          const appended: ChartMessage = {
            ...existing,
            data: [...existing.data, ...detection.chart.data]
          }
          chartMapRef.current.set(chartId, appended)
        } else if (operation === 'patch' && chartMapRef.current.has(chartId)) {
          // Patch fields
          const existing = chartMapRef.current.get(chartId)!
          const patched: ChartMessage = {
            ...existing,
            ...detection.chart,
            meta: { ...existing.meta, ...detection.chart.meta },
            fields: { ...existing.fields, ...detection.chart.fields }
          }
          chartMapRef.current.set(chartId, patched)
        }

        // Update state
        setCharts(Array.from(chartMapRef.current.values()))
      }
    }
  }, [])

  /**
   * Clear all charts
   */
  const clearCharts = useCallback(() => {
    chartMapRef.current.clear()
    setCharts([])
  }, [])

  /**
   * Get chart by ID
   */
  const getChart = useCallback((id: string): ChartMessage | undefined => {
    return chartMapRef.current.get(id)
  }, [])

  return {
    charts,
    onChunkReceived,
    clearCharts,
    getChart,
    chartCount: charts.length
  }
}