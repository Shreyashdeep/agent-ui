'use client'

import React from 'react'
import { useChartTheme } from './useChartTheme'

interface ChartContainerProps {
  children: React.ReactNode
  title?: string
  altText?: string
  className?: string
  height?: number
  id?: string
}

/**
 * Accessible chart container
 * Handles responsive sizing, theming, and ARIA attributes
 */
export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  title,
  altText,
  className = '',
  height = 400,
  id = `chart-${Math.random().toString(36).substr(2, 9)}`
}) => {
  const { isDark } = useChartTheme()

  return (
    <figure
      id={id}
      className={`w-full rounded-lg border p-4 ${
        isDark
          ? 'border-gray-700 bg-gray-900'
          : 'border-gray-200 bg-white'
      } ${className}`}
      style={{
        minHeight: `${height}px`
      }}
    >
      {/* Chart title */}
      {title && (
        <h2
          id={`${id}-title`}
          className={`mb-4 text-lg font-semibold ${
            isDark ? 'text-gray-100' : 'text-gray-900'
          }`}
        >
          {title}
        </h2>
      )}

      {/* Visually hidden alt text for screen readers */}
      {altText && (
        <div className="sr-only" id={`${id}-alt`} role="doc-subtitle">
          {altText}
        </div>
      )}

      {/* Chart content */}
      <div
        role="img"
        aria-labelledby={title ? `${id}-title` : undefined}
        aria-describedby={altText ? `${id}-alt` : undefined}
        className="w-full"
        style={{ height: `${height - (title ? 60 : 0)}px` }}
      >
        {children}
      </div>
    </figure>
  )
}