/**
 * JobQuickView Component
 * Modal for quick job details and actions
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  User,
  Package,
  CalendarBlank,
  Clock,
  Printer,
  Warning,
  ArrowRight,
  Tag,
  FileText,
  Image
} from '@phosphor-icons/react'
import { format } from 'date-fns'
import type { Job, JobStatus } from '@/lib/types'

interface JobQuickViewProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  onStatusChange?: (jobId: string, newStatus: JobStatus) => void
  onViewDetails?: (jobId: string) => void
  onPrintLabel?: (job: Job) => void
}

const JOB_STATUSES: { value: JobStatus; label: string }[] = [
  { value: 'quote', label: 'Quote' },
  { value: 'design', label: 'Design' },
  { value: 'prepress', label: 'Pre-press' },
  { value: 'printing', label: 'Printing' },
  { value: 'finishing', label: 'Finishing' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function JobQuickView({
  job,
  isOpen,
  onClose,
  onStatusChange,
  onViewDetails,
  onPrintLabel,
}: JobQuickViewProps) {
  if (!job) return null

  // Get status color for badge
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

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-500/20 text-red-700',
      high: 'bg-orange-500/20 text-orange-700',
      normal: 'bg-blue-500/20 text-blue-700',
      low: 'bg-gray-500/20 text-gray-700',
    }
    return colors[priority] || colors.normal
  }

  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(job.id, newStatus as JobStatus)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                {job.priority === 'urgent' && (
                  <Warning size={20} weight="fill" className="text-red-500" />
                )}
                {job.title}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Job #{job.id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mockup placeholder */}
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
            <div className="text-center text-muted-foreground">
              <Image size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No mockup available</p>
            </div>
          </div>

          {/* Status and Priority */}
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
            <Badge className={getPriorityColor(job.priority)}>{job.priority}</Badge>
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User size={16} />
              <span>{job.customer}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package size={16} />
              <span>{job.quantity} units</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarBlank size={16} />
              <span>Due: {format(new Date(job.dueDate), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} />
              <span>Created: {format(new Date(job.createdAt), 'MMM d')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText size={16} />
              <span>{job.fileCount} files</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag size={16} />
              <span>${job.estimatedCost.toLocaleString()}</span>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <div className="text-sm">
              <p className="text-muted-foreground font-medium mb-1">Description</p>
              <p className="text-foreground">{job.description}</p>
            </div>
          )}

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{job.progress}%</span>
            </div>
            <Progress value={job.progress} className="h-2" />
          </div>

          {/* Quick Status Change */}
          {onStatusChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Change status:</span>
              <Select value={job.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {onPrintLabel && (
            <Button
              variant="outline"
              onClick={() => onPrintLabel(job)}
              className="gap-2"
            >
              <Printer size={16} />
              Print Label
            </Button>
          )}
          {onViewDetails && (
            <Button
              onClick={() => onViewDetails(job.id)}
              className="gap-2"
            >
              View Full Details
              <ArrowRight size={16} />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
