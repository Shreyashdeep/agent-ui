'use client'

import React from 'react'
import { XAxis, YAxis, XAxisProps, YAxisProps } from 'recharts'
import { useChartTheme } from './useChartTheme'

/**
 * Themed X-Axis component
 */
export const ThemedXAxis: React.FC<Partial<XAxisProps>> = (props) => {
  const { colors } = useChartTheme()

  return (
    <XAxis
      stroke={colors.axisStroke}
      style={{
        fontSize: '12px',
        fill: colors.axisText
      }}
      {...props}
    />
  )
}

/**
 * Themed Y-Axis component
 */
export const ThemedYAxis: React.FC<Partial<YAxisProps>> = (props) => {
  const { colors } = useChartTheme()

  return (
    <YAxis
      stroke={colors.axisStroke}
      style={{
        fontSize: '12px',
        fill: colors.axisText
      }}
      {...props}
    />
  )
}