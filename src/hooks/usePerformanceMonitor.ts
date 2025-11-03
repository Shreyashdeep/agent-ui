import { useEffect, useRef } from 'react'

/**
 * Performance metrics tracker
 */
export interface PerformanceMetrics {
  renderTime: number
  memoryUsage?: number
  fps?: number
  timestamp: number
}

/**
 * Hook to monitor performance of chart components
 */
export const usePerformanceMonitor = (componentName: string) => {
  const startTimeRef = useRef<number>(Date.now())
  const metricsRef = useRef<PerformanceMetrics[]>([])

  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime

      const metric: PerformanceMetrics = {
        renderTime,
        timestamp: Date.now(),
        memoryUsage: (performance as any).memory?.usedJSHeapSize,
        fps: 60 // Rough estimate
      }

      metricsRef.current.push(metric)

      // Keep only last 100 metrics
      if (metricsRef.current.length > 100) {
        metricsRef.current.shift()
      }

      // Log in development
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(
          `[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms (should be <16ms for 60fps)`
        )
      }
    }
  }, [componentName])

  return {
    metrics: metricsRef.current,
    getAverageRenderTime: () => {
      const times = metricsRef.current.map(m => m.renderTime)
      return times.length > 0 ? times.reduce((a, b) => a + b) / times.length : 0
    },
    getMaxRenderTime: () => {
      return Math.max(...metricsRef.current.map(m => m.renderTime), 0)
    }
  }
}