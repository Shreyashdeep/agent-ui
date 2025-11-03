/**
 * Dynamic import utilities to keep bundle size low
 */

/**
 * Get approximate size of data structure
 */
export const getApproximateSize = (obj: any): number => {
  if (obj === null || obj === undefined) return 0

  const objList: any[] = []
  const stack: any[] = [obj]
  let bytes = 0

  while (stack.length) {
    const value = stack.pop()

    if (typeof value === 'boolean') {
      bytes += 4
    } else if (typeof value === 'string') {
      bytes += value.length * 2
    } else if (typeof value === 'number') {
      bytes += 8
    } else if (typeof value === 'object' && objList.indexOf(value) === -1) {
      objList.push(value)

      for (const prop in value) {
        if (value.hasOwnProperty(prop)) {
          stack.push(value[prop])
        }
      }
    }
  }

  return bytes
}

/**
 * Format bytes to human readable
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Warn if data structure is too large
 */
export const warnIfLargeData = (
  name: string,
  data: any,
  limitBytes: number = 1024 * 1024 // 1MB
): void => {
  const size = getApproximateSize(data)

  if (size > limitBytes) {
    console.warn(
      `[Performance] ${name} is large: ${formatBytes(size)} (limit: ${formatBytes(limitBytes)})`
    )
  }
}