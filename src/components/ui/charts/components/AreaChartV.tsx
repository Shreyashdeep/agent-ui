'use client'

import React, { useMemo } from 'react'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { useChartTheme, resolveChartColor } from '../primitives/useChartTheme'
import { ThemedXAxis, ThemedYAxis } from '../primitives/ChartAxis'
import { ThemedTooltip } from '../primitives/ChartTooltip'
import { ThemedLegend } from '../primitives/ChartLegend'
import type { ChartMessage } from '@/types/charts'
import { isAreaChart } from '@/types/charts'

interface AreaChartVProps {
  chart: ChartMessage
  height?: number
}

/**
 * Area Chart Component
 * Renders cumulative/stacked data using Recharts Area Chart
 */
export const AreaChartV: React.FC<AreaChartVProps> = ({ chart, height = 350 }) => {
  if (!isAreaChart(chart)) {
    return <div>Invalid chart type for AreaChartV</div>
  }

  const { colors, isDark } = useChartTheme()
  const { data, meta } = chart
  
  // Type assertion for fields after isAreaChart type guard
  // This is safe because isAreaChart ensures fields.series exists
  type AreaSeries = { key: string; label?: string; color?: string }
  type AreaFields = { xKey: string; series: AreaSeries[] }
  const fields = chart.fields as AreaFields

  // Memoize colors for each series
  const seriesColors = useMemo(
    () =>
      fields.series.map((series: AreaSeries, idx: number) => {
        const defaultColors = [
          colors.primary,
          colors.secondary,
          colors.success,
          colors.warning,
          colors.danger,
          colors.info
        ]
        return resolveChartColor(
          series.color,
          isDark,
          defaultColors[idx % defaultColors.length]
        )
      }),
    [fields.series, colors, isDark]
  )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <defs>
          {/* Define gradients for areas */}
          {fields.series.map((series, idx) => (
            <linearGradient key={`gradient-${idx}`} id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={seriesColors[idx]} stopOpacity={0.8} />
              <stop offset="95%" stopColor={seriesColors[idx]} stopOpacity={0.1} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.gridStroke}
          vertical={false}
        />
        <ThemedXAxis
          dataKey={fields.xKey}
          label={meta.xLabel ? { value: meta.xLabel, position: 'insideBottomRight', offset: -5 } : undefined}
        />
        <ThemedYAxis
          label={meta.yLabel ? { value: meta.yLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <ThemedTooltip showUnit={meta.unit} />
        {meta.legend !== false && <ThemedLegend />}

        {/* Render each series as a stacked Area */}
        {fields.series.map((series, idx) => (
          <Area
            key={series.key}
            type="monotone"
            dataKey={series.key}
            name={series.label}
            stroke={seriesColors[idx]}
            fill={`url(#gradient-${idx})`}
            isAnimationActive={false}
            stackId="stack"
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}