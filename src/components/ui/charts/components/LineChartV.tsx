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
import { AccessibleLegend } from '../primitives/AccessibleLegend'
import { AccessibleTooltip } from '../primitives/AccessibleTooltip'
import { AccessibleChartLabel } from '../primitives/AccessibleChartLabel'
// import type { ChartMessage } from '@/types/chart'
// import { isLineChart } from '@/types/chart'

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

  const chartId = `line-chart-${chart.id || 'default'}`

return (
  <AccessibleChartLabel
    id={chartId}
    title={chart.meta.title}
    description={chart.meta.a11y?.description}
  >
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
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
          dataKey={fields.xKey}
          label={meta.xLabel ? { value: meta.xLabel, position: 'insideBottomRight', offset: -5 } : undefined}
          aria-label={`${meta.xLabel || 'X-axis'}: ${fields.xKey}`}
        />
        <ThemedYAxis
          label={meta.yLabel ? { value: meta.yLabel, angle: -90, position: 'insideLeft' } : undefined}
          aria-label={`${meta.yLabel || 'Y-axis'}: values`}
        />
        <AccessibleTooltip showUnit={meta.unit} ariaLabel={`Data for ${meta.title}`} />
        {meta.legend !== false && <AccessibleLegend />}

        {/* Render each series as a Line */}
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
