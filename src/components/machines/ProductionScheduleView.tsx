/**
 * ProductionScheduleView - Daily machine job queue visualization
 * 
 * Shows production staff what jobs are scheduled for each machine today.
 * Admin can plan/assign jobs to machines, production staff see read-only view.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Printer, 
  Clock, 
  Package, 
  User, 
  ArrowRight,
  CaretLeft,
  CaretRight,
  FolderOpen,
  FileText,
  CheckCircle,
  Circle,
  Play
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1337';

// Machine types we support
type MachineType = 'screen-printing' | 'embroidery' | 'dtg' | 'heat-transfer' | 'cutting';

interface ScheduledJob {
  id: string;
  orderNumber: string;
  customerName: string;
  description: string;
  quantity: number;
  printLocations: string[];
  inkColors: number;
  status: 'pending' | 'in-progress' | 'completed';
  estimatedTime: number; // minutes
  artworkReady: boolean;
  garmentsPulled: boolean;
  priority: 'normal' | 'rush' | 'urgent';
  dueDate: string;
  notes?: string;
}

interface Machine {
  id: string;
  name: string;
  type: MachineType;
  status: 'idle' | 'running' | 'maintenance' | 'offline';
  hotFolderPath?: string; // Path where files should be dropped
  scheduledJobs: ScheduledJob[];
  completedToday: number;
  currentJobProgress?: number;
}

const MACHINE_TYPE_LABELS: Record<MachineType, string> = {
  'screen-printing': 'Screen Printing',
  'embroidery': 'Embroidery',
  'dtg': 'DTG Printing',
  'heat-transfer': 'Heat Transfer',
  'cutting': 'Cutting'
};

const STATUS_COLORS: Record<string, string> = {
  'idle': 'bg-green-500',
  'running': 'bg-blue-500',
  'maintenance': 'bg-yellow-500',
  'offline': 'bg-gray-500'
};

const PRIORITY_COLORS: Record<string, string> = {
  'normal': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  'rush': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'urgent': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

interface ProductionScheduleViewProps {
  onViewJob?: (orderId: string) => void;
}

export function ProductionScheduleView({ onViewJob }: ProductionScheduleViewProps) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'schedule' | 'timeline'>('schedule');
  const [isAdmin] = useState(true); // Will come from auth context
  const [isLoadingMachines, setIsLoadingMachines] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch machines from API
  useEffect(() => {
    const fetchMachines = async () => {
      setIsLoadingMachines(true);
      try {
        // TODO: Create 'machine' content type in Strapi with fields:
        // - name, type, status, hotFolderPath, currentJobProgress, completedToday
        // - Relation to scheduledJobs (many jobs)
        // Then implement API call here:
        // const response = await fetch(`${API_BASE}/api/machines?populate[scheduledJobs][populate]=*&filters[scheduledDate][$eq]=${selectedDate.toISOString().split('T')[0]}`);
        
        // For now, machines remain empty until Strapi content type is created
        setMachines([]);
      } catch (err) {
        console.error('Failed to fetch machines:', err);
        setError(err instanceof Error ? err.message : 'Failed to load machines');
        setMachines([]);
      } finally {
        setIsLoadingMachines(false);
      }
    };
    
    fetchMachines();
  }, [selectedDate]);

  const handleJobClick = (job: ScheduledJob) => {
    if (onViewJob) {
      // Use job.id for navigation but show orderNumber in UI for consistency with how users identify jobs
      onViewJob(job.id);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const getTotalScheduledTime = (machine: Machine) => {
    return machine.scheduledJobs.reduce((sum, job) => sum + job.estimatedTime, 0);
  };

  const getCompletionPercentage = (machine: Machine) => {
    const total = machine.scheduledJobs.length;
    if (total === 0) return 100;
    const completed = machine.scheduledJobs.filter(j => j.status === 'completed').length;
    return Math.round((completed / total) * 100);
  };

  // Show loading state
  if (isLoadingMachines) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Production Schedule</h1>
            <p className="text-muted-foreground mt-1">Loading production schedule...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Production Schedule</h1>
            <p className="text-muted-foreground mt-1">Error loading schedule</p>
          </div>
        </div>
        <Card className="p-6">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Production Schedule</h1>
          <p className="text-muted-foreground mt-1">View and manage today's production queue</p>
        </div>
        
        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
            <CaretLeft size={20} />
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-card border rounded-lg">
            <Calendar size={20} className="text-muted-foreground" />
            <span className="font-medium">{formatDate(selectedDate)}</span>
          </div>
          <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
            <CaretRight size={20} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Package size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">
                  {machines.reduce((sum, m) => sum + m.scheduledJobs.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {machines.reduce((sum, m) => sum + m.completedToday, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Printer size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Machines Active</p>
                <p className="text-2xl font-bold">
                  {machines.filter(m => m.status === 'running').length}/{machines.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
                <Clock size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Work Time</p>
                <p className="text-2xl font-bold">
                  {Math.round(machines.reduce((sum, m) => sum + getTotalScheduledTime(m), 0) / 60)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Machine Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {machines.map((machine) => (
          <Card key={machine.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-3 h-3 rounded-full animate-pulse',
                    STATUS_COLORS[machine.status]
                  )} />
                  <div>
                    <CardTitle className="text-lg">{machine.name}</CardTitle>
                    <CardDescription>{MACHINE_TYPE_LABELS[machine.type]}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">{machine.status}</Badge>
              </div>
              
              {/* Progress for current job */}
              {machine.status === 'running' && machine.currentJobProgress !== undefined && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Current Job Progress</span>
                    <span className="font-medium">{machine.currentJobProgress}%</span>
                  </div>
                  <Progress value={machine.currentJobProgress} className="h-2" />
                </div>
              )}
            </CardHeader>
            
            <CardContent className="space-y-3">
              {machine.scheduledJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Circle size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No jobs scheduled</p>
                  {isAdmin && (
                    <Button variant="outline" size="sm" className="mt-3">
                      Assign Jobs
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {machine.scheduledJobs.map((job, index) => (
                    <div
                      key={job.id}
                      className={cn(
                        'p-3 rounded-lg border transition-colors cursor-pointer',
                        job.status === 'in-progress' 
                          ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' 
                          : 'bg-card hover:bg-muted/50'
                      )}
                      onClick={() => {
                        handleJobClick(job);
                        toast.info(`Viewing Order #${job.orderNumber}`, {
                          description: `${job.customerName} - ${job.description}`
                        });
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                          {job.status === 'in-progress' && (
                            <Play size={16} className="text-blue-600" weight="fill" />
                          )}
                        </div>
                        <Badge className={PRIORITY_COLORS[job.priority]}>
                          {job.priority}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 ml-6">
                        <p className="font-medium text-sm">#{job.orderNumber} - {job.customerName}</p>
                        <p className="text-xs text-muted-foreground">{job.description}</p>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Package size={12} />
                            {job.quantity} pcs
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            ~{job.estimatedTime}m
                          </span>
                        </div>
                        
                        {/* Readiness indicators */}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'text-xs',
                              job.artworkReady 
                                ? 'border-green-500 text-green-600' 
                                : 'border-red-500 text-red-600'
                            )}
                          >
                            <FileText size={10} className="mr-1" />
                            {job.artworkReady ? 'Art Ready' : 'Art Needed'}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'text-xs',
                              job.garmentsPulled 
                                ? 'border-green-500 text-green-600' 
                                : 'border-yellow-500 text-yellow-600'
                            )}
                          >
                            <Package size={10} className="mr-1" />
                            {job.garmentsPulled ? 'Pulled' : 'Pull Garments'}
                          </Badge>
                        </div>

                        {job.notes && (
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 italic">
                            ⚠️ {job.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hot folder info for admin */}
              {isAdmin && machine.hotFolderPath && (
                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FolderOpen size={14} />
                    <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
                      {machine.hotFolderPath}
                    </code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span className="font-medium text-muted-foreground">Status:</span>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', color)} />
              <span className="capitalize">{status}</span>
            </div>
          ))}
          <span className="border-l pl-6 font-medium text-muted-foreground">Priority:</span>
          {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
            <Badge key={priority} className={cn('capitalize', color)}>
              {priority}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
