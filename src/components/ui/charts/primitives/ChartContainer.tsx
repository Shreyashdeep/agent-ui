'use client'

import React from 'react'
import { useChartTheme } from './useChartTheme'

interface ChartContainerProps {
  children: React.ReactNode
  title?: string
  className?: string
  height?: number
}

/**
 * Wrapper component for all charts
 * Handles responsive sizing, theming, and consistent styling
 */
export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  title,
  className = '',
  height = 400
}) => {
  const { isDark, colors } = useChartTheme()

  return (
    <div
      className={`w-full rounded-lg border p-4 ${
        isDark
          ? 'border-gray-700 bg-gray-900'
          : 'border-gray-200 bg-white'
      } ${className}`}
      style={{
        minHeight: `${height}px`
      }}
    >
      {title && (
        <h3 className={`mb-4 text-lg font-semibold ${
          isDark ? 'text-gray-100' : 'text-gray-900'
        }`}>
          {title}
        </h3>
      )}
      <div className="w-full" style={{ height: `${height - (title ? 60 : 0)}px` }}>
        {children}
      </div>
    </div>
  )
}