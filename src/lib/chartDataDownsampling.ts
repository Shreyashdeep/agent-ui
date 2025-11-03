import type { ChartMessage } from '@/types/charts'

/**
 * Downsampling strategies for large datasets
 */

/**
 * Largest-Triangle-Three-Buckets algorithm
 * Reduces dataset while preserving visual shape
 */
export const downsampleLTTB = (
  data: Record<string, any>[],
  threshold: number
): Record<string, any>[] => {
  if (data.length <= threshold) return data

  const bucketSize = (data.length - 2) / (threshold - 2)
  const downsampled: Record<string, any>[] = [data[0]]

  for (let i = 0; i < threshold - 2; i++) {
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1
    const avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1
    const avgRangeLength = avgRangeEnd - avgRangeStart

    let avgX = 0
    let avgY = 0

    for (let j = avgRangeStart; j < avgRangeEnd && j < data.length; j++) {
      avgX += j
      avgY += Object.values(data[j]).reduce((a: any, b: any) => {
        return typeof b === 'number' ? a + b : a
      }, 0) / Object.keys(data[j]).length
    }

    avgX /= avgRangeLength
    avgY /= avgRangeLength

    const rangeStart = Math.floor(i * bucketSize) + 1
    const rangeEnd = Math.floor((i + 1) * bucketSize) + 1

    let maxArea = -1
    let maxAreaPoint = -1

    for (let j = rangeStart; j < rangeEnd && j < data.length; j++) {
      const area =
        Math.abs(
          (downsampled[downsampled.length - 1] as any).x * (avgY - Object.values(data[j])[0]) +
          avgX * (Object.values(data[j])[0] - (downsampled[downsampled.length - 1] as any).y) +
          j * ((downsampled[downsampled.length - 1] as any).y - avgY)
        ) * 0.5

      if (area > maxArea) {
        maxArea = area
        maxAreaPoint = j
      }
    }

    if (maxAreaPoint !== -1) {
      downsampled.push(data[maxAreaPoint])
    }
  }

  downsampled.push(data[data.length - 1])
  return downsampled
}

/**
 * Simple uniform sampling - take every nth point
 */
export const downsampleUniform = (
  data: Record<string, any>[],
  maxPoints: number
): Record<string, any>[] => {
  if (data.length <= maxPoints) return data

  const step = Math.ceil(data.length / maxPoints)
  return data.filter((_, i) => i % step === 0)
}

/**
 * Downsample chart data if exceeds threshold
 */
export const downsampleChartIfNeeded = (
  chart: ChartMessage,
  maxDataPoints: number = 1000
): ChartMessage => {
  if (chart.data.length <= maxDataPoints) {
    return chart
  }

  // Use LTTB algorithm for better quality
  const downsampled = downsampleLTTB(chart.data, maxDataPoints)

  console.warn(
    `[Performance] Downsampled chart from ${chart.data.length} to ${downsampled.length} points`
  )

  return {
    ...chart,
    data: downsampled,
    meta: {
      ...chart.meta,
      notes: `${chart.meta.notes || ''} (Downsampled from ${chart.data.length} points for performance)`
    }
  }
}

/**
 * Check if chart should be downsampled
 */
export const shouldDownsample = (chart: ChartMessage): boolean => {
  return chart.data.length > 1000
}