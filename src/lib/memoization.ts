import { useMemo, useRef, useCallback } from 'react'

/**
 * Deep equality check for objects
 * Used to determine if memoization should skip re-computation
 */
export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true

  if (a == null || b == null) return a === b

  if (typeof a !== 'object' || typeof b !== 'object') return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual(a[key], b[key])) return false
  }

  return true
}

/**
 * Hook to memoize complex dataset transformations
 */
export const useMemoizedDataset = <T, R>(
  data: T,
  transform: (data: T) => R,
  dependencies?: any[]
): R => {
  const prevDataRef = useRef<T>(data)
  const prevResultRef = useRef<R | undefined>(undefined)

  // Use provided dependencies or deep equality check
  const shouldRecompute = dependencies
    ? false // Will be checked by useMemo
    : !deepEqual(prevDataRef.current, data)

  return useMemo(() => {
    if (shouldRecompute || dependencies) {
      prevDataRef.current = data
      prevResultRef.current = transform(data)
    }

    return prevResultRef.current!
  }, dependencies ? dependencies : [data])
}

/**
 * Hook for memoizing color calculations
 */
export const useMemoizedColors = (
  series: Array<{ key: string; label: string; color?: string }>,
  defaultColors: string[]
) => {
  return useMemo(() => {
    return series.map((s, idx) => s.color || defaultColors[idx % defaultColors.length])
  }, [series, defaultColors])
}

/**
 * Memoize expensive computations for chart data
 */
export const useMemoizedChartData = (
  data: Record<string, any>[],
  filter?: (item: any) => boolean,
  limit?: number
) => {
  return useMemo(() => {
    let processed = data

    if (filter) {
      processed = processed.filter(filter)
    }

    if (limit && processed.length > limit) {
      // Downsample large datasets
      const step = Math.ceil(processed.length / limit)
      processed = processed.filter((_, i) => i % step === 0)
    }

    return processed
  }, [data, filter, limit])
}