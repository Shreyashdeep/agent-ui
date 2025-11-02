'use client'

import React from 'react'
import { Legend, LegendProps } from 'recharts'
import { useChartTheme } from './useChartTheme'

/**
 * Themed Legend component
 */
export const ThemedLegend: React.FC<Partial<LegendProps>> = (props) => {
  const { isDark, colors } = useChartTheme()

  return (
    <Legend
      wrapperStyle={{
        color: colors.legendText,
        paddingTop: '16px'
      }}
      {...props}
    />
  )
}