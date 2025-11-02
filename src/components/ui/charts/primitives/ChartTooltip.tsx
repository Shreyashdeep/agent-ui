'use client'

import React from 'react'
import { Tooltip, TooltipProps } from 'recharts'
import { useChartTheme } from './useChartTheme'

interface ThemedTooltipProps extends Partial<TooltipProps<any, any>> {
  showUnit?: string
}

/**
 * Themed Tooltip component with dark mode support
 */
export const ThemedTooltip: React.FC<ThemedTooltipProps> = ({
  showUnit,
  ...props
}) => {
  const { isDark, colors } = useChartTheme()

  const customLabelStyle = {
    backgroundColor: colors.tooltipBackground,
    border: `1px solid ${colors.tooltipBorder}`,
    borderRadius: '6px',
    color: colors.tooltipText,
    padding: '8px 12px',
    fontSize: '12px'
  }

  return (
    <Tooltip
      contentStyle={customLabelStyle}
      labelStyle={{ color: colors.tooltipText }}
      formatter={(value: any) => {
        if (typeof value === 'number') {
          return [value.toLocaleString(), '']
        }
        return value
      }}
      {...props}
    />
  )
}