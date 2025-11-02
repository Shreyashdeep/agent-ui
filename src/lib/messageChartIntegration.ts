import { detectChart, stripChartBlocksFromContent } from '@/lib/chartDetection'
import type { ChartMessage } from '@/types/charts'

/**
 * Result of parsing a message for charts
 */
export interface ParsedMessageWithCharts {
  text: string
  charts: ChartMessage[]
  hasCharts: boolean
}

/**
 * Parse a message to extract charts and cleaned text content
 * 
 * Handles:
 * 1. Direct chart payloads (content_type: 'chart')
 * 2. Code block embedded charts (```chart+json)
 * 3. Regular text content
 */
export const parseMessageForCharts = (
  message: unknown
): ParsedMessageWithCharts => {
  const result: ParsedMessageWithCharts = {
    text: '',
    charts: [],
    hasCharts: false
  }

  if (!message || typeof message !== 'object') {
    return result
  }

  const obj = message as Record<string, unknown>

  // Strategy 1: Check for explicit chart content_type
  if (obj.content_type === 'chart' && obj.chart_data) {
    const detection = detectChart(obj, false)
    if (detection.hasChart && detection.chart) {
      result.charts.push(detection.chart)
      result.hasCharts = true
      return result
    }
  }

  // Strategy 2: Extract charts from content field
  if (typeof obj.content === 'string') {
    const content = obj.content

    // Try to find and extract chart blocks
    const chartBlockRegex = /```chart\+json\s*\n([\s\S]*?)\n```/g
    let match
    const foundCharts: ChartMessage[] = []

    while ((match = chartBlockRegex.exec(content)) !== null) {
      if (match[1]) {
        try {
          const chartData = JSON.parse(match[1].trim())
          const detection = detectChart(chartData, false)
          if (detection.hasChart && detection.chart) {
            foundCharts.push(detection.chart)
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }

    if (foundCharts.length > 0) {
      result.charts = foundCharts
      result.hasCharts = true
      // Strip chart blocks from content
      result.text = stripChartBlocksFromContent(content)
    } else {
      result.text = content
    }
  }

  return result
}

/**
 * Extract all charts from a message array
 */
export const extractChartsFromMessages = (
  messages: unknown[]
): ChartMessage[] => {
  const allCharts: ChartMessage[] = []

  for (const msg of messages) {
    const parsed = parseMessageForCharts(msg)
    if (parsed.charts.length > 0) {
      allCharts.push(...parsed.charts)
    }
  }

  return allCharts
}