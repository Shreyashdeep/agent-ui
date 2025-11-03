/**
 * Throttle function calls to prevent excessive updates
 * Useful for stream updates and event handlers
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  let lastRan: number
  let lastFunc: NodeJS.Timeout

  return function (this: any, ...args: Parameters<T>) {
    const context = this
    if (!lastRan) {
      func.apply(context, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

/**
 * Debounce function calls
 * Waits until calls stop for specified duration
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Request idle callback wrapper with fallback
 * Schedules work when browser is idle
 */
export const scheduleIdleTask = (callback: () => void): void => {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback)
  } else {
    setTimeout(callback, 0)
  }
}

/**
 * Request animation frame wrapper for smooth updates
 */
export const scheduleAnimationFrame = (callback: () => void): void => {
  if ('requestAnimationFrame' in window) {
    (window as any).requestAnimationFrame(callback)
  } else {
    setTimeout(callback, 16) // ~60fps
  }
}