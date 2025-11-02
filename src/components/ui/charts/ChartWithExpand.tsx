'use client'

import React, { useState } from 'react'
import { ChartRenderer } from './ChartRenderer'
import { ChartModal } from './ChartModal'
import { Button } from '@/components/ui/button'
import { Maximize2 } from 'lucide-react'
import type { ChartMessage } from '@/types/charts'

interface ChartWithExpandProps {
  chart: ChartMessage
  height?: number
}

/**
 * Chart wrapper with expand to modal functionality
 * Allows inline view + full-screen view
 */
export const ChartWithExpand: React.FC<ChartWithExpandProps> = ({
  chart,
  height = 350
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="relative group">
        {/* Chart container with expand button */}
        <div className="rounded-lg border overflow-hidden">
          <ChartRenderer chart={chart} height={height} />
        </div>

        {/* Expand button (shows on hover) */}
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsModalOpen(true)}
        >
          <Maximize2 className="h-4 w-4 mr-2" />
          Expand
        </Button>
      </div>

      {/* Modal for expanded view */}
      <ChartModal
        chart={chart}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}