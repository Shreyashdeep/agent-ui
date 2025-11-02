'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { ChartMessage } from '@/types/charts'
import {
  isLineChart,
  isBarChart,
  isPieChart,
  isAreaChart,
  isFunnelChart,
  isRetentionChart
} from '@/types/charts'
import { ChartContainer } from './primitives/ChartContainer'

/**
 * Dynamic imports with SSR disabled
 * This prevents hydration mismatches with Recharts
 */
const LineChartV = dynamic(
  () => import('./components/LineChartV').then(mod => ({ default: mod.LineChartV })),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-gray-200 rounded" /> }
)

const BarChartV = dynamic(
  () => import('./components/BarChartV').then(mod => ({ default: mod.BarChartV })),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-gray-200 rounded" /> }
)

const PieChartV = dynamic(
  () => import('./components/PieChartV').then(mod => ({ default: mod.PieChartV })),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-gray-200 rounded" /> }
)

const AreaChartV = dynamic(
  () => import('./components/AreaChartV').then(mod => ({ default: mod.AreaChartV })),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-gray-200 rounded" /> }
)

const FunnelChartV = dynamic(
  () => import('./components/FunnelChartV').then(mod => ({ default: mod.FunnelChartV })),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-gray-200 rounded" /> }
)

const RetentionChartV = dynamic(
  () => import('./components/RetentionChartV').then(mod => ({ default: mod.RetentionChartV })),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-gray-200 rounded" /> }
)

interface ChartRendererProps {
  chart: ChartMessage
  height?: number
  className?: string
}

/**
 * Main chart renderer component
 * Dispatches to specific chart type based on chart.type
 * 
 * Usage:
 * <ChartRenderer chart={validatedChartMessage} height={400} />
 */
export const ChartRenderer: React.FC<ChartRendererProps> = ({
  chart,
  height = 400,
  className = ''
}) => {
  // Render appropriate component based on chart type
  const renderChart = useMemo(() => {
    switch (chart.type) {
      case 'line':
        return isLineChart(chart) ? (
          <LineChartV chart={chart} height={height} />
        ) : null

      case 'bar':
        return isBarChart(chart) ? (
          <BarChartV chart={chart} height={height} />
        ) : null

      case 'pie':
        return isPieChart(chart) ? (
          <PieChartV chart={chart} height={height} />
        ) : null

      case 'area':
        return isAreaChart(chart) ? (
          <AreaChartV chart={chart} height={height} />
        ) : null

      case 'funnel':
        return isFunnelChart(chart) ? (
          <FunnelChartV chart={chart} height={height} />
        ) : null

      case 'retention':
        return isRetentionChart(chart) ? (
          <RetentionChartV chart={chart} height={height} />
        ) : null

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            Unsupported chart type: {(chart as any).type}
          </div>
        )
    }
  }, [chart, height])

  return (
    <ChartContainer
      title={chart.meta.title}
      height={height}
      className={className}
    >
      {renderChart}
    </ChartContainer>
  )
}

export default ChartRenderer