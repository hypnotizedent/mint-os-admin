/**
 * Job Queue Dashboard Component
 * Real-time production queue with priority ordering
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Queue,
  Clock,
  Fire,
  CheckCircle,
  Circle,
  Warning,
  MagnifyingGlass,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
} from '@phosphor-icons/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337';

// Time constants
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR;

// Default values
const DEFAULT_ESTIMATED_TIME_MINUTES = 120;
const DEFAULT_PAGINATION_LIMIT = 50;
const REFRESH_INTERVAL_MS = 30000;

interface QueueJob {
  id: string;
  orderNumber: string;
  customer: string;
  jobType: string;
  status: 'pending' | 'in-progress' | 'paused' | 'completed';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  dueDate: string;
  estimatedTime: number; // minutes
  assignedTo?: string;
  progress?: number;
}

interface JobQueueDashboardProps {
  onJobSelect?: (jobId: string) => void;
}

export function JobQueueDashboard({ onJobSelect }: JobQueueDashboardProps) {
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'customer'>('priority');

  useEffect(() => {
    loadQueue();
    // Set up polling for real-time updates
    const interval = setInterval(loadQueue, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      // Fetch jobs from Strapi API
      const response = await fetch(`${API_URL}/api/orders?populate=customer&pagination[limit]=${DEFAULT_PAGINATION_LIMIT}&sort=dueDate:asc`);
      if (response.ok) {
        const data = await response.json();
        const transformedJobs: QueueJob[] = (data.data || []).map((order: any) => ({
          id: order.documentId || order.id.toString(),
          orderNumber: order.orderNumber || `ORD-${order.id}`,
          customer: order.customer?.name || 'Unknown Customer',
          jobType: getJobType(order),
          status: mapStatus(order.status),
          priority: getPriority(order),
          dueDate: order.dueDate || new Date().toISOString(),
          estimatedTime: DEFAULT_ESTIMATED_TIME_MINUTES,
          assignedTo: order.assignedTo || undefined,
          progress: getProgress(order.status),
        }));
        setJobs(transformedJobs);
      } else {
        // Use mock data if API fails
        setJobs(getMockJobs());
      }
    } catch (error) {
      console.error('Failed to load queue:', error);
      setJobs(getMockJobs());
    } finally {
      setLoading(false);
    }
  };

  const getJobType = (order: any): string => {
    if (order.items && order.items.length > 0) {
      return order.items[0].type || 'Screen Printing';
    }
    return 'Screen Printing';
  };

  const mapStatus = (status: string): QueueJob['status'] => {
    const statusMap: Record<string, QueueJob['status']> = {
      'QUOTE': 'pending',
      'QUOTE_SENT': 'pending',
      'PENDING': 'pending',
      'IN_PRODUCTION': 'in-progress',
      'PAUSED': 'paused',
      'COMPLETED': 'completed',
      'INVOICE PAID': 'completed',
    };
    return statusMap[status] || 'pending';
  };

  const getPriority = (order: any): QueueJob['priority'] => {
    const dueDate = new Date(order.dueDate);
    const now = new Date();
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / MILLISECONDS_PER_HOUR;
    
    // Priority thresholds in hours
    const URGENT_THRESHOLD = HOURS_PER_DAY; // 24 hours
    const HIGH_THRESHOLD = HOURS_PER_DAY * 2; // 48 hours
    const NORMAL_THRESHOLD = HOURS_PER_DAY * 7; // 168 hours (1 week)
    
    if (hoursUntilDue < URGENT_THRESHOLD) return 'urgent';
    if (hoursUntilDue < HIGH_THRESHOLD) return 'high';
    if (hoursUntilDue < NORMAL_THRESHOLD) return 'normal';
    return 'low';
  };

  const getProgress = (status: string): number => {
    const progressMap: Record<string, number> = {
      'QUOTE': 0,
      'QUOTE_SENT': 10,
      'PENDING': 20,
      'IN_PRODUCTION': 60,
      'COMPLETED': 100,
      'INVOICE PAID': 100,
    };
    return progressMap[status] || 0;
  };

  const getMockJobs = (): QueueJob[] => [
    {
      id: '1',
      orderNumber: '12345',
      customer: 'ABC Company',
      jobType: 'Screen Printing',
      status: 'in-progress',
      priority: 'urgent',
      dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      estimatedTime: 90,
      assignedTo: 'Sarah J.',
      progress: 65,
    },
    {
      id: '2',
      orderNumber: '12346',
      customer: 'XYZ Corp',
      jobType: 'DTG',
      status: 'pending',
      priority: 'high',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      estimatedTime: 120,
    },
    {
      id: '3',
      orderNumber: '12347',
      customer: 'Smith LLC',
      jobType: 'Embroidery',
      status: 'pending',
      priority: 'normal',
      dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      estimatedTime: 180,
    },
    {
      id: '4',
      orderNumber: '12348',
      customer: 'Local Shop',
      jobType: 'Heat Press',
      status: 'completed',
      priority: 'normal',
      dueDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      estimatedTime: 60,
      progress: 100,
    },
  ];

  const getPriorityIcon = (priority: QueueJob['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Fire size={20} weight="fill" className="text-red-600" />;
      case 'high':
        return <ArrowUp size={20} weight="bold" className="text-orange-500" />;
      case 'normal':
        return <Circle size={20} className="text-blue-500" />;
      case 'low':
        return <ArrowDown size={20} className="text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority: QueueJob['priority']) => {
    const variants: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      normal: 'bg-blue-100 text-blue-800 border-blue-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return variants[priority];
  };

  const getStatusBadge = (status: QueueJob['status']) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      paused: 'bg-orange-100 text-orange-800 border-orange-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
    };
    return variants[status];
  };

  const getTimeRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    
    if (diff < 0) {
      const overdue = Math.abs(diff);
      const hours = Math.floor(overdue / MILLISECONDS_PER_HOUR);
      return { text: `${hours}h overdue`, isOverdue: true };
    }
    
    const hours = Math.floor(diff / MILLISECONDS_PER_HOUR);
    const days = Math.floor(hours / HOURS_PER_DAY);
    
    if (days > 0) {
      return { text: `${days}d ${hours % HOURS_PER_DAY}h`, isOverdue: false };
    }
    return { text: `${hours}h`, isOverdue: false };
  };

  // Filter and sort jobs
  const filteredJobs = jobs
    .filter(job => {
      if (filter !== 'all' && job.status !== filter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          job.orderNumber.toLowerCase().includes(query) ||
          job.customer.toLowerCase().includes(query) ||
          job.jobType.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return a.customer.localeCompare(b.customer);
    });

  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'pending').length,
    inProgress: jobs.filter(j => j.status === 'in-progress').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    urgent: jobs.filter(j => j.priority === 'urgent').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading queue...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Queue size={32} weight="fill" className="text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Production Queue</h2>
            <p className="text-muted-foreground">{stats.total} jobs total</p>
          </div>
        </div>
        <Button onClick={loadQueue} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold text-foreground">{stats.pending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Urgent</div>
          <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
        </Card>
        <Card className="p-4 hidden md:block">
          <div className="text-sm text-muted-foreground">Avg. Time</div>
          <div className="text-2xl font-bold text-foreground">2.5h</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'in-progress', 'completed'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
            </Button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 border rounded-md bg-background text-foreground"
        >
          <option value="priority">Sort by Priority</option>
          <option value="dueDate">Sort by Due Date</option>
          <option value="customer">Sort by Customer</option>
        </select>
      </div>

      {/* Job List */}
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No jobs found matching your criteria
          </Card>
        ) : (
          filteredJobs.map((job) => {
            const timeRemaining = getTimeRemaining(job.dueDate);
            
            return (
              <Card
                key={job.id}
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                  job.priority === 'urgent' ? 'border-red-200 bg-red-50/50 dark:bg-red-950/10' : ''
                }`}
                onClick={() => onJobSelect?.(job.id)}
              >
                <div className="flex items-center gap-4">
                  {/* Priority Icon */}
                  <div className="flex-shrink-0">
                    {getPriorityIcon(job.priority)}
                  </div>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-foreground">#{job.orderNumber}</span>
                      <Badge className={getPriorityBadge(job.priority)}>
                        {job.priority}
                      </Badge>
                      <Badge className={getStatusBadge(job.status)}>
                        {job.status === 'in-progress' ? 'In Progress' : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {job.customer} • {job.jobType}
                    </div>
                    {job.assignedTo && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Assigned to: {job.assignedTo}
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  {job.status === 'in-progress' && job.progress !== undefined && (
                    <div className="hidden sm:flex items-center gap-2 min-w-[100px]">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground w-10">
                        {job.progress}%
                      </span>
                    </div>
                  )}

                  {/* Time */}
                  <div className="text-right flex-shrink-0">
                    <div className={`flex items-center gap-1 ${timeRemaining.isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {timeRemaining.isOverdue ? (
                        <Warning size={16} weight="fill" />
                      ) : (
                        <Clock size={16} />
                      )}
                      <span className="text-sm font-medium">{timeRemaining.text}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Est. {Math.round(job.estimatedTime / 60)}h
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {job.status === 'pending' && (
                      <Button size="sm" variant="outline" className="hidden sm:flex">
                        <Play size={16} className="mr-1" />
                        Start
                      </Button>
                    )}
                    {job.status === 'in-progress' && (
                      <Button size="sm" variant="outline" className="hidden sm:flex">
                        <Pause size={16} className="mr-1" />
                        Pause
                      </Button>
                    )}
                    {job.status === 'completed' && (
                      <CheckCircle size={24} weight="fill" className="text-green-600" />
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
