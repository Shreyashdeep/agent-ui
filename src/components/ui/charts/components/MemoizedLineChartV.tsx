'use client'

import React, { memo, useMemo } from 'react'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useChartTheme, resolveChartColor } from '../primitives/useChartTheme'
import { ThemedXAxis, ThemedYAxis } from '../primitives/ChartAxis'
import { AccessibleTooltip } from '../primitives/AccessibleTooltip'
import { AccessibleLegend } from '../primitives/AccessibleLegend'
import { AccessibleChartLabel } from '../primitives/AccessibleChartLabel'
import type { ChartMessage } from '@/types/charts'
import { isLineChart } from '@/types/charts'
import { useMemoizedColors, useMemoizedChartData } from '@/lib/memoization'

interface MemoizedLineChartVProps {
  chart: ChartMessage
  height?: number
}

/**
 * Memoized Line Chart Component
 * Prevents unnecessary re-renders through React.memo
 * and memoized data calculations
 */
const MemoizedLineChartVComponent: React.FC<MemoizedLineChartVProps> = ({
  chart,
  height = 350
}) => {
  if (!isLineChart(chart)) {
    return <div>Invalid chart type for LineChartV</div>
  }

  const { colors, isDark } = useChartTheme()
  const { fields, meta } = chart

  // Type assertion
  const fieldsCast = chart.fields as any

  // Memoize data (prevents re-processing on every render)
  const memoizedData = useMemoizedChartData(chart.data, undefined, 5000)

  // Memoize colors calculation
  const seriesColors = useMemoizedColors(
    fieldsCast.series,
    [
      colors.primary,
      colors.secondary,
      colors.success,
      colors.warning,
      colors.danger,
      colors.info
    ]
  )

  const chartId = `line-chart-${chart.id || 'default'}`

  return (
    <AccessibleChartLabel
      id={chartId}
      title={chart.meta.title}
      description={chart.meta.a11y?.description}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={memoizedData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          aria-label={chart.meta.a11y?.alt}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.gridStroke}
            vertical={false}
            aria-hidden="true"
          />
          <ThemedXAxis
            dataKey={fieldsCast.xKey}
            label={meta.xLabel ? { value: meta.xLabel, position: 'insideBottomRight', offset: -5 } : undefined}
            aria-label={`${meta.xLabel || 'X-axis'}: ${fieldsCast.xKey}`}
          />
          <ThemedYAxis
            label={meta.yLabel ? { value: meta.yLabel, angle: -90, position: 'insideLeft' } : undefined}
            aria-label={`${meta.yLabel || 'Y-axis'}: values`}
          />
          <AccessibleTooltip showUnit={meta.unit} ariaLabel={`Data for ${meta.title}`} />
          {meta.legend !== false && <AccessibleLegend />}

          {fieldsCast.series.map((series: any, idx: number) => (
            <Line
              key={series.key}
              type="monotone"
              dataKey={series.key}
              name={series.label}
              stroke={seriesColors[idx]}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls
              aria-label={series.label}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </AccessibleChartLabel>
  )
}

// Memoize the component to prevent re-renders if props haven't changed
export const MemoizedLineChartV = memo(MemoizedLineChartVComponent, (prevProps, nextProps) => {
  // Custom comparison: only re-render if chart data actually changed
  return (
    prevProps.height === nextProps.height &&
    prevProps.chart.id === nextProps.chart.id &&
    prevProps.chart.data === nextProps.chart.data &&
    prevProps.chart.meta === nextProps.chart.meta
  )
})

MemoizedLineChartV.displayName = 'MemoizedLineChartV'