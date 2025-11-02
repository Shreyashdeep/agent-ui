'use client'

import React, { useState } from 'react'
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
 * Modal component for expanded chart view
 * Allows users to view charts in full screen
 */
export const ChartModal: React.FC<ChartModalProps> = ({
  chart,
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{chart.meta.title}</DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="mt-4">
          <ChartRenderer chart={chart} height={500} />
        </div>

        {chart.meta.a11y?.description && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Description:</strong> {chart.meta.a11y.description}
            </p>
          </div>
        )}

        {chart.meta.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Notes:</strong> {chart.meta.notes}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}