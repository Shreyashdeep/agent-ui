'use client'

import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { useChartTheme, resolveChartColor } from '../primitives/useChartTheme'
import { ThemedXAxis, ThemedYAxis } from '../primitives/ChartAxis'
import { ThemedTooltip } from '../primitives/ChartTooltip'
import { ThemedLegend } from '../primitives/ChartLegend'
import type { ChartMessage } from '@/types/charts'
import { isLineChart } from '@/types/charts'

interface LineChartVProps {
  chart: ChartMessage
  height?: number
}

/**
 * Line Chart Component
 * Renders time-series or continuous data using Recharts Line Chart
 */
export const LineChartV: React.FC<LineChartVProps> = ({
  chart,
  height = 350
}) => {
  if (!isLineChart(chart)) {
    return <div>Invalid chart type for LineChartV</div>
  }

  const { colors, isDark } = useChartTheme()
  const { data, meta } = chart
  type SeriesField = { key: string; label?: string; color?: string }
  type LineChartFields = { xKey: string; series: SeriesField[] }
  const fields = chart.fields as LineChartFields

  // Memoize colors for each series
  const seriesColors = useMemo(
    () =>
      fields.series.map((series: SeriesField, idx: number) => {
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
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.gridStroke}
          vertical={false}
        />
        <ThemedXAxis
          dataKey={fields.xKey}
          label={
            meta.xLabel
              ? {
                  value: meta.xLabel,
                  position: 'insideBottomRight',
                  offset: -5
                }
              : undefined
          }
        />
        <ThemedYAxis
          label={
            meta.yLabel
              ? { value: meta.yLabel, angle: -90, position: 'insideLeft' }
              : undefined
          }
        />
        <ThemedTooltip showUnit={meta.unit} />
        {meta.legend !== false && <ThemedLegend />}

        {/* Render each series as a Line */}
        {fields.series.map((series, idx) => (
          <Line
            key={series.key}
            type="monotone"
            dataKey={series.key}
            name={series.label}
            stroke={seriesColors[idx]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
