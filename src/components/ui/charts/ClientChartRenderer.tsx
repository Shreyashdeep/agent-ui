'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import type { ChartMessage } from '@/types/charts'

/**
 * Dynamically imported chart renderer with SSR disabled
 * Prevents hydration mismatches and ensures client-side rendering
 */
const SafeChartRenderer = dynamic(
  () =>
    import('./SafeChartRenderer').then((mod) => ({
      default: mod.SafeChartRenderer
    })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" style={{ height: '400px' }} />
    )
  }
)

interface ClientChartRendererProps {
  chart: ChartMessage | unknown
  height?: number
  className?: string
  showDebugInfo?: boolean
}

/**
 * Client-only chart renderer
 * Safe to use anywhere, handles SSR automatically
 */
export const ClientChartRenderer: React.FC<ClientChartRendererProps> = (props) => {
  return <SafeChartRenderer {...props} />
}

export default ClientChartRenderer