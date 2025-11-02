import { useState, useCallback } from 'react'
import { detectChart } from '@/lib/chartDetection'
import type { ChartMessage } from '@/types/charts'

/**
 * Hook to handle chart detection in stream responses
 * 
 * Usage:
 * const { charts, addChart, clearCharts } = useChartDetection()
 */
export const useChartDetection = () => {
  const [charts, setCharts] = useState<ChartMessage[]>([])

  const addChart = useCallback((chart: ChartMessage, source: string) => {
    console.log(`Added chart (source: ${source}):`, chart.meta.title)
    setCharts(prev => [...prev, chart])
  }, [])

  const clearCharts = useCallback(() => {
    setCharts([])
  }, [])

  const removeChart = useCallback((index: number) => {
    setCharts(prev => prev.filter((_, i) => i !== index))
  }, [])

  const updateChart = useCallback((index: number, chart: ChartMessage) => {
    setCharts(prev => {
      const updated = [...prev]
      updated[index] = chart
      return updated
    })
  }, [])

  return {
    charts,
    addChart,
    removeChart,
    updateChart,
    clearCharts,
    chartCount: charts.length
  }
}