import React, { useState, useMemo } from 'react'
import { ChartRenderer } from './ChartRenderer'
import { DebouncedChartRenderer } from './DebouncedChartRenderer'
import { ChartModal } from './ChartModal'
import { Button } from '@/components/ui/button'
import { Maximize2 } from 'lucide-react'
import type { ChartMessage } from '@/types/charts'

interface ChartWithExpandProps {
  chart: ChartMessage
  height?: number
  debounceMs?: number
  isStreaming?: boolean
}

export const ChartWithExpand: React.FC<ChartWithExpandProps> = ({
  chart,
  height = 350,
  debounceMs = 200,
  isStreaming = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Use debounced renderer if streaming
  const ChartComponent = isStreaming ? DebouncedChartRenderer : ChartRenderer

  return (
    <>
      <div className="relative group">
        {/* Chart container with expand button */}
        <div className="rounded-lg border overflow-hidden">
          <ChartComponent
            chart={chart}
            height={height}
            debounceMs={debounceMs}
          />
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