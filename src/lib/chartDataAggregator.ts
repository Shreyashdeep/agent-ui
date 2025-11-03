import type { ChartMessage } from '@/types/charts'

/**
 * Aggregates data updates for charts, handles streaming scenarios
 * Useful for combining multiple append operations
 */
export class ChartDataAggregator {
  private buffer: Record<string, any[]> = {}
  private flushInterval: number = 500 // ms
  private timers: Map<string, NodeJS.Timeout> = new Map()

  /**
   * Buffer data rows and flush periodically
   */
  bufferData(chartId: string, rows: Record<string, any>[]): void {
    if (!this.buffer[chartId]) {
      this.buffer[chartId] = []
    }

    this.buffer[chartId].push(...rows)

    // Reset timer for this chart
    if (this.timers.has(chartId)) {
      clearTimeout(this.timers.get(chartId)!)
    }

    const timer = setTimeout(() => {
      this.buffer[chartId] = []
      this.timers.delete(chartId)
    }, this.flushInterval)

    this.timers.set(chartId, timer)
  }

  /**
   * Get buffered data and clear
   */
  getAndClearBuffer(chartId: string): Record<string, any>[] {
    const data = this.buffer[chartId] || []
    this.buffer[chartId] = []
    return data
  }

  /**
   * Get buffered data without clearing
   */
  getBuffer(chartId: string): Record<string, any>[] {
    return this.buffer[chartId] || []
  }

  /**
   * Check if data is buffered for chart
   */
  hasBufferedData(chartId: string): boolean {
    return (this.buffer[chartId] || []).length > 0
  }

  /**
   * Clear all buffers
   */
  clearAll(): void {
    Object.keys(this.timers).forEach(key => {
      clearTimeout(this.timers.get(key)!)
    })
    this.buffer = {}
    this.timers.clear()
  }
}