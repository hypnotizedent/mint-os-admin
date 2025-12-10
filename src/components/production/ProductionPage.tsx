import { useState, useEffect, useCallback } from 'react';
import { MobileNavigation } from './mobile/MobileNavigation';
import { MobileTimeClock } from './mobile/MobileTimeClock';
import { MobileChecklist } from './mobile/MobileChecklist';
import { MobileSOPViewer } from './mobile/MobileSOPViewer';
import { OfflineIndicator } from './mobile/OfflineIndicator';
import { JobQueueDashboard } from './JobQueueDashboard';
import { SupervisorDashboard } from './SupervisorDashboard';
import { MetricsDashboard } from './MetricsDashboard';
import { SOPLibrary } from './SOPLibrary';
import { useIsMobile } from '../../hooks/use-mobile';
import { useInactivity } from '../../hooks/useInactivity';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337';

// Configuration constants
const ESTIMATED_PRINTS_PER_JOB = 100; // Placeholder until print tracking is implemented
const DEFAULT_QUALITY_RATE = 98.5; // Placeholder until quality tracking is implemented
const PLACEHOLDER_ACTIVE_JOBS_CHANGE = 2; // Would require historical data
const PLACEHOLDER_ON_SCHEDULE_CHANGE = 3; // Would require historical data
const STATS_REFRESH_INTERVAL_MS = 60000; // Refresh stats every 60 seconds

// Dashboard statistics interface
interface DashboardStats {
  activeJobs: number;
  todaysOutput: number;
  onSchedulePercent: number;
  qualityRate: number;
  activeJobsChange: number;
  onScheduleChange: number;
}

// Default stats for fallback/loading
const DEFAULT_STATS: DashboardStats = {
  activeJobs: 0,
  todaysOutput: 0,
  onSchedulePercent: 0,
  qualityRate: 0,
  activeJobsChange: 0,
  onScheduleChange: 0,
};

export const ProductionPage = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [statsLoading, setStatsLoading] = useState(true);
  const isMobile = useIsMobile();

  // Fetch dashboard statistics from API
  const fetchDashboardStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      // Fetch active orders for statistics
      const ordersRes = await fetch(`${API_URL}/api/orders?pagination[limit]=100`);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const orders = ordersData.data || [];
        
        // Calculate real statistics from order data
        const activeJobs = orders.filter((o: any) => 
          o.status === 'IN_PRODUCTION' || o.status === 'PENDING'
        ).length;
        
        const completedToday = orders.filter((o: any) => {
          const orderDate = new Date(o.updatedAt);
          const today = new Date();
          return o.status === 'COMPLETED' && 
                 orderDate.toDateString() === today.toDateString();
        }).length;

        // Calculate on-schedule percentage (jobs on time vs total)
        const totalActiveJobs = orders.filter((o: any) => 
          o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
        ).length;
        const onTimeJobs = orders.filter((o: any) => {
          if (o.status === 'COMPLETED' || o.status === 'CANCELLED') return false;
          const dueDate = new Date(o.dueDate);
          return dueDate >= new Date();
        }).length;
        const onSchedulePercent = totalActiveJobs > 0 
          ? Math.round((onTimeJobs / totalActiveJobs) * 100) 
          : 100;

        // Calculate quality rate (placeholder until quality tracking is implemented)
        const completedOrders = orders.filter((o: any) => o.status === 'COMPLETED').length;
        const qualityRate = completedOrders > 0 ? DEFAULT_QUALITY_RATE : 0;

        setStats({
          activeJobs,
          todaysOutput: completedToday * ESTIMATED_PRINTS_PER_JOB,
          onSchedulePercent,
          qualityRate,
          activeJobsChange: PLACEHOLDER_ACTIVE_JOBS_CHANGE,
          onScheduleChange: PLACEHOLDER_ON_SCHEDULE_CHANGE,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Keep default stats on error
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
    // Refresh stats at configured interval
    const interval = setInterval(fetchDashboardStats, STATS_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchDashboardStats]);

  // Auto-logout after 5 minutes of inactivity
  useInactivity({
    timeout: 5 * 60 * 1000, // 5 minutes
    onInactive: () => {
      console.log('User inactive - would logout in production');
      // In production: logout() and redirect to login
    }
  });

  // Handle job selection - navigate to queue view with job selected
  const handleJobSelect = useCallback((jobId: string) => {
    setSelectedJobId(jobId);
    // Navigate to queue page with job details panel open
    setCurrentPage('queue');
    // Show job details toast or panel
    console.log('Job selected:', jobId, '- Navigating to queue with job details');
  }, []);

  const renderPage = () => {
    // Use mobile-optimized components on mobile devices
    if (isMobile) {
      switch (currentPage) {
        case 'time-clock':
          return <MobileTimeClock />;
        case 'checklists':
          return <MobileChecklist />;
        case 'sops':
          return <MobileSOPViewer />;
        case 'dashboard':
        case 'supervisor':
          return <SupervisorDashboard onNavigate={setCurrentPage} />;
        case 'queue':
          return <JobQueueDashboard onJobSelect={handleJobSelect} />;
        case 'team-metrics':
          return <MetricsDashboard />;
        default:
          return <SupervisorDashboard onNavigate={setCurrentPage} />;
      }
    }

    // Desktop views with full features
    switch (currentPage) {
      case 'time-clock':
        return <MobileTimeClock />;
      case 'checklists':
        return <MobileChecklist />;
      case 'sops':
        return <SOPLibrary />;
      case 'queue':
        return <JobQueueDashboard onJobSelect={handleJobSelect} />;
      case 'supervisor':
        return <SupervisorDashboard onNavigate={setCurrentPage} />;
      case 'team-metrics':
      case 'reports':
        return <MetricsDashboard />;
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Quick Overview */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Production Dashboard</h1>
                <p className="text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border-2 border-border rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Jobs</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {statsLoading ? '...' : stats.activeJobs}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.activeJobsChange >= 0 ? '+' : ''}{stats.activeJobsChange} from yesterday
                </p>
              </div>
              <div className="bg-card border-2 border-border rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Today's Output</h3>
                <p className="text-3xl font-bold text-green-600">
                  {statsLoading ? '...' : stats.todaysOutput.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">prints completed</p>
              </div>
              <div className="bg-card border-2 border-border rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">On Schedule</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {statsLoading ? '...' : `${stats.onSchedulePercent}%`}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.onScheduleChange >= 0 ? '+' : ''}{stats.onScheduleChange}% this week
                </p>
              </div>
              <div className="bg-card border-2 border-border rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Quality Rate</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {statsLoading ? '...' : `${stats.qualityRate}%`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">target: 98%</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => setCurrentPage('queue')}
                className="bg-card border-2 border-border rounded-lg p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-2xl mb-2 block">📋</span>
                <span className="font-medium text-foreground">Job Queue</span>
                <p className="text-xs text-muted-foreground">View & manage jobs</p>
              </button>
              <button
                onClick={() => setCurrentPage('time-clock')}
                className="bg-card border-2 border-border rounded-lg p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-2xl mb-2 block">⏱️</span>
                <span className="font-medium text-foreground">Time Clock</span>
                <p className="text-xs text-muted-foreground">Clock in/out</p>
              </button>
              <button
                onClick={() => setCurrentPage('checklists')}
                className="bg-card border-2 border-border rounded-lg p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-2xl mb-2 block">✅</span>
                <span className="font-medium text-foreground">Checklists</span>
                <p className="text-xs text-muted-foreground">Quality checks</p>
              </button>
              <button
                onClick={() => setCurrentPage('sops')}
                className="bg-card border-2 border-border rounded-lg p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-2xl mb-2 block">📚</span>
                <span className="font-medium text-foreground">SOPs</span>
                <p className="text-xs text-muted-foreground">Procedures</p>
              </button>
            </div>

            {/* Supervisor Section */}
            <div className="bg-card border-2 border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Supervisor Overview</h2>
                <button
                  onClick={() => setCurrentPage('supervisor')}
                  className="text-sm text-primary hover:underline"
                >
                  Full Dashboard →
                </button>
              </div>
              <SupervisorDashboard onNavigate={setCurrentPage} />
            </div>
          </div>
        );
      default:
        return <SupervisorDashboard onNavigate={setCurrentPage} />;
    }
  };

  // Extended navigation items for desktop
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'queue', label: 'Job Queue', icon: '📋' },
    { id: 'time-clock', label: 'Time Clock', icon: '⏱️' },
    { id: 'checklists', label: 'Checklists', icon: '✅' },
    { id: 'sops', label: 'SOPs', icon: '📚' },
    { id: 'supervisor', label: 'Supervisor', icon: '👁️' },
    { id: 'team-metrics', label: 'Metrics', icon: '📊' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Navigation */}
      {!isMobile && (
        <div className="hidden md:flex md:flex-col w-20 lg:w-56 bg-card border-r border-border">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground hidden lg:block">Production</h2>
            <span className="text-2xl lg:hidden">🏭</span>
          </div>
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="hidden lg:block font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNavigation currentPage={currentPage} onNavigate={setCurrentPage} />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>

      <OfflineIndicator />
    </div>
  );
};
