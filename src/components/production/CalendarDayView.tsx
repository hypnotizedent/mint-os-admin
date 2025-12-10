/**
 * CalendarDayView Component
 * Detailed view of a single day with time slots and capacity indicator
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  CalendarBlank,
  Clock,
  Package,
  User,
  Warning,
  CaretLeft,
  CaretRight,
  Printer
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { format, addDays, subDays, isToday } from 'date-fns'
import type { Job, CapacityData } from '@/lib/types'

interface CalendarDayViewProps {
  date: Date
  jobs: Job[]
  capacity?: CapacityData
  onJobClick?: (job: Job) => void
  onDateChange?: (date: Date) => void
  onPrintLabel?: (job: Job) => void
}

// Time slot configuration
const TIME_SLOTS = [
  { id: 'morning', label: 'Morning', time: '8:00 AM - 12:00 PM', hours: [8, 9, 10, 11] },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 5:00 PM', hours: [12, 13, 14, 15, 16] },
  { id: 'evening', label: 'Evening', time: '5:00 PM - 8:00 PM', hours: [17, 18, 19] },
]

export function CalendarDayView({
  date,
  jobs,
  capacity,
  onJobClick,
  onDateChange,
  onPrintLabel,
}: CalendarDayViewProps) {
  // Get status color for job badge
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      quote: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
      design: 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
      prepress: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
      printing: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
      finishing: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
      delivery: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
      completed: 'bg-green-600/20 text-green-800 dark:text-green-300 border-green-600/30',
      cancelled: 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30',
    }
    return colors[status] || colors.quote
  }

  // Get print method display
  const getPrintMethod = (job: Job): string => {
    // This would ideally come from the job data
    // For now, we'll derive it from the status or use a placeholder
    if (job.assignedMachine) {
      return job.assignedMachine
    }
    return 'Screen Print'
  }

  // Calculate capacity percentage
  const capacityPercentage = capacity?.percentUtilized || 
    Math.min(Math.round((jobs.length / 10) * 100), 100)
  const isOverCapacity = capacity?.isOverbooked || jobs.length > 10

  // Navigate dates
  const goToPreviousDay = () => {
    onDateChange?.(subDays(date, 1))
  }

  const goToNextDay = () => {
    onDateChange?.(addDays(date, 1))
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarBlank size={24} />
            Day View
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
              <CaretLeft size={18} />
            </Button>
            <div className={cn(
              'px-4 py-1 rounded-lg min-w-[180px] text-center',
              isToday(date) && 'bg-primary/10 text-primary font-medium'
            )}>
              {format(date, 'EEEE, MMM d, yyyy')}
            </div>
            <Button variant="ghost" size="icon" onClick={goToNextDay}>
              <CaretRight size={18} />
            </Button>
          </div>
        </div>
        
        {/* Capacity Indicator */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Daily Capacity</span>
            <span className={cn(
              'text-sm font-semibold',
              isOverCapacity ? 'text-red-600' : capacityPercentage > 80 ? 'text-orange-600' : 'text-green-600'
            )}>
              {capacityPercentage}% ({jobs.length} / {capacity?.totalCapacity || 10} jobs)
            </span>
          </div>
          <Progress 
            value={Math.min(capacityPercentage, 100)} 
            className={cn(
              'h-2',
              isOverCapacity && '[&>div]:bg-red-500'
            )}
          />
          {isOverCapacity && (
            <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
              <Warning size={14} weight="fill" />
              <span>This day is overbooked!</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {TIME_SLOTS.map(slot => (
          <div key={slot.id} className="border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-muted-foreground" />
                  <span className="font-medium">{slot.label}</span>
                </div>
                <span className="text-sm text-muted-foreground">{slot.time}</span>
              </div>
            </div>
            
            <div className="p-3">
              {jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {jobs.map(job => (
                    <div
                      key={job.id}
                      onClick={() => onJobClick?.(job)}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                        getStatusColor(job.status),
                        job.priority === 'urgent' && 'ring-2 ring-red-500'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {job.priority === 'urgent' && (
                            <Warning size={16} weight="fill" className="text-red-500 flex-shrink-0" />
                          )}
                          <span className="font-semibold">{job.title}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User size={14} />
                          <span>{job.customer}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Package size={14} />
                          <span>{job.quantity} units</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Printer size={14} />
                          <span>{getPrintMethod(job)}</span>
                        </div>
                      </div>
                      
                      {onPrintLabel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 w-full text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            onPrintLabel(job)
                          }}
                        >
                          Print Label
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {slot.id === 'morning' ? (
                    'No jobs scheduled for this day'
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
