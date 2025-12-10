/**
 * ProductionCalendar Component
 * Monthly/weekly/daily calendar view for production jobs
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CaretLeft, 
  CaretRight, 
  CalendarBlank,
  Warning
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isToday
} from 'date-fns'
import type { Job, CalendarView } from '@/lib/types'

interface ProductionCalendarProps {
  jobs: Job[]
  onJobClick?: (job: Job) => void
  onJobReschedule?: (jobId: string, newDate: string) => void
  initialView?: CalendarView
}

export function ProductionCalendar({ 
  jobs, 
  onJobClick, 
  onJobReschedule,
  initialView = 'month' 
}: ProductionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>(initialView)
  const [draggedJob, setDraggedJob] = useState<Job | null>(null)

  // Get jobs for a specific date
  const getJobsForDate = (date: Date): Job[] => {
    return jobs.filter(job => {
      const jobDate = new Date(job.dueDate)
      return isSameDay(jobDate, date)
    })
  }

  // Navigate between periods
  const goToPrevious = () => {
    switch (view) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1))
        break
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1))
        break
      case 'day':
        setCurrentDate(subDays(currentDate, 1))
        break
    }
  }

  const goToNext = () => {
    switch (view) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1))
        break
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1))
        break
      case 'day':
        setCurrentDate(addDays(currentDate, 1))
        break
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get title based on view
  const getTitle = (): string => {
    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy')
      case 'week': {
        const weekStart = startOfWeek(currentDate)
        const weekEnd = endOfWeek(currentDate)
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
      }
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy')
    }
  }

  // Calendar days for month view
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate])

  // Calendar days for week view
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate)
    const weekEnd = endOfWeek(currentDate)
    
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }, [currentDate])

  // Drag and drop handlers
  const handleDragStart = (job: Job) => {
    setDraggedJob(job)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    if (draggedJob && onJobReschedule) {
      const newDate = format(date, 'yyyy-MM-dd')
      onJobReschedule(draggedJob.id, newDate)
    }
    setDraggedJob(null)
  }

  // Get status color for job badge
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      quote: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
      design: 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
      prepress: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400',
      printing: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
      finishing: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400',
      delivery: 'bg-green-500/20 text-green-700 dark:text-green-400',
      completed: 'bg-green-600/20 text-green-800 dark:text-green-300',
      cancelled: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
    }
    return colors[status] || colors.quote
  }

  // Render a job card
  const renderJobCard = (job: Job, compact: boolean = false) => (
    <div
      key={job.id}
      draggable
      onDragStart={() => handleDragStart(job)}
      onClick={() => onJobClick?.(job)}
      className={cn(
        'cursor-pointer rounded p-1.5 text-xs transition-all hover:shadow-md',
        getStatusColor(job.status),
        job.priority === 'urgent' && 'ring-2 ring-red-500',
        compact ? 'truncate' : 'space-y-1'
      )}
    >
      <div className="flex items-center gap-1">
        {job.priority === 'urgent' && (
          <Warning size={12} weight="fill" className="text-red-500 flex-shrink-0" />
        )}
        <span className="font-medium truncate">{job.title}</span>
      </div>
      {!compact && (
        <div className="text-[10px] opacity-75 truncate">{job.customer}</div>
      )}
    </div>
  )

  // Render day cell for month view
  const renderDayCell = (day: Date) => {
    const dayJobs = getJobsForDate(day)
    const isCurrentMonth = isSameMonth(day, currentDate)
    const isCurrentDay = isToday(day)
    
    return (
      <div
        key={day.toISOString()}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, day)}
        className={cn(
          'min-h-[100px] border border-border p-1 transition-colors',
          !isCurrentMonth && 'bg-muted/30',
          isCurrentDay && 'bg-primary/5 ring-1 ring-primary/20',
          draggedJob && 'hover:bg-primary/10'
        )}
      >
        <div className={cn(
          'mb-1 text-sm font-medium',
          !isCurrentMonth && 'text-muted-foreground',
          isCurrentDay && 'text-primary'
        )}>
          {format(day, 'd')}
        </div>
        <div className="space-y-1 overflow-hidden">
          {dayJobs.slice(0, 3).map(job => renderJobCard(job, true))}
          {dayJobs.length > 3 && (
            <div className="text-xs text-muted-foreground text-center">
              +{dayJobs.length - 3} more
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render week view day cell
  const renderWeekDayCell = (day: Date) => {
    const dayJobs = getJobsForDate(day)
    const isCurrentDay = isToday(day)
    
    return (
      <div
        key={day.toISOString()}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, day)}
        className={cn(
          'min-h-[300px] border border-border p-2 transition-colors flex-1',
          isCurrentDay && 'bg-primary/5 ring-1 ring-primary/20',
          draggedJob && 'hover:bg-primary/10'
        )}
      >
        <div className={cn(
          'mb-2 text-center',
          isCurrentDay && 'text-primary'
        )}>
          <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
          <div className={cn(
            'text-lg font-semibold',
            isCurrentDay && 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto'
          )}>
            {format(day, 'd')}
          </div>
        </div>
        <div className="space-y-1">
          {dayJobs.map(job => renderJobCard(job))}
        </div>
      </div>
    )
  }

  // Time slots for day view
  const timeSlots = ['Morning (8am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-8pm)']

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarBlank size={24} />
              Production Calendar
            </CardTitle>
            <Tabs value={view} onValueChange={(v) => setView(v as CalendarView)}>
              <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={goToPrevious}>
              <CaretLeft size={18} />
            </Button>
            <span className="min-w-[200px] text-center font-medium">
              {getTitle()}
            </span>
            <Button variant="ghost" size="icon" onClick={goToNext}>
              <CaretRight size={18} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">Quote/Pending</Badge>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-700">In Production</Badge>
          <Badge variant="secondary" className="bg-green-500/20 text-green-700">Complete</Badge>
          <Badge variant="secondary" className="ring-2 ring-red-500">Urgent (Red Border)</Badge>
        </div>

        {/* Month View */}
        {view === 'month' && (
          <div>
            <div className="grid grid-cols-7 gap-0 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
              {monthDays.map(day => renderDayCell(day))}
            </div>
          </div>
        )}

        {/* Week View */}
        {view === 'week' && (
          <div className="flex gap-0 border border-border rounded-lg overflow-hidden">
            {weekDays.map(day => renderWeekDayCell(day))}
          </div>
        )}

        {/* Day View */}
        {view === 'day' && (
          <div className="space-y-2">
            <div className={cn(
              'text-center p-4 rounded-lg',
              isToday(currentDate) && 'bg-primary/5'
            )}>
              <div className="text-muted-foreground text-sm">{format(currentDate, 'EEEE')}</div>
              <div className="text-3xl font-bold">{format(currentDate, 'MMMM d, yyyy')}</div>
            </div>
            <div 
              className="space-y-4 min-h-[400px] border border-border rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, currentDate)}
            >
              {timeSlots.map(slot => {
                const slotJobs = getJobsForDate(currentDate)
                return (
                  <div key={slot} className="border-b border-border pb-4 last:border-0">
                    <div className="text-sm font-medium text-muted-foreground mb-2">{slot}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {slotJobs.map(job => (
                        <div
                          key={job.id}
                          draggable
                          onDragStart={() => handleDragStart(job)}
                          onClick={() => onJobClick?.(job)}
                          className={cn(
                            'p-3 rounded-lg cursor-pointer transition-all hover:shadow-md',
                            getStatusColor(job.status),
                            job.priority === 'urgent' && 'ring-2 ring-red-500'
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {job.priority === 'urgent' && (
                              <Warning size={14} weight="fill" className="text-red-500" />
                            )}
                            <span className="font-medium">{job.title}</span>
                          </div>
                          <div className="text-sm opacity-75">{job.customer}</div>
                          <div className="text-xs mt-1 opacity-60">
                            {job.quantity} units • {job.status}
                          </div>
                        </div>
                      ))}
                    </div>
                    {slotJobs.length === 0 && slot === timeSlots[0] && (
                      <div className="text-sm text-muted-foreground italic">
                        No jobs scheduled for this day
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
