import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Warning } from '@phosphor-icons/react';

interface TeamMetricsProps {
  period: 'today' | 'week' | 'month';
}

interface TeamMetricsData {
  period: string;
  jobsCompleted: number;
  jobsPerDay: number;
  revenue: number;
  totalHoursWorked: number;
  totalEmployees: number;
  averageHoursPerEmployee: number;
  teamEfficiencyRate: number;
  bestPerformer: {
    employeeName: string;
    efficiencyRate: number;
  };
  improvementNeeded: Array<{
    employeeName: string;
    efficiencyRate: number;
  }>;
  throughputTrend: number;
  efficiencyTrend: number;
}

export function TeamMetrics({ period }: TeamMetricsProps) {
  const [metrics, setMetrics] = useState<TeamMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [period]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockMetrics: TeamMetricsData = {
        period,
        jobsCompleted: 84,
        jobsPerDay: 12,
        revenue: 45230,
        totalHoursWorked: 456,
        totalEmployees: 12,
        averageHoursPerEmployee: 38,
        teamEfficiencyRate: 94,
        bestPerformer: {
          employeeName: 'Sarah J.',
          efficiencyRate: 98,
        },
        improvementNeeded: [
          { employeeName: 'Amy K.', efficiencyRate: 78 },
        ],
        throughputTrend: 12,
        efficiencyTrend: 2,
      };
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load team metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const laborCost = metrics.totalHoursWorked * 20; // $20/hour example
  const costPerJob = laborCost / metrics.jobsCompleted;
  const revenuePerHour = metrics.revenue / metrics.totalHoursWorked;

  // Mock employee data
  const employees = [
    { name: 'Sarah J.', efficiency: 98 },
    { name: 'John S.', efficiency: 96 },
    { name: 'Mike T.', efficiency: 94 },
    { name: 'Lisa M.', efficiency: 92 },
    { name: 'Tom R.', efficiency: 90 },
    { name: 'Amy K.', efficiency: 78 },
  ];

  const jobTypeData = [
    { type: 'Screen Printing', jobs: 48, efficiency: 95 },
    { type: 'DTG', jobs: 20, efficiency: 92 },
    { type: 'Embroidery', jobs: 10, efficiency: 88 },
    { type: 'Heat Press', jobs: 6, efficiency: 97 },
  ];

  const dailyThroughput = [
    { day: 'Mon', jobs: 16 },
    { day: 'Tue', jobs: 18 },
    { day: 'Wed', jobs: 16 },
    { day: 'Thu', jobs: 18 },
    { day: 'Fri', jobs: 16 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Team Analytics</h2>
        <p className="text-muted-foreground">
          This {period === 'today' ? 'Day' : period === 'week' ? 'Week' : 'Month'}
        </p>
      </div>

      {/* Throughput */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Throughput</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Jobs Completed</div>
            <div className="text-2xl font-bold text-foreground">{metrics.jobsCompleted}</div>
            <div className="text-xs text-green-600 mt-1">+{metrics.throughputTrend}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Revenue</div>
            <div className="text-2xl font-bold text-foreground">
              ${metrics.revenue.toLocaleString()}
            </div>
            <div className="text-xs text-green-600 mt-1">+8%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Avg Jobs/Day</div>
            <div className="text-2xl font-bold text-foreground">{metrics.jobsPerDay}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Avg Revenue/Day</div>
            <div className="text-2xl font-bold text-foreground">
              ${Math.round(metrics.revenue / (period === 'today' ? 1 : period === 'week' ? 7 : 30)).toLocaleString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Labor Efficiency */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Labor Efficiency</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Total Hours Worked</div>
            <div className="text-2xl font-bold text-foreground">{metrics.totalHoursWorked}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Productive Hours</div>
            <div className="text-2xl font-bold text-foreground">428 hrs</div>
            <div className="text-xs text-muted-foreground">(94%)</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Team Efficiency</div>
            <div className="text-2xl font-bold text-green-600">
              {metrics.teamEfficiencyRate}%
            </div>
            <div className="text-xs text-green-600 mt-1">+{metrics.efficiencyTrend}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Labor Cost</div>
            <div className="text-2xl font-bold text-foreground">
              ${laborCost.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Cost per Job</div>
            <div className="text-2xl font-bold text-foreground">${Math.round(costPerJob)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Revenue per Hour</div>
            <div className="text-2xl font-bold text-foreground">
              ${Math.round(revenuePerHour)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Best Performer</div>
            <div className="text-lg font-bold text-foreground">
              {metrics.bestPerformer.employeeName}
            </div>
            <div className="text-xs text-muted-foreground">
              {metrics.bestPerformer.efficiencyRate}% efficiency
            </div>
          </div>
        </div>
      </Card>

      {/* Job Type Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Job Type Breakdown</h3>
        <div className="space-y-4">
          {jobTypeData.map((job) => (
            <div key={job.type} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{job.type}</span>
                <span className="text-sm text-muted-foreground">
                  {job.jobs} jobs | {job.efficiency}% eff.
                </span>
              </div>
              <Progress value={job.efficiency} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Daily Throughput */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Daily Throughput (This Week)
        </h3>
        <div className="space-y-3">
          {dailyThroughput.map((day) => (
            <div key={day.day} className="flex items-center gap-4">
              <div className="w-12 text-sm font-medium text-muted-foreground">{day.day}</div>
              <div className="flex-1">
                <div className="h-8 bg-primary rounded" style={{ width: `${(day.jobs / 20) * 100}%` }} />
              </div>
              <div className="w-16 text-right text-sm font-medium text-foreground">
                {day.jobs} jobs
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Efficiency by Employee */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Efficiency by Employee</h3>
        <div className="space-y-3">
          {employees.map((emp) => (
            <div key={emp.name} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-foreground">{emp.name}</div>
              <div className="flex-1">
                <Progress value={emp.efficiency} className="h-3" />
              </div>
              <div className="w-16 text-right text-sm font-medium text-foreground">
                {emp.efficiency}%
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Attention Needed */}
      {metrics.improvementNeeded.length > 0 && (
        <Card className="p-6 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <Warning size={24} weight="fill" className="text-yellow-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                ⚠️ Attention Needed
              </h3>
              <div className="space-y-2">
                {metrics.improvementNeeded.map((emp) => (
                  <div key={emp.employeeName} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">
                      {emp.employeeName} - {emp.efficiencyRate}% eff. (below 85% threshold)
                    </span>
                    <Badge variant="outline" className="text-yellow-700 border-yellow-700">
                      Review Performance
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
