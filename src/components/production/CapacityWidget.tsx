/**
 * CapacityWidget Component
 * Shows production capacity for next 7 days with bar chart
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ChartBar,
  Warning,
  CalendarBlank
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { format, isToday, isTomorrow } from 'date-fns'
import type { CapacityData } from '@/lib/types'

interface CapacityWidgetProps {
  capacityData: CapacityData[]
  onDayClick?: (date: string) => void
  compact?: boolean
}

export function CapacityWidget({
  capacityData,
  onDayClick,
  compact = false,
}: CapacityWidgetProps) {
  // Get color based on utilization
  const getBarColor = (data: CapacityData): string => {
    if (data.isOverbooked) return 'bg-red-500'
    if (data.percentUtilized >= 80) return 'bg-orange-500'
    if (data.percentUtilized >= 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  // Get day label
  const getDayLabel = (dateStr: string): string => {
    const date = new Date(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEE')
  }

  // Get date display
  const getDateDisplay = (dateStr: string): string => {
    const date = new Date(dateStr)
    return format(date, 'MMM d')
  }

  // Calculate total stats
  const totalScheduled = capacityData.reduce((sum, d) => sum + d.scheduledJobs, 0)
  const totalCapacity = capacityData.reduce((sum, d) => sum + d.totalCapacity, 0)
  const overbookedDays = capacityData.filter(d => d.isOverbooked).length
  const avgUtilization = capacityData.length > 0
    ? Math.round(capacityData.reduce((sum, d) => sum + d.percentUtilized, 0) / capacityData.length)
    : 0

  if (compact) {
    // Compact dashboard widget version
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ChartBar size={16} />
            7-Day Capacity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-16">
            {capacityData.slice(0, 7).map((data) => (
              <div
                key={data.date}
                className="flex-1 flex flex-col items-center cursor-pointer group"
                onClick={() => onDayClick?.(data.date)}
              >
                <div className="w-full relative flex flex-col items-center">
                  <div 
                    className={cn(
                      'w-full rounded-t transition-all group-hover:opacity-80',
                      getBarColor(data)
                    )}
                    style={{ height: `${Math.max(data.percentUtilized, 5)}%`, minHeight: '4px', maxHeight: '48px' }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {format(new Date(data.date), 'dd')}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-muted-foreground">
              {totalScheduled}/{totalCapacity} jobs
            </span>
            {overbookedDays > 0 && (
              <Badge variant="destructive" className="text-xs">
                {overbookedDays} overbooked
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Full version
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ChartBar size={24} />
            Production Capacity
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">{totalScheduled}</span> / {totalCapacity} jobs scheduled
            </div>
            <div className="text-muted-foreground">
              Avg: <span className="font-medium text-foreground">{avgUtilization}%</span> utilized
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overbooked Warning */}
        {overbookedDays > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
            <Warning size={20} className="text-red-500" weight="fill" />
            <span className="text-sm text-red-700 dark:text-red-400">
              {overbookedDays} {overbookedDays === 1 ? 'day is' : 'days are'} overbooked
            </span>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-muted-foreground">0-49% (Light)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-muted-foreground">50-79% (Moderate)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-muted-foreground">80-99% (High)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-muted-foreground">100%+ (Overbooked)</span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="space-y-3">
          {capacityData.map((data) => (
            <div
              key={data.date}
              className={cn(
                'flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50',
                isToday(new Date(data.date)) && 'bg-primary/5 ring-1 ring-primary/20'
              )}
              onClick={() => onDayClick?.(data.date)}
            >
              {/* Day Label */}
              <div className="w-20">
                <div className={cn(
                  'font-medium text-sm',
                  isToday(new Date(data.date)) && 'text-primary'
                )}>
                  {getDayLabel(data.date)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getDateDisplay(data.date)}
                </div>
              </div>

              {/* Bar */}
              <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                <div
                  className={cn(
                    'h-full transition-all rounded-lg',
                    getBarColor(data)
                  )}
                  style={{ width: `${Math.min(data.percentUtilized, 100)}%` }}
                />
                {/* Overflow indicator for overbooked */}
                {data.isOverbooked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-500/80 text-white text-xs px-2 py-0.5 rounded">
                      {data.percentUtilized}%
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="w-24 text-right">
                <div className="text-sm font-medium">
                  {data.scheduledJobs} / {data.totalCapacity}
                </div>
                <div className={cn(
                  'text-xs',
                  data.isOverbooked ? 'text-red-600' : 'text-muted-foreground'
                )}>
                  {data.percentUtilized}% capacity
                </div>
              </div>

              {/* Warning icon for overbooked */}
              <div className="w-6">
                {data.isOverbooked && (
                  <Warning size={20} className="text-red-500" weight="fill" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {capacityData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarBlank size={48} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No capacity data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
