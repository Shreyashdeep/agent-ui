'use client'

import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { useChartTheme } from '../primitives/useChartTheme'
import { ThemedTooltip } from '../primitives/ChartTooltip'
import { ThemedLegend } from '../primitives/ChartLegend'
import type { ChartMessage } from '@/types/charts'
import { isFunnelChart } from '@/types/charts'

interface FunnelChartVProps {
  chart: ChartMessage
  height?: number
}

/**
 * Funnel Chart Component
 * Renders conversion funnels using a custom BarChart layout
 * Each bar represents a step with decreasing width
 */
export const FunnelChartV: React.FC<FunnelChartVProps> = ({ chart, height = 350 }) => {
  if (!isFunnelChart(chart)) {
    return <div>Invalid chart type for FunnelChartV</div>
  }

  const { colors, isDark } = useChartTheme()
  const {  data, meta } = chart
  const fields = chart.fields as any

  // Calculate percentages for funnel visualization
  const maxValue = useMemo(
    () => Math.max(...data.map((d: any) => d[fields.valuesKey] || 0)),
    [data, fields.valuesKey]
  )

  const transformedData = useMemo(
    () =>
      data.map((item: any, idx: number) => ({
        ...item,
        percentage: ((item[fields.valuesKey] / maxValue) * 100).toFixed(1),
        index: idx
      })),
    [data, fields.valuesKey, maxValue]
  )

  // Color gradient for funnel steps
  const funnelColors = useMemo(() => {
    const defaultColors = [
      colors.primary,
      colors.secondary,
      colors.success,
      colors.warning,
      colors.danger,
      colors.info
    ]
    return defaultColors
  }, [colors])

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={transformedData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.gridStroke}
          horizontal={false}
        />
        <XAxis type="number" />
        <YAxis dataKey={fields.stepsKey} type="category" width={110} />
        <ThemedTooltip
          showUnit={meta.unit}
          formatter={(value: any) => `${value.toLocaleString()}`}
        />

        {/* Render bar for each funnel step */}
        <Bar
          dataKey={fields.valuesKey}
          fill={colors.primary}
          radius={[0, 8, 8, 0]}
          isAnimationActive={false}
        >
          {/* Color each bar differently */}
          {transformedData.map((_, idx) => (
            <Bar
              key={`funnel-step-${idx}`}
              dataKey={fields.valuesKey}
              fill={funnelColors[idx % funnelColors.length]}
              radius={[0, 8, 8, 0]}
              isAnimationActive={false}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}