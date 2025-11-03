import { ChartMessage, validateChartMessage } from '@/types/charts'

/**
 * Processes chart updates from streaming responses
 * Handles replace, append, patch operations
 */
export class ChartStreamProcessor {
  private charts: Map<string, ChartMessage> = new Map()

  /**
   * Process a chart update from stream
   */
  processUpdate(
    update: Partial<ChartMessage> & { id?: string; operation?: string }
  ): { success: boolean; error?: string; chart?: ChartMessage } {
    const chartId = update.id || 'default'
    const operation = (update.operation || 'replace') as 'replace' | 'append' | 'patch'

    try {
      switch (operation) {
        case 'replace':
          return this.handleReplace(chartId, update)
        case 'append':
          return this.handleAppend(chartId, update)
        case 'patch':
          return this.handlePatch(chartId, update)
        default:
          return { success: false, error: `Unknown operation: ${operation}` }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: `Failed to process update: ${errorMsg}` }
    }
  }

  /**
   * Handle replace operation - replace entire chart
   */
  private handleReplace(
    chartId: string,
    update: Partial<ChartMessage>
  ): { success: boolean; error?: string; chart?: ChartMessage } {
    const validation = validateChartMessage(update)

    if (!validation.valid) {
      return {
        success: false,
        error: `Chart validation failed: ${validation.errors.join(', ')}`
      }
    }

    this.charts.set(chartId, validation.data)
    console.log(`[ChartStream] Chart ${chartId} replaced`)

    return { success: true, chart: validation.data }
  }

  /**
   * Handle append operation - add rows to existing chart data
   */
  private handleAppend(
    chartId: string,
    update: Partial<ChartMessage>
  ): { success: boolean; error?: string; chart?: ChartMessage } {
    const currentChart = this.charts.get(chartId)

    if (!currentChart) {
      return {
        success: false,
        error: `Chart ${chartId} not found for append operation`
      }
    }

    if (!update.data || !Array.isArray(update.data)) {
      return {
        success: false,
        error: 'Append operation requires data array'
      }
    }

    const appendedChart: ChartMessage = {
      ...currentChart,
      data: [...currentChart.data, ...update.data]
    }

    const validation = validateChartMessage(appendedChart)

    if (!validation.valid) {
      return {
        success: false,
        error: `Appended chart validation failed: ${validation.errors.join(', ')}`
      }
    }

    this.charts.set(chartId, validation.data)
    console.log(`[ChartStream] Chart ${chartId} appended with ${update.data.length} rows`)

    return { success: true, chart: validation.data }
  }

  /**
   * Handle patch operation - update specific fields
   */
  private handlePatch(
    chartId: string,
    update: Partial<ChartMessage>
  ): { success: boolean; error?: string; chart?: ChartMessage } {
    const currentChart = this.charts.get(chartId)

    if (!currentChart) {
      return {
        success: false,
        error: `Chart ${chartId} not found for patch operation`
      }
    }

    const patchedChart: ChartMessage = {
      ...currentChart,
      ...update,
      meta: { ...currentChart.meta, ...(update.meta || {}) },
      fields: { ...currentChart.fields, ...(update.fields || {}) }
    }

    const validation = validateChartMessage(patchedChart)

    if (!validation.valid) {
      return {
        success: false,
        error: `Patched chart validation failed: ${validation.errors.join(', ')}`
      }
    }

    this.charts.set(chartId, validation.data)
    console.log(`[ChartStream] Chart ${chartId} patched`)

    return { success: true, chart: validation.data }
  }

  /**
   * Get chart by ID
   */
  getChart(chartId: string): ChartMessage | undefined {
    return this.charts.get(chartId)
  }

  /**
   * Get all charts
   */
  getAllCharts(): ChartMessage[] {
    return Array.from(this.charts.values())
  }

  /**
   * Clear all charts
   */
  clear(): void {
    this.charts.clear()
  }
}