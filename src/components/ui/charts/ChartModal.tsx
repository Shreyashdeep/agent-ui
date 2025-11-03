"use client"
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { ChartRenderer } from './ChartRenderer'
import type { ChartMessage } from '@/types/charts'

interface ChartModalProps {
  chart: ChartMessage
  isOpen: boolean
  onClose: () => void
}

/**
 * Accessible modal component for expanded chart view
 * Features:
 * - Keyboard navigation (ESC to close, Tab trapping)
 * - ARIA labels and roles
 * - Focus management
 */
export const ChartModal: React.FC<ChartModalProps> = ({
  chart,
  isOpen,
  onClose
}) => {
  const [previousActiveElement, setPreviousActiveElement] = useState<HTMLElement | null>(null)

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      // Store the element that had focus before opening modal
      setPreviousActiveElement(document.activeElement as HTMLElement)
    } else if (previousActiveElement) {
      // Restore focus when modal closes
      previousActiveElement.focus()
    }
  }, [isOpen, previousActiveElement])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="chart-modal-title"
        aria-describedby="chart-modal-description"
      >
        <DialogHeader>
          <DialogTitle id="chart-modal-title">
            {chart.meta.title}
          </DialogTitle>
          {chart.meta.a11y?.description && (
            <p id="chart-modal-description" className="sr-only">
              {chart.meta.a11y.description}
            </p>
          )}
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 h-8 w-8 p-0"
              aria-label="Close chart modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="mt-4">
          <ChartRenderer
            chart={chart}
            height={500}
          />
        </div>

        {chart.meta.a11y?.description && (
          <div
            className="mt-4 pt-4 border-t"
            role="region"
            aria-label="Chart description"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Description:</strong> {chart.meta.a11y.description}
            </p>
          </div>
        )}

        {chart.meta.notes && (
          <div
            className="mt-4 pt-4 border-t"
            role="region"
            aria-label="Chart notes"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Notes:</strong> {chart.meta.notes}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}