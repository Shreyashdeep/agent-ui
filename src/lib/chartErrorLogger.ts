import type { ChartMessage } from '@/types/charts'

/**
 * Chart error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error log entry
 */
export interface ErrorLogEntry {
  timestamp: number
  severity: ErrorSeverity
  message: string
  chart?: Partial<ChartMessage>
  stack?: string
  metadata?: Record<string, any>
}

/**
 * Error logger for charts
 */
export class ChartErrorLogger {
  private logs: ErrorLogEntry[] = []
  private maxLogs = 100

  /**
   * Log an error
   */
  log(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    chart?: Partial<ChartMessage>,
    stack?: string,
    metadata?: Record<string, any>
  ): void {
    const entry: ErrorLogEntry = {
      timestamp: Date.now(),
      severity,
      message,
      chart,
      stack,
      metadata
    }

    this.logs.push(entry)

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const logLevel = severity === ErrorSeverity.CRITICAL ? 'error' : 'warn'
      console[logLevel as 'error' | 'warn'](`[Chart Error] ${message}`, {
        severity,
        chart,
        stack
      })
    }
  }

  /**
   * Get all logged errors
   */
  getLogs(): ErrorLogEntry[] {
    return [...this.logs]
  }

  /**
   * Get errors by severity
   */
  getLogsBySeverity(severity: ErrorSeverity): ErrorLogEntry[] {
    return this.logs.filter((log) => log.severity === severity)
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = []
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    total: number
    bySeverity: Record<ErrorSeverity, number>
  } {
    return {
      total: this.logs.length,
      bySeverity: {
        [ErrorSeverity.LOW]: this.logs.filter((l) => l.severity === ErrorSeverity.LOW).length,
        [ErrorSeverity.MEDIUM]: this.logs.filter((l) => l.severity === ErrorSeverity.MEDIUM).length,
        [ErrorSeverity.HIGH]: this.logs.filter((l) => l.severity === ErrorSeverity.HIGH).length,
        [ErrorSeverity.CRITICAL]: this.logs.filter((l) => l.severity === ErrorSeverity.CRITICAL).length
      }
    }
  }
}

// Singleton instance
export const chartErrorLogger = new ChartErrorLogger()