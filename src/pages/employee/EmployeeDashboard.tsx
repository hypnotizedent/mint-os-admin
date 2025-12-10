/**
 * Employee Dashboard
 * Modern design with job cards, clock in/out, and mobile-friendly layout
 * Filtered view showing ONLY jobs assigned to current employee
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Printer,
  QrCode,
  AlertTriangle,
  ChevronRight,
  Zap,
  Camera,
  Upload,
  Play,
  Pause,
  MoreHorizontal
} from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

// Types
interface EmployeeJob {
  id: string;
  jobNumber: string;
  customerFirstName: string;
  itemDescription: string;
  quantity: number;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'normal' | 'high' | 'urgent';
  machine?: string;
  progress?: number;
}

interface EmployeeStats {
  assignedJobs: number;
  completedToday: number;
  inProgress: number;
  currentMachine?: string;
}

// Mock data for employee jobs - will be replaced with API call
const mockEmployeeJobs: EmployeeJob[] = [
  {
    id: '1',
    jobNumber: 'JOB-2024-001',
    customerFirstName: 'John',
    itemDescription: 'Custom T-Shirts - Black, Size L',
    quantity: 50,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'in_progress',
    priority: 'urgent',
    machine: 'DTG-01',
    progress: 65
  },
  {
    id: '2',
    jobNumber: 'JOB-2024-002',
    customerFirstName: 'Sarah',
    itemDescription: 'Embroidered Polo Shirts - Navy',
    quantity: 25,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    priority: 'normal',
    progress: 0
  },
  {
    id: '3',
    jobNumber: 'JOB-2024-003',
    customerFirstName: 'Mike',
    itemDescription: 'Screen Print Hoodies - Red',
    quantity: 100,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    priority: 'high',
    progress: 0
  }
];

// Format date for display
function formatDueDate(isoDate: string): string {
  const date = new Date(isoDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

// Status badge component
function StatusBadge({ status }: { status: EmployeeJob['status'] }) {
  const config = {
    pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
    in_progress: { label: 'In Progress', className: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
    completed: { label: 'Completed', className: 'bg-green-500/10 text-green-600 border-green-500/30' }
  };
  
  const { label, className } = config[status];
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

// Priority indicator
function PriorityIndicator({ priority }: { priority: EmployeeJob['priority'] }) {
  if (priority === 'normal') return null;
  
  return (
    <Badge className={priority === 'urgent' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}>
      <Zap className="w-3 h-3 mr-1 fill-current" />
      {priority === 'urgent' ? 'Urgent' : 'High'}
    </Badge>
  );
}

// Modern Job card component
function JobCard({ job, onMarkComplete, onReportIssue, onStartJob }: { 
  job: EmployeeJob; 
  onMarkComplete: (id: string) => void;
  onReportIssue: (id: string) => void;
  onStartJob?: (id: string) => void;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="group"
    >
      <Card className="overflow-hidden hover:shadow-md transition-all duration-200 border-border/50">
        <CardContent className="p-0">
          {/* Progress bar at top */}
          {job.status === 'in_progress' && job.progress !== undefined && (
            <div className="h-1 bg-muted">
              <motion.div 
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${job.progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          )}
          
          <div className="p-4 space-y-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-semibold text-sm">{job.jobNumber}</span>
                <StatusBadge status={job.status} />
                <PriorityIndicator priority={job.priority} />
              </div>
              {job.machine && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                  <Printer className="w-3.5 h-3.5" />
                  {job.machine}
                </div>
              )}
            </div>
            
            {/* Job details */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Customer: <span className="text-foreground">{job.customerFirstName}</span>
              </p>
              <p className="font-medium text-foreground">{job.itemDescription}</p>
            </div>
            
            {/* Quantity and due date */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary text-xs">{job.quantity}</span>
                </div>
                <span className="text-muted-foreground text-xs">units</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-xs">{formatDueDate(job.dueDate)}</span>
              </div>
            </div>
            
            {/* Action buttons - touch friendly */}
            <div className="flex gap-2 pt-2">
              {job.status === 'pending' && onStartJob && (
                <Button 
                  size="lg" 
                  className="flex-1 h-11"
                  onClick={() => onStartJob(job.id)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Job
                </Button>
              )}
              {job.status === 'in_progress' && (
                <Button 
                  size="lg" 
                  className="flex-1 h-11"
                  onClick={() => onMarkComplete(job.id)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Complete
                </Button>
              )}
              <Button 
                variant="outline" 
                size="lg" 
                className="h-11 px-4"
                onClick={() => onReportIssue(job.id)}
              >
                <AlertTriangle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11 px-4"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function EmployeeDashboard() {
  const { employee } = useAuth();
  const [jobs, setJobs] = useState<EmployeeJob[]>([]);
  const [stats, setStats] = useState<EmployeeStats>({
    assignedJobs: 0,
    completedToday: 0,
    inProgress: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState<Date | null>(null);

  // Fetch employee jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setJobs(mockEmployeeJobs);
        
        // Calculate stats
        const assigned = mockEmployeeJobs.filter(j => j.status !== 'completed').length;
        const completed = mockEmployeeJobs.filter(j => j.status === 'completed').length;
        const inProgress = mockEmployeeJobs.filter(j => j.status === 'in_progress').length;
        const currentJob = mockEmployeeJobs.find(j => j.status === 'in_progress');
        
        setStats({
          assignedJobs: assigned,
          completedToday: completed,
          inProgress: inProgress,
          currentMachine: currentJob?.machine
        });
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [employee?.documentId]);

  const handleMarkComplete = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'completed' as const, progress: 100 } : job
    ));
  };

  const handleStartJob = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'in_progress' as const, progress: 5 } : job
    ));
  };

  const handleReportIssue = (jobId: string) => {
    // TODO: Implement issue reporting
    toast.error('Issue reporting not yet implemented');
  };

  const handleScanQR = () => {
    console.log('Open QR scanner');
  };

  const handleClockToggle = () => {
    if (isClockedIn) {
      setIsClockedIn(false);
      setClockTime(null);
    } else {
      setIsClockedIn(true);
      setClockTime(new Date());
    }
  };

  // Filter active jobs (not completed)
  const activeJobs = jobs.filter(j => j.status !== 'completed');

  return (
    <motion.div 
      className="p-4 lg:p-6 lg:pt-6 pt-20 pb-24 lg:pb-6 max-w-4xl mx-auto"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {/* Welcome message */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Welcome, {employee?.firstName || 'Employee'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeJobs.length} jobs assigned to you
            </p>
          </div>
          <Button
            variant={isClockedIn ? "outline" : "default"}
            size="lg"
            className={`gap-2 ${isClockedIn ? 'border-green-500 text-green-600' : ''}`}
            onClick={handleClockToggle}
          >
            {isClockedIn ? (
              <>
                <Pause className="w-4 h-4" />
                Clock Out
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Clock In
              </>
            )}
          </Button>
        </div>
        {isClockedIn && clockTime && (
          <Badge variant="secondary" className="mt-2 gap-1">
            <Clock className="w-3 h-3" />
            Clocked in at {clockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Badge>
        )}
      </motion.div>

      {/* Stats cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Assigned</span>
            </div>
            <p className="text-2xl font-semibold">{stats.assignedJobs}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-semibold">{stats.completedToday}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">In Progress</span>
            </div>
            <p className="text-2xl font-semibold">{stats.inProgress}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Printer className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Machine</span>
            </div>
            <p className="text-lg font-semibold truncate">{stats.currentMachine || '-'}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="flex gap-2 mb-6">
        <Button 
          variant="outline" 
          size="lg" 
          className="flex-1 h-12 gap-2"
          onClick={handleScanQR}
        >
          <QrCode className="h-5 w-5" />
          Scan Job QR
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="h-12 px-4"
        >
          <Upload className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Jobs list */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Your Jobs</h2>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm text-muted-foreground">
                You have no pending jobs assigned to you.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                onMarkComplete={handleMarkComplete}
                onReportIssue={handleReportIssue}
                onStartJob={handleStartJob}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default EmployeeDashboard;
