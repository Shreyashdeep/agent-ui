'use client'

import React from 'react'

interface AccessibleChartLabelProps {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}

/**
 * Accessible wrapper for charts with ARIA labels and descriptions
 * Ensures screen readers can understand chart content
 */
export const AccessibleChartLabel: React.FC<AccessibleChartLabelProps> = ({
  id,
  title,
  description,
  children
}) => {
  return (
    <figure id={id} className="w-full">
      {/* Visually hidden title for screen readers */}
      <h2 id={`${id}-title`} className="sr-only">
        {title}
      </h2>

      {/* Visually hidden description for screen readers */}
      {description && (
        <p id={`${id}-description`} className="sr-only">
          {description}
        </p>
      )}

      {/* Chart content */}
      <div
        role="img"
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-description` : undefined}
        className="w-full"
      >
        {children}
      </div>

      {/* Caption visible below chart */}
      <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {title}
        {description && ` — ${description}`}
      </figcaption>
    </figure>
  )
}