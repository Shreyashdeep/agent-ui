'use client'

import React from 'react'
import { Tooltip as RechartsTooltip, TooltipProps } from 'recharts'
import { useChartTheme } from './useChartTheme'

interface AccessibleTooltipProps extends Partial<TooltipProps<any, any>> {
  showUnit?: string
  ariaLabel?: string
}

/**
 * Accessible tooltip with ARIA labels and semantic HTML
 */
export const AccessibleTooltip: React.FC<AccessibleTooltipProps> = ({
  showUnit,
  ariaLabel,
  ...props
}) => {
  const { isDark, colors } = useChartTheme()

  const customLabelStyle = {
    backgroundColor: colors.tooltipBackground,
    border: `2px solid ${colors.tooltipBorder}`,
    borderRadius: '6px',
    color: colors.tooltipText,
    padding: '12px',
    fontSize: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  }

  // Custom content renderer with semantic HTML
  const CustomContent = (contentProps: any) => {
    if (!contentProps.active || !contentProps.payload) return null

    return (
      <div
        role="tooltip"
        aria-label={ariaLabel || 'Chart tooltip'}
        style={customLabelStyle}
      >
        {contentProps.label && (
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {contentProps.label}
          </div>
        )}
        {contentProps.payload.map((entry: any, index: number) => (
          <div
            key={`${entry.name}-${index}`}
            style={{ color: entry.color, marginBottom: '2px' }}
          >
            <span style={{ marginRight: '8px' }}>{entry.name}:</span>
            <span style={{ fontWeight: 500 }}>
              {typeof entry.value === 'number'
                ? entry.value.toLocaleString()
                : entry.value}
              {showUnit ? ` ${showUnit}` : ''}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <RechartsTooltip
      contentStyle={customLabelStyle}
      labelStyle={{ color: colors.tooltipText }}
      content={<CustomContent />}
      wrapperStyle={{ outline: 'none' }}
      {...props}
    />
  )
}