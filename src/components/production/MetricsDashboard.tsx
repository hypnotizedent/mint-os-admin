import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChartBar,
  Clock,
  Users,
  TrendUp,
  CurrencyDollar,
  CheckCircle,
} from '@phosphor-icons/react';
import { EmployeeMetrics } from './EmployeeMetrics';
import { TeamMetrics } from './TeamMetrics';
import { EfficiencyChart } from './EfficiencyChart';
import { Leaderboard } from './Leaderboard';
import { ReportExport } from './ReportExport';

interface DashboardOverview {
  period: 'today' | 'week' | 'month';
  currentDate: string;
  jobsToday: number;
  jobsInProgress: number;
  teamEfficiency: number;
  revenue: number;
  clockedInEmployees: number;
  averageJobTime: number;
}

export function MetricsDashboard() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'employee' | 'team' | 'leaderboard' | 'reports'>('overview');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, [period]);

  const loadOverview = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call: fetch(`/api/production/metrics/overview?period=${period}`)
      // Mock data for demonstration
      const mockOverview: DashboardOverview = {
        period,
        currentDate: new Date().toISOString(),
        jobsToday: 12,
        jobsInProgress: 5,
        teamEfficiency: 94,
        revenue: 8450,
        clockedInEmployees: 8,
        averageJobTime: 3.2,
      };
      setOverview(mockOverview);
    } catch (error) {
      console.error('Failed to load overview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading metrics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Production Metrics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={period === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('today')}
          >
            Today
          </Button>
          <Button
            variant={period === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('week')}
          >
            Week
          </Button>
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <Button
          variant={selectedView === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('overview')}
        >
          <ChartBar className="mr-2" size={16} weight="fill" />
          Overview
        </Button>
        <Button
          variant={selectedView === 'employee' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('employee')}
        >
          <Users className="mr-2" size={16} weight="fill" />
          Employee Metrics
        </Button>
        <Button
          variant={selectedView === 'team' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('team')}
        >
          <TrendUp className="mr-2" size={16} weight="fill" />
          Team Analytics
        </Button>
        <Button
          variant={selectedView === 'leaderboard' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('leaderboard')}
        >
          🏆 Leaderboard
        </Button>
        <Button
          variant={selectedView === 'reports' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('reports')}
        >
          📊 Reports
        </Button>
      </div>

      {/* Overview Content */}
      {selectedView === 'overview' && (
        <>
          {/* Real-Time Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Jobs Today</span>
                <CheckCircle size={20} weight="fill" className="text-green-600" />
              </div>
              <div className="text-3xl font-bold text-foreground">{overview.jobsToday}</div>
              <div className="text-xs text-green-600 mt-1 flex items-center">
                <TrendUp size={14} weight="bold" className="mr-1" />
                +2% from yesterday
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Team Efficiency</span>
                <ChartBar size={20} weight="fill" className="text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-foreground">{overview.teamEfficiency}%</div>
              <div className="text-xs text-green-600 mt-1 flex items-center">
                <TrendUp size={14} weight="bold" className="mr-1" />
                +2% from last period
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Revenue</span>
                <CurrencyDollar size={20} weight="fill" className="text-green-600" />
              </div>
              <div className="text-3xl font-bold text-foreground">
                ${overview.revenue.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Clocked In</span>
                <Users size={20} weight="fill" className="text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-foreground">
                {overview.clockedInEmployees}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Active employees</div>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">In Progress</span>
                <Clock size={20} weight="fill" className="text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">{overview.jobsInProgress}</div>
              <div className="text-xs text-muted-foreground mt-1">Active jobs</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Avg Job Time</span>
                <Clock size={20} weight="fill" className="text-cyan-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {overview.averageJobTime} hrs
              </div>
              <div className="text-xs text-muted-foreground mt-1">Per job</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <Badge className="bg-green-600 text-white">On Track</Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                All metrics within target range
              </div>
            </Card>
          </div>

          {/* Efficiency Trend Chart */}
          <EfficiencyChart period={period} />

          {/* Quick Leaderboard */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Top Performers (This {period === 'today' ? 'Day' : period === 'week' ? 'Week' : 'Month'})</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedView('leaderboard')}
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Sarah J.', efficiency: 98, jobs: 24, medal: '🥇' },
                { name: 'John S.', efficiency: 96, jobs: 22, medal: '🥈' },
                { name: 'Mike T.', efficiency: 94, jobs: 20, medal: '🥉' },
              ].map((performer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedEmployeeId(`emp-${index + 1}`);
                    setSelectedView('employee');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{performer.medal}</span>
                    <div>
                      <div className="font-semibold text-foreground">{performer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {performer.jobs} jobs completed
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">
                      {performer.efficiency}%
                    </div>
                    <div className="text-xs text-muted-foreground">Efficiency</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Employee Metrics View */}
      {selectedView === 'employee' && (
        <EmployeeMetrics
          employeeId={selectedEmployeeId || 'emp-1'}
          period={period}
          onBack={() => setSelectedView('overview')}
        />
      )}

      {/* Team Analytics View */}
      {selectedView === 'team' && <TeamMetrics period={period} />}

      {/* Leaderboard View */}
      {selectedView === 'leaderboard' && <Leaderboard period={period} />}

      {/* Reports View */}
      {selectedView === 'reports' && <ReportExport />}
    </div>
  );
}
