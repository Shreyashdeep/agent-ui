'use client'

import React from 'react'
import { Legend, LegendProps } from 'recharts'
import { useChartTheme } from './useChartTheme'

/**
 * Accessible legend with ARIA roles and semantic structure
 */
export const AccessibleLegend: React.FC<Partial<LegendProps>> = (props) => {
  const { isDark, colors } = useChartTheme()

  return (
    <div role="region" aria-label="Chart legend">
      <Legend
        wrapperStyle={{
          color: colors.legendText,
          paddingTop: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px'
        }}
        {...props}
      />
    </div>
  )
}