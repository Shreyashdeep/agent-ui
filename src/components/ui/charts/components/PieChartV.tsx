'use client'

import React, { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { useChartTheme, resolveChartColor } from '../primitives/useChartTheme'
import type { ChartMessage } from '@/types/charts'
import { isPieChart } from '@/types/charts'

interface PieChartVProps {
  chart: ChartMessage
  height?: number
}

/**
 * Pie Chart Component
 * Renders proportional data using Recharts Pie Chart
 */
export const PieChartV: React.FC<PieChartVProps> = ({
  chart,
  height = 350
}) => {
  if (!isPieChart(chart)) {
    return <div>Invalid chart type for PieChartV</div>
  }

  const { colors, isDark } = useChartTheme()
  const { data, meta } = chart
  const fields = chart.fields as any

  // Generate color palette
  const paletteColors = useMemo(() => {
    if (meta.colors && meta.colors.length > 0) {
      return meta.colors.map((c) =>
        resolveChartColor(c, isDark, colors.primary)
      )
    }

    const defaultColors = [
      colors.primary,
      colors.secondary,
      colors.success,
      colors.warning,
      colors.danger,
      colors.info,
      '#06b6d4',
      '#84cc16'
    ]
    return defaultColors
  }, [meta.colors, isDark, colors])

  // Custom label renderer for pie slices
  const renderCustomLabel = (entry: any) => {
    const percent = (
      (entry.value /
        data.reduce((sum: number, d: any) => sum + d[fields.valueKey], 0)) *
      100
    ).toFixed(1)
    return `${percent}%`
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={100}
          fill={colors.primary}
          dataKey={fields.valueKey}
          isAnimationActive={false}
        >
          {/* Render cell for each data point with unique color */}
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={paletteColors[index % paletteColors.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: colors.tooltipBackground,
            border: `1px solid ${colors.tooltipBorder}`,
            borderRadius: '6px',
            color: colors.tooltipText
          }}
          formatter={(value: any) => value.toLocaleString()}
          labelFormatter={(label) => `${label}`}
        />
        {meta.legend !== false && <Legend verticalAlign="bottom" height={36} />}
      </PieChart>
    </ResponsiveContainer>
  )
}
