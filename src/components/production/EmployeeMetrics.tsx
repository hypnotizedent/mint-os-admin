import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, CheckCircle, Fire } from '@phosphor-icons/react';

interface EmployeeMetricsProps {
  employeeId: string;
  period: 'today' | 'week' | 'month';
  onBack: () => void;
}

interface EmployeeMetricsData {
  employeeId: string;
  employeeName: string;
  period: string;
  hoursWorked: number;
  productiveHours: number;
  breakTime: number;
  jobsCompleted: number;
  jobsInProgress: number;
  averageJobTime: number;
  estimatedHours: number;
  actualHours: number;
  efficiencyRate: number;
  reworkRate: number;
  errorCount: number;
  rank: number;
  topSkills: string[];
}

export function EmployeeMetrics({ employeeId, period, onBack }: EmployeeMetricsProps) {
  const [metrics, setMetrics] = useState<EmployeeMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [employeeId, period]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockMetrics: EmployeeMetricsData = {
        employeeId,
        employeeName: 'Sarah Johnson',
        period,
        hoursWorked: 38.5,
        productiveHours: 36.0,
        breakTime: 2.5,
        jobsCompleted: 24,
        jobsInProgress: 1,
        averageJobTime: 90, // minutes
        estimatedHours: 36.0,
        actualHours: 36.7,
        efficiencyRate: 98,
        reworkRate: 2,
        errorCount: 0,
        rank: 1,
        topSkills: ['Screen Printing', 'Folding', 'Quality Check'],
      };
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load employee metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const productivityPercent = (metrics.productiveHours / metrics.hoursWorked) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={20} weight="bold" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Employee Metrics: {metrics.employeeName}
          </h2>
          <p className="text-muted-foreground">
            This {period === 'today' ? 'Day' : period === 'week' ? 'Week' : 'Month'}
          </p>
        </div>
        {metrics.efficiencyRate >= 95 && (
          <Badge className="bg-orange-600 text-white ml-auto">
            <Fire size={16} weight="fill" className="mr-1" />
            Top Performer
          </Badge>
        )}
      </div>

      {/* Performance Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Performance Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Hours Worked</div>
            <div className="text-2xl font-bold text-foreground">{metrics.hoursWorked} hrs</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Productive Time</div>
            <div className="text-2xl font-bold text-foreground">
              {metrics.productiveHours} hrs
            </div>
            <div className="text-xs text-muted-foreground">
              ({productivityPercent.toFixed(1)}%)
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Break Time</div>
            <div className="text-2xl font-bold text-foreground">{metrics.breakTime} hrs</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Jobs Completed</div>
            <div className="text-2xl font-bold text-foreground">{metrics.jobsCompleted}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Avg Job Time</div>
            <div className="text-2xl font-bold text-foreground">
              {(metrics.averageJobTime / 60).toFixed(1)} hrs
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Efficiency Rate</div>
            <div className="text-2xl font-bold text-green-600 flex items-center">
              {metrics.efficiencyRate}%
              {metrics.efficiencyRate >= 95 && (
                <Fire size={24} weight="fill" className="ml-1 text-orange-600" />
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Team Rank</div>
            <div className="text-2xl font-bold text-foreground">#{metrics.rank} of 12</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Rework Rate</div>
            <div className="text-2xl font-bold text-foreground">{metrics.reworkRate}%</div>
          </div>
        </div>
      </Card>

      {/* Job Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Job Breakdown</h3>
        <div className="space-y-4">
          {metrics.topSkills.map((skill, index) => {
            const jobCount = index === 0 ? 15 : index === 1 ? 6 : 3;
            const efficiency = index === 0 ? 98 : index === 1 ? 99 : 95;
            
            return (
              <div key={skill} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{skill}</span>
                  <span className="text-sm text-muted-foreground">
                    {jobCount} jobs | {efficiency}% eff.
                  </span>
                </div>
                <Progress value={efficiency} className="h-2" />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Jobs */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Jobs (Last 5)</h3>
        <div className="space-y-3">
          {[
            { order: '#12345', type: 'Screen Print', time: 1.2, efficiency: 105 },
            { order: '#12344', type: 'Folding', time: 0.8, efficiency: 100 },
            { order: '#12343', type: 'Screen Print', time: 1.5, efficiency: 95 },
            { order: '#12342', type: 'Quality', time: 0.5, efficiency: 100 },
            { order: '#12341', type: 'Screen Print', time: 1.8, efficiency: 89 },
          ].map((job) => (
            <div
              key={job.order}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CheckCircle
                  size={20}
                  weight="fill"
                  className={job.efficiency >= 95 ? 'text-green-600' : 'text-yellow-600'}
                />
                <div>
                  <div className="font-medium text-foreground">Order {job.order}</div>
                  <div className="text-sm text-muted-foreground">{job.type}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-foreground">{job.time}h</div>
                <div className="text-sm text-muted-foreground">{job.efficiency}% eff.</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Efficiency Trend (simplified) */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Efficiency Trend (Last 30 Days)
        </h3>
        <div className="h-32 flex items-end gap-2">
          {[95, 96, 98, 97, 98, 99, 98].map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-primary rounded-t"
                style={{ height: `${value}%` }}
              />
              <div className="text-xs text-muted-foreground">Wk{index + 1}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
