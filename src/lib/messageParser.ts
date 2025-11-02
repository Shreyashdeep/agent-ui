import { detectChart, stripChartBlocksFromContent } from '@/lib/chartDetection'
import type { ChartMessage } from '@/types/charts'

/**
 * Represents a parsed message that may contain text and/or charts
 */
export interface ParsedMessage {
  text: string
  charts: ChartMessage[]
  hasContent: boolean
}

/**
 * Parse a complete message to extract charts and cleaned text
 * 
 * Usage:
 * const parsed = parseMessage(messageData)
 * if (parsed.charts.length > 0) {
 *   // Render charts
 * }
 * if (parsed.text) {
 *   // Render text/markdown
 * }
 */
export const parseMessage = (message: unknown): ParsedMessage => {
  const result: ParsedMessage = {
    text: '',
    charts: [],
    hasContent: false
  }

  if (!message || typeof message !== 'object') {
    return result
  }

  const obj = message as Record<string, unknown>

  // Strategy 1: Check for explicit chart content_type
  if (obj.content_type === 'chart' && obj.chart_data) {
    const { detectChart } = require('@/lib/chartDetection')
    const detection = detectChart(obj, false)
    if (detection.hasChart && detection.chart) {
      result.charts.push(detection.chart)
      result.hasContent = true
      return result
    }
  }

  // Strategy 2: Check content field for code blocks and text
  if (typeof obj.content === 'string') {
    const content = obj.content
    
    // Extract all chart blocks
    const { extractAllChartBlocks } = require('@/lib/chartDetection')
    const charts = extractAllChartBlocks(content)
    result.charts = charts

    // Remove chart blocks from content to get clean text
    if (charts.length > 0) {
      result.text = stripChartBlocksFromContent(content)
    } else {
      result.text = content
    }

    result.hasContent = result.text.length > 0 || result.charts.length > 0
  }

  return result
}

/**
 * Process multiple messages and accumulate charts
 */
export const parseMessages = (messages: unknown[]): ParsedMessage => {
  const combined: ParsedMessage = {
    text: '',
    charts: [],
    hasContent: false
  }

  for (const msg of messages) {
    const parsed = parseMessage(msg)
    
    if (parsed.text) {
      combined.text += (combined.text ? '\n' : '') + parsed.text
    }
    
    if (parsed.charts.length > 0) {
      combined.charts.push(...parsed.charts)
    }

    combined.hasContent = combined.hasContent || parsed.hasContent
  }

  return combined
}