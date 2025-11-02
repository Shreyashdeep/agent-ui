'use client'

import React, { useMemo } from 'react'
import {
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useChartTheme } from '../primitives/useChartTheme'
import type { ChartMessage } from '@/types/charts'
import { isRetentionChart } from '@/types/charts'

interface RetentionChartVProps {
  chart: ChartMessage
  height?: number
}

/**
 * Retention Chart Component
 * Renders cohort retention as a heatmap table
 * Shows retention % for each cohort across time periods
 */
export const RetentionChartV: React.FC<RetentionChartVProps> = ({ chart, height = 350 }) => {
  if (!isRetentionChart(chart)) {
    return <div>Invalid chart type for RetentionChartV</div>
  }

  const { colors, isDark } = useChartTheme()
  const { data, meta } = chart
    const fields = chart.fields as any

  // Group data by cohort
  const cohorts = useMemo(() => {
    const cohortMap = new Map<string, Record<string, number>>()

    data.forEach((row: any) => {
      const cohort = row[fields.cohortKey]
      const period = row[fields.periodKey]
      const retention = row[fields.retentionKey]

      if (!cohortMap.has(cohort)) {
        cohortMap.set(cohort, {})
      }
      cohortMap.get(cohort)![period] = retention
    })

    return Array.from(cohortMap.entries())
  }, [data, fields])

  // Get all periods
  const periods = useMemo(() => {
    const periodSet = new Set<string>()
    data.forEach((row: any) => {
      periodSet.add(row[fields.periodKey])
    })
    return Array.from(periodSet)
  }, [data, fields])

  // Get color for retention value (green for high, red for low)
  const getRetentionColor = (value: number): string => {
    if (value >= 80) return '#10b981' // Green
    if (value >= 60) return '#84cc16' // Lime
    if (value >= 40) return '#f59e0b' // Amber
    if (value >= 20) return '#ef4444' // Red
    return '#7f1d1d' // Dark red
  }

  return (
    <div className={`w-full overflow-x-auto rounded-lg p-4 ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      <table className={`w-full text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
        <thead>
          <tr className={isDark ? 'border-gray-700' : 'border-gray-200'}>
            <th className={`px-4 py-2 text-left font-semibold ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              Cohort
            </th>
            {periods.map(period => (
              <th
                key={period}
                className={`px-4 py-2 text-center font-semibold ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
              >
                {period}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map(([cohort, cohortData]) => (
            <tr key={cohort} className={isDark ? 'border-gray-700' : 'border-gray-200'}>
              <td className={`px-4 py-2 font-medium ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                {cohort}
              </td>
              {periods.map(period => {
                const value = cohortData[period]
                const bgColor = value !== undefined ? getRetentionColor(value) : 'transparent'
                return (
                  <td
                    key={`${cohort}-${period}`}
                    className="px-4 py-2 text-center"
                    style={{
                      backgroundColor: bgColor,
                      color: value !== undefined && value > 50 ? '#ffffff' : '#000000'
                    }}
                    title={value !== undefined ? `${value}%` : 'No data'}
                  >
                    {value !== undefined ? `${value}%` : '-'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className={`mt-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        <p className="font-semibold">Legend:</p>
        <div className="mt-2 flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" /> ≥ 80%
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-lime-500 rounded" /> ≥ 60%
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded" /> ≥ 40%
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" /> ≥ 20%
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-900 rounded" /> &lt; 20%
          </div>
        </div>
      </div>
    </div>
  )
}