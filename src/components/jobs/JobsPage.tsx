import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MagnifyingGlass, Plus, Funnel, CalendarBlank, FileText, Warning, ArrowRight, ArrowLeft, CaretUp, CaretDown, CaretLeft } from "@phosphor-icons/react"
import { PrintLabelButton } from "@/components/labels"
import { toast } from "sonner"
import { jobsApi } from "@/lib/api-client"
import { EmptyState } from "@/components/ui/states"
import type { Job, JobStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

// Status configuration - comprehensive list of all job statuses with styling
const STATUS_CONFIG = [
  { id: 'quote', label: 'Quote', color: 'border-yellow', bgColor: 'bg-yellow/80 text-foreground', legendColor: 'bg-yellow/80' },
  { id: 'design', label: 'Design', color: 'border-blue-500', bgColor: 'bg-blue-500 text-white', legendColor: 'bg-blue-500' },
  { id: 'prepress', label: 'Pre-press', color: 'border-purple-500', bgColor: 'bg-purple-500 text-white', legendColor: 'bg-purple-500' },
  { id: 'printing', label: 'Printing', color: 'border-cyan', bgColor: 'bg-cyan text-white', legendColor: 'bg-cyan' },
  { id: 'finishing', label: 'Finishing', color: 'border-orange-500', bgColor: 'bg-orange-500 text-white', legendColor: 'bg-orange-500' },
  { id: 'delivery', label: 'Delivery', color: 'border-green-600', bgColor: 'bg-green-600 text-white', legendColor: 'bg-green-600' },
  { id: 'completed', label: 'Completed', color: 'border-green-700', bgColor: 'bg-green-700 text-white', legendColor: 'bg-green-700' },
  { id: 'cancelled', label: 'Cancelled', color: 'border-muted', bgColor: 'bg-muted text-muted-foreground', legendColor: 'bg-muted' }
] as const

// Kanban board columns - only workflow stages that appear on the board
const KANBAN_COLUMNS = STATUS_CONFIG.slice(0, 6)

type SortField = 'title' | 'customer' | 'status' | 'dueDate' | 'priority' | 'estimatedCost'
type SortDirection = 'asc' | 'desc'

interface JobsPageProps {
  jobs: Job[]
  onUpdateJob: (jobId: string, updates: Partial<Job>) => void
  onViewOrder?: (orderId: string) => void
}

export function JobsPage({ jobs, onUpdateJob, onViewOrder }: JobsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeView, setActiveView] = useState("kanban")
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null)
  
  // List view state
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('dueDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  
  // Calendar view state
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())

  // Use KANBAN_COLUMNS for the Kanban board
  const columns = KANBAN_COLUMNS

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job =>
    searchQuery === "" ||
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.customer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sorted jobs for list view
  const sortedJobs = useMemo(() => {
    const sorted = [...filteredJobs].sort((a, b) => {
      let aVal: string | number | Date
      let bVal: string | number | Date
      
      switch (sortField) {
        case 'title':
          aVal = a.title.toLowerCase()
          bVal = b.title.toLowerCase()
          break
        case 'customer':
          aVal = a.customer.toLowerCase()
          bVal = b.customer.toLowerCase()
          break
        case 'status':
          // Sort by status order in workflow - use STATUS_CONFIG for complete status list
          const statusOrder = STATUS_CONFIG.map(c => c.id)
          aVal = statusOrder.indexOf(a.status)
          bVal = statusOrder.indexOf(b.status)
          // Put unknown statuses at the end
          if (aVal === -1) aVal = statusOrder.length
          if (bVal === -1) bVal = statusOrder.length
          break
        case 'dueDate':
          aVal = new Date(a.dueDate).getTime()
          bVal = new Date(b.dueDate).getTime()
          break
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
          aVal = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2
          bVal = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2
          break
        case 'estimatedCost':
          aVal = a.estimatedCost
          bVal = b.estimatedCost
          break
        default:
          return 0
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredJobs, sortField, sortDirection, columns])

  // Handle sort column click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // List view selection handlers
  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(jobId)) {
        newSet.delete(jobId)
      } else {
        newSet.add(jobId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set())
    } else {
      setSelectedJobs(new Set(filteredJobs.map(j => j.id)))
    }
  }

  // Get status badge color for list/calendar views
  const getStatusBadgeColor = (status: JobStatus) => {
    const col = STATUS_CONFIG.find(c => c.id === status)
    return col?.bgColor || 'bg-muted text-foreground'
  }

  // Calendar view helpers
  const getWeekDays = (date: Date) => {
    const start = new Date(date)
    start.setDate(start.getDate() - start.getDay()) // Start of week (Sunday)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Get the start of the calendar (may include days from previous month)
    const calendarStart = new Date(firstDay)
    calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay())
    
    // Get 6 weeks of days for consistent calendar size
    const days: Date[] = []
    const current = new Date(calendarStart)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  }

  const formatDateKey = (date: Date) => date.toISOString().split('T')[0]
  
  const getJobsForDate = (date: Date) => {
    const dateKey = formatDateKey(date)
    return filteredJobs.filter(job => {
      const jobDate = new Date(job.dueDate).toISOString().split('T')[0]
      return jobDate === dateKey
    })
  }

  const navigateCalendar = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (calendarView === 'week') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
      } else {
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
      }
      return newDate
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const getJobsByStatus = (status: string) => {
    return filteredJobs.filter(job => job.status === status)
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-destructive text-destructive-foreground',
      high: 'bg-orange-500 text-white',
      normal: 'bg-blue-500 text-white',
      low: 'bg-muted text-muted-foreground'
    }
    return colors[priority as keyof typeof colors] || colors.normal
  }

  // Get next/previous status for a job
  const getAdjacentStatus = (currentStatus: string, direction: 'next' | 'prev'): string | null => {
    const statusOrder = columns.map(c => c.id)
    const currentIndex = statusOrder.indexOf(currentStatus as typeof statusOrder[number])
    if (currentIndex === -1) return null
    
    if (direction === 'next' && currentIndex < statusOrder.length - 1) {
      return statusOrder[currentIndex + 1]
    }
    if (direction === 'prev' && currentIndex > 0) {
      return statusOrder[currentIndex - 1]
    }
    return null
  }

  // Valid status values that match JobStatus type
  const validStatuses: Job['status'][] = ['quote', 'design', 'prepress', 'printing', 'finishing', 'delivery', 'completed', 'cancelled']
  
  // Type guard to check if a string is a valid JobStatus
  const isValidJobStatus = (status: string): status is Job['status'] => {
    return validStatuses.includes(status as Job['status'])
  }

  // Update job status in Strapi
  const handleStatusUpdate = async (jobId: string, newStatus: string) => {
    // Validate that newStatus is a valid JobStatus
    if (!isValidJobStatus(newStatus)) {
      toast.error('Invalid status', {
        description: `"${newStatus}" is not a valid job status`,
      })
      return
    }

    setUpdatingJobId(jobId)
    try {
      // The job id is used as the documentId for API calls
      // In a real app, you'd want to ensure jobs have proper documentId fields
      const result = await jobsApi.updateStatus(jobId, newStatus)
      
      if (result.success) {
        // Update local state via parent callback with validated status
        onUpdateJob(jobId, { status: newStatus })
        toast.success('Job status updated', {
          description: `Moved to ${STATUS_CONFIG.find(c => c.id === newStatus)?.label || newStatus}`,
        })
      } else {
        toast.error('Failed to update job status', {
          description: result.error || 'Please try again',
        })
      }
    } catch (error) {
      toast.error('Failed to update job status')
      console.error('Status update error:', error)
    } finally {
      setUpdatingJobId(null)
    }
  }

  // Handle direct status selection from dropdown
  const handleDirectStatusChange = async (jobId: string, newStatus: string) => {
    if (newStatus === jobs.find(j => j.id === jobId)?.status) return
    await handleStatusUpdate(jobId, newStatus)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Jobs</h1>
          <p className="text-muted-foreground mt-1">Manage your print jobs through their lifecycle</p>
        </div>
        <Button className="gap-2">
          <Plus size={18} weight="bold" />
          Create Job
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search jobs by title or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Funnel size={18} />
          Filter
        </Button>
        <Tabs value={activeView} onValueChange={setActiveView} className="ml-auto">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Calendar View */}
      {activeView === 'calendar' && (
        <Card className="p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateCalendar('prev')}>
                <CaretLeft size={16} />
              </Button>
              <h2 className="text-lg font-semibold text-foreground min-w-[180px] text-center">
                {calendarView === 'week' 
                  ? `Week of ${getWeekDays(currentDate)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${getWeekDays(currentDate)[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                }
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigateCalendar('next')}>
                <ArrowRight size={16} />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Tabs value={calendarView} onValueChange={(v) => setCalendarView(v as 'week' | 'month')}>
                <TabsList className="h-8">
                  <TabsTrigger value="week" className="text-xs px-2 h-6">Week</TabsTrigger>
                  <TabsTrigger value="month" className="text-xs px-2 h-6">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Week View */}
          {calendarView === 'week' && (
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2 border-b border-border">
                  {day}
                </div>
              ))}
              {/* Day Cells */}
              {getWeekDays(currentDate).map(date => {
                const dayJobs = getJobsForDate(date)
                return (
                  <div 
                    key={date.toISOString()} 
                    className={cn(
                      "min-h-[120px] p-2 border border-border rounded-lg",
                      isToday(date) && "bg-primary/5 border-primary/30"
                    )}
                  >
                    <div className={cn(
                      "text-sm font-medium mb-2",
                      isToday(date) ? "text-primary" : "text-foreground"
                    )}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1 max-h-[80px] overflow-y-auto">
                      {dayJobs.slice(0, 3).map(job => (
                        <div 
                          key={job.id}
                          className={cn(
                            "text-xs px-2 py-1 rounded cursor-pointer truncate transition-colors hover:opacity-80",
                            getStatusBadgeColor(job.status)
                          )}
                          onClick={() => onViewOrder?.(job.id)}
                          title={`${job.title} - ${job.customer}`}
                        >
                          {job.title}
                        </div>
                      ))}
                      {dayJobs.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayJobs.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Month View */}
          {calendarView === 'month' && (
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {/* Day Cells */}
              {getMonthDays(currentDate).map((date, idx) => {
                const dayJobs = getJobsForDate(date)
                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "min-h-[80px] p-1 border border-border rounded",
                      !isCurrentMonth(date) && "bg-muted/30",
                      isToday(date) && "bg-primary/5 border-primary/30"
                    )}
                  >
                    <div className={cn(
                      "text-xs font-medium mb-1",
                      !isCurrentMonth(date) ? "text-muted-foreground" : isToday(date) ? "text-primary" : "text-foreground"
                    )}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-0.5 max-h-[50px] overflow-y-auto">
                      {dayJobs.slice(0, 2).map(job => (
                        <div 
                          key={job.id}
                          className={cn(
                            "text-[10px] px-1 py-0.5 rounded cursor-pointer truncate transition-colors hover:opacity-80",
                            getStatusBadgeColor(job.status)
                          )}
                          onClick={() => onViewOrder?.(job.id)}
                          title={`${job.title} - ${job.customer}`}
                        >
                          {job.title}
                        </div>
                      ))}
                      {dayJobs.length > 2 && (
                        <div className="text-[10px] text-muted-foreground text-center">
                          +{dayJobs.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Status Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
            {STATUS_CONFIG.slice(0, 6).map(col => (
              <div key={col.id} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded", col.legendColor)} />
                <span className="text-xs text-muted-foreground">{col.label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Kanban View */}
      {activeView === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnJobs = getJobsByStatus(column.id)

            return (
              <div key={column.id} className="flex-shrink-0 w-80">
                <div className="mb-4">
                  <div className={cn(
                    "flex items-center justify-between p-3 bg-card rounded-lg border-l-4",
                    column.color
                  )}>
                    <h3 className="font-semibold text-foreground">{column.label}</h3>
                    <Badge variant="secondary" className="ml-2">
                      {columnJobs.length}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {columnJobs.map((job) => (
                    <Card 
                      key={job.id} 
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => onViewOrder?.(job.id)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {job.title}
                          </h4>
                          {job.priority === 'urgent' && (
                            <Warning size={18} weight="fill" className="text-destructive flex-shrink-0" />
                          )}
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">{job.customer}</p>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText size={14} />
                            <span>{job.fileCount} files</span>
                            <span className="mx-1">•</span>
                            <span>{job.quantity} units</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CalendarBlank size={14} />
                            <span>Due: {new Date(job.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                          <Badge className={getPriorityColor(job.priority)} variant="secondary">
                            {job.priority}
                          </Badge>
                          <span className="text-xs font-semibold text-foreground ml-auto">
                            ${job.estimatedCost.toLocaleString()}
                          </span>
                        </div>

                        {/* Quick Actions */}
                        <div className="pt-2 flex items-center justify-between gap-2">
                          {/* Status navigation buttons */}
                          <div className="flex gap-1">
                            {getAdjacentStatus(job.status, 'prev') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                disabled={updatingJobId === job.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const prevStatus = getAdjacentStatus(job.status, 'prev')
                                  if (prevStatus) handleStatusUpdate(job.id, prevStatus)
                                }}
                              >
                                <ArrowLeft size={12} className="mr-1" />
                                {columns.find(c => c.id === getAdjacentStatus(job.status, 'prev'))?.label}
                              </Button>
                            )}
                            {getAdjacentStatus(job.status, 'next') && (
                              <Button
                                variant="default"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                disabled={updatingJobId === job.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const nextStatus = getAdjacentStatus(job.status, 'next')
                                  if (nextStatus) handleStatusUpdate(job.id, nextStatus)
                                }}
                              >
                                {columns.find(c => c.id === getAdjacentStatus(job.status, 'next'))?.label}
                                <ArrowRight size={12} className="ml-1" />
                              </Button>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {/* Status dropdown for direct selection */}
                            <Select
                              value={job.status}
                              onValueChange={(value) => {
                                handleDirectStatusChange(job.id, value)
                              }}
                            >
                              <SelectTrigger 
                                className="h-6 w-[100px] text-xs"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {columns.map(col => (
                                  <SelectItem key={col.id} value={col.id}>
                                    {col.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <PrintLabelButton
                              job={{
                                jobId: job.id,
                                printavoId: job.id,
                                customerName: job.customer,
                                jobNickname: job.title,
                                quantity: job.quantity,
                                dueDate: job.dueDate,
                              }}
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {activeView === 'list' && (
        <Card className="overflow-hidden">
          <Table aria-label="Jobs list" aria-describedby="jobs-count">
            <caption id="jobs-count" className="sr-only">
              {sortedJobs.length} {sortedJobs.length === 1 ? 'job' : 'jobs'} found
            </caption>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedJobs.size === filteredJobs.length && filteredJobs.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all jobs"
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => handleSort('title')}
                  aria-sort={sortField === 'title' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  role="columnheader"
                >
                  <div className="flex items-center gap-1">
                    Job Title
                    {sortField === 'title' && (
                      sortDirection === 'asc' ? <CaretUp size={14} aria-hidden="true" /> : <CaretDown size={14} aria-hidden="true" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => handleSort('customer')}
                  aria-sort={sortField === 'customer' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  role="columnheader"
                >
                  <div className="flex items-center gap-1">
                    Customer
                    {sortField === 'customer' && (
                      sortDirection === 'asc' ? <CaretUp size={14} /> : <CaretDown size={14} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <CaretUp size={14} /> : <CaretDown size={14} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center gap-1">
                    Due Date
                    {sortField === 'dueDate' && (
                      sortDirection === 'asc' ? <CaretUp size={14} /> : <CaretDown size={14} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center gap-1">
                    Priority
                    {sortField === 'priority' && (
                      sortDirection === 'asc' ? <CaretUp size={14} /> : <CaretDown size={14} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/80 transition-colors text-right"
                  onClick={() => handleSort('estimatedCost')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Amount
                    {sortField === 'estimatedCost' && (
                      sortDirection === 'asc' ? <CaretUp size={14} /> : <CaretDown size={14} />
                    )}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    {searchQuery ? (
                      <div className="flex flex-col items-center gap-2">
                        <MagnifyingGlass size={24} className="text-muted-foreground" />
                        <p className="text-muted-foreground">No jobs match &quot;{searchQuery}&quot;</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSearchQuery("")}
                        >
                          Clear search
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={24} className="text-muted-foreground" />
                        <p className="text-muted-foreground">No jobs found</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                sortedJobs.map((job) => (
                  <TableRow 
                    key={job.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onViewOrder?.(job.id)}
                    data-state={selectedJobs.has(job.id) ? 'selected' : undefined}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedJobs.has(job.id)}
                        onCheckedChange={() => toggleJobSelection(job.id)}
                        aria-label={`Select ${job.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {job.title}
                        {job.priority === 'urgent' && (
                          <Warning size={14} weight="fill" className="text-destructive" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{job.customer}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(job.status)}>
                        {STATUS_CONFIG.find(c => c.id === job.status)?.label || job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(job.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(job.priority)} variant="secondary">
                        {job.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${job.estimatedCost.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Selection info */}
          {selectedJobs.size > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {selectedJobs.size} job{selectedJobs.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedJobs(new Set())}>
                  Clear Selection
                </Button>
                <Button variant="default" size="sm">
                  Bulk Actions
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Job Quick View Modal - TODO: Implement JobQuickView component */}
    </div>
  )
}
