import { ChartMessage, validateChartMessage, isChartMessage } from '@/types/charts'
import { RunResponseContent } from '@/types/os'

/**
 * Result of attempting to detect and parse a chart from a message
 */
export interface ChartDetectionResult {
  hasChart: boolean
  chart?: ChartMessage
  error?: string
  source: 'content_type' | 'code_block' | 'keyword' | 'none'
}

/**
 * Strategy 1: Detect charts from explicit content_type field
 * 
 * Checks if the response has content_type: "chart" and chart_data payload
 * This is the PRIMARY method - most reliable
 */
export const detectChartFromContentType = (
  data: unknown
): ChartDetectionResult => {
  if (!data || typeof data !== 'object') {
    return {
      hasChart: false,
      source: 'none'
    }
  }

  const obj = data as Record<string, unknown>

  // Check if content_type field explicitly marks this as a chart
  if (obj.content_type === 'chart' && obj.chart_data) {
    const validationResult = validateChartMessage(obj.chart_data)
    
    if (validationResult.valid) {
      return {
        hasChart: true,
        chart: validationResult.data,
        source: 'content_type'
      }
    } else {
      return {
        hasChart: false,
        error: `Invalid chart data: ${validationResult.errors.join(', ')}`,
        source: 'content_type'
      }
    }
  }

  return {
    hasChart: false,
    source: 'none'
  }
}

/**
 * Strategy 2: Detect and parse fenced code blocks with ```chart+json marker
 * 
 * Looks for blocks like:
 * ```chart+json
 * { ...chart payload... }
 * ```
 */
export const detectChartFromCodeBlock = (
  content: string | null | undefined
): ChartDetectionResult => {
  if (!content || typeof content !== 'string') {
    return {
      hasChart: false,
      source: 'none'
    }
  }

  // Match code blocks with chart+json marker
  const chartBlockRegex = /```chart\+json\s*\n([\s\S]*?)\n```/g
  let match

  // Try to find and parse first matching chart block
  const regex = /```chart\+json\s*\n([\s\S]*?)\n```/
  match = regex.exec(content)

  if (!match || !match[1]) {
    return {
      hasChart: false,
      source: 'none'
    }
  }

  try {
    const jsonStr = match[1].trim()
    const chartData = JSON.parse(jsonStr)
    const validationResult = validateChartMessage(chartData)

    if (validationResult.valid) {
      return {
        hasChart: true,
        chart: validationResult.data,
        source: 'code_block'
      }
    } else {
      return {
        hasChart: false,
        error: `Invalid chart in code block: ${validationResult.errors.join(', ')}`,
        source: 'code_block'
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    return {
      hasChart: false,
      error: `Failed to parse chart code block: ${errorMsg}`,
      source: 'code_block'
    }
  }
}

/**
 * Strategy 3: Fallback - Keyword-based heuristic detection
 * 
 * OPTIONAL: Only use this if backend doesn't properly mark charts
 * Looks for common visualization keywords + JSON-like structure
 * Returns null if no chart is found (doesn't force a chart)
 */
export const detectChartFromKeywords = (
  content: string | null | undefined,
  data: unknown
): ChartDetectionResult => {
  if (!content || typeof content !== 'string') {
    return {
      hasChart: false,
      source: 'none'
    }
  }

  // Chart-intent keywords
  const chartKeywords = ['chart', 'graph', 'plot', 'visualize', 'visualization', 'diagram']
  const contentLower = content.toLowerCase()

  // Check if content mentions charts
  const hasChartKeyword = chartKeywords.some(keyword => contentLower.includes(keyword))

  if (!hasChartKeyword) {
    return {
      hasChart: false,
      source: 'none'
    }
  }

  // If keywords found, try to extract JSON-like structures
  // Look for objects that might be chart data
  const jsonRegex = /\{[\s\S]*?\}/
  const jsonMatch = jsonRegex.exec(content)

  if (!jsonMatch) {
    return {
      hasChart: false,
      source: 'none'
    }
  }

  try {
    const potentialChart = JSON.parse(jsonMatch[0])
    const validationResult = validateChartMessage(potentialChart)

    if (validationResult.valid) {
      return {
        hasChart: true,
        chart: validationResult.data,
        source: 'keyword'
      }
    }
  } catch {
    // Not a valid chart, skip
  }

  return {
    hasChart: false,
    source: 'none'
  }
}

/**
 * Main detection function - tries all strategies in order
 * 
 * Priority order:
 * 1. content_type field (explicit marker) - MOST RELIABLE
 * 2. chart+json code block - RECOMMENDED
 * 3. Keyword heuristic - FALLBACK (optional)
 */
export const detectChart = (
  data: unknown,
  enableKeywordFallback: boolean = false
): ChartDetectionResult => {
  // Strategy 1: Try content_type detection first
  const contentTypeResult = detectChartFromContentType(data)
  if (contentTypeResult.hasChart) {
    return contentTypeResult
  }

  // Strategy 2: Try code block detection
  if (typeof data === 'object' && data !== null && 'content' in data) {
    const content = (data as Record<string, unknown>).content
    if (typeof content === 'string') {
      const codeBlockResult = detectChartFromCodeBlock(content)
      if (codeBlockResult.hasChart) {
        return codeBlockResult
      }
    }
  }

  // Strategy 3: Try keyword heuristic (optional, disabled by default)
  if (enableKeywordFallback && typeof data === 'object' && data !== null && 'content' in data) {
    const content = (data as Record<string, unknown>).content
    const keywordResult = detectChartFromKeywords(
      typeof content === 'string' ? content : null,
      data
    )
    if (keywordResult.hasChart) {
      return keywordResult
    }
  }

  return {
    hasChart: false,
    source: 'none'
  }
}

/**
 * Strip chart blocks from content if they were detected
 * Use this to remove chart blocks from markdown rendering
 */
export const stripChartBlocksFromContent = (content: string): string => {
  return content.replace(/```chart\+json\s*\n[\s\S]*?\n```\n?/g, '').trim()
}

/**
 * Extract all chart blocks from content (can have multiple)
 */
export const extractAllChartBlocks = (content: string): ChartMessage[] => {
  const chartBlockRegex = /```chart\+json\s*\n([\s\S]*?)\n```/g
  const charts: ChartMessage[] = []
  let match

  while ((match = chartBlockRegex.exec(content)) !== null) {
    if (match[1]) {
      try {
        const chartData = JSON.parse(match[1].trim())
        const validationResult = validateChartMessage(chartData)
        if (validationResult.valid) {
          charts.push(validationResult.data)
        }
      } catch {
        // Skip invalid JSON blocks
      }
    }
  }

  return charts
}