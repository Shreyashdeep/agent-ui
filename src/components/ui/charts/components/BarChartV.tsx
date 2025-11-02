'use client'

import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { useChartTheme, resolveChartColor } from '../primitives/useChartTheme'
import { ThemedXAxis, ThemedYAxis } from '../primitives/ChartAxis'
import { ThemedTooltip } from '../primitives/ChartTooltip'
import { ThemedLegend } from '../primitives/ChartLegend'
import type { ChartMessage } from '@/types/charts'
import { isBarChart } from '@/types/charts'

interface BarChartVProps {
  chart: ChartMessage
  height?: number
}

/**
 * Bar Chart Component
 * Renders categorical comparisons using Recharts Bar Chart
 */
export const BarChartV: React.FC<BarChartVProps> = ({ chart, height = 350 }) => {
  if (!isBarChart(chart)) {
    return <div>Invalid chart type for BarChartV</div>
  }

  const { colors, isDark } = useChartTheme()
  const { data, meta } = chart

  interface SeriesField {
    key: string
    label?: string
    color?: string
  }

  interface BarChartFields {
    xKey: string
    series: SeriesField[]
  }

  const fields = chart.fields as BarChartFields

  // Memoize colors for each series
  const seriesColors = useMemo(
    () =>
      fields.series.map((series, idx) => {
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
      <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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

        {/* Render each series as a Bar */}
        {fields.series.map((series, idx) => (
          <Bar
            key={series.key}
            dataKey={series.key}
            name={series.label}
            fill={seriesColors[idx]}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}