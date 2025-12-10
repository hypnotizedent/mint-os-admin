/**
 * Supervisor Dashboard Component
 * Mobile-first oversight dashboard with bottleneck detection
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  Warning,
  Clock,
  Users,
  TrendUp,
  CheckCircle,
  XCircle,
  Bell,
  ChartBar,
  ArrowRight,
} from '@phosphor-icons/react';

interface SupervisorDashboardProps {
  onNavigate?: (page: string) => void;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface BottleneckInfo {
  area: string;
  severity: 'low' | 'medium' | 'high';
  affectedJobs: number;
  waitTime: number;
  recommendation: string;
}

interface StaffStatus {
  id: string;
  name: string;
  status: 'working' | 'break' | 'idle' | 'offline';
  currentJob?: string;
  efficiency: number;
  hoursToday: number;
}

export function SupervisorDashboard({ onNavigate }: SupervisorDashboardProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [bottlenecks, setBottlenecks] = useState<BottleneckInfo[]>([]);
  const [staff, setStaff] = useState<StaffStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const dataTimer = setInterval(loadDashboardData, 60000);
    return () => {
      clearInterval(timer);
      clearInterval(dataTimer);
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data - in production, these would be API calls
      setAlerts([
        {
          id: '1',
          type: 'warning',
          title: 'Job Running Behind',
          message: 'Order #12345 is 30 minutes behind schedule',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          acknowledged: false,
        },
        {
          id: '2',
          type: 'error',
          title: 'Equipment Issue',
          message: 'Press #2 requires maintenance - low ink levels',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          acknowledged: false,
        },
        {
          id: '3',
          type: 'info',
          title: 'Rush Order',
          message: 'New rush order #12350 added to queue',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          acknowledged: true,
        },
      ]);

      setBottlenecks([
        {
          area: 'Screen Printing',
          severity: 'high',
          affectedJobs: 4,
          waitTime: 45,
          recommendation: 'Consider reallocating staff from DTG',
        },
        {
          area: 'Quality Check',
          severity: 'medium',
          affectedJobs: 2,
          waitTime: 20,
          recommendation: 'Assign additional QC reviewer',
        },
      ]);

      setStaff([
        { id: '1', name: 'Sarah J.', status: 'working', currentJob: '#12345', efficiency: 98, hoursToday: 6.5 },
        { id: '2', name: 'John S.', status: 'working', currentJob: '#12346', efficiency: 94, hoursToday: 6.0 },
        { id: '3', name: 'Mike T.', status: 'break', efficiency: 92, hoursToday: 5.5 },
        { id: '4', name: 'Lisa M.', status: 'working', currentJob: '#12347', efficiency: 90, hoursToday: 6.0 },
        { id: '5', name: 'Tom R.', status: 'idle', efficiency: 88, hoursToday: 5.0 },
        { id: '6', name: 'Amy K.', status: 'offline', efficiency: 0, hoursToday: 0 },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return <XCircle size={24} weight="fill" className="text-red-600" />;
      case 'warning':
        return <Warning size={24} weight="fill" className="text-orange-500" />;
      case 'info':
        return <Bell size={24} weight="fill" className="text-blue-500" />;
    }
  };

  const getStatusColor = (status: StaffStatus['status']) => {
    switch (status) {
      case 'working':
        return 'bg-green-500';
      case 'break':
        return 'bg-yellow-500';
      case 'idle':
        return 'bg-orange-500';
      case 'offline':
        return 'bg-gray-400';
    }
  };

  const getSeverityColor = (severity: BottleneckInfo['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const workingStaff = staff.filter(s => s.status === 'working').length;
  const totalStaff = staff.filter(s => s.status !== 'offline').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading supervisor dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye size={32} weight="fill" className="text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Supervisor Dashboard</h2>
            <p className="text-muted-foreground">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} •{' '}
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        {activeAlerts.length > 0 && (
          <Badge className="bg-red-600 text-white animate-pulse">
            {activeAlerts.length} Active Alerts
          </Badge>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Users size={16} />
            Active Staff
          </div>
          <div className="text-2xl font-bold text-foreground">
            {workingStaff}/{totalStaff}
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <ChartBar size={16} />
            Team Efficiency
          </div>
          <div className="text-2xl font-bold text-green-600">
            {Math.round(staff.filter(s => s.status === 'working').reduce((acc, s) => acc + s.efficiency, 0) / (workingStaff || 1))}%
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock size={16} />
            Jobs Today
          </div>
          <div className="text-2xl font-bold text-foreground">24</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendUp size={16} />
            On Schedule
          </div>
          <div className="text-2xl font-bold text-foreground">92%</div>
        </Card>
      </div>

      {/* Alerts Section */}
      {activeAlerts.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50/50 dark:bg-red-950/10">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Bell size={20} weight="fill" className="text-red-600" />
            Active Alerts
          </h3>
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 bg-white dark:bg-background rounded-lg border"
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{alert.title}</div>
                  <div className="text-sm text-muted-foreground">{alert.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => acknowledgeAlert(alert.id)}
                >
                  Acknowledge
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Bottleneck Detection */}
      {bottlenecks.length > 0 && (
        <Card className="p-4">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Warning size={20} weight="fill" className="text-orange-500" />
            Bottleneck Detection
          </h3>
          <div className="space-y-3">
            {bottlenecks.map((bottleneck, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">{bottleneck.area}</span>
                  <Badge className={getSeverityColor(bottleneck.severity)}>
                    {bottleneck.severity} severity
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                  <div>
                    <span className="text-muted-foreground">Affected Jobs:</span>{' '}
                    <span className="font-medium text-foreground">{bottleneck.affectedJobs}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wait Time:</span>{' '}
                    <span className="font-medium text-foreground">{bottleneck.waitTime} min</span>
                  </div>
                </div>
                <div className="text-sm text-blue-600 flex items-center gap-1">
                  <CheckCircle size={16} />
                  {bottleneck.recommendation}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Staff Overview */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Users size={20} weight="fill" className="text-primary" />
            Staff Overview
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onNavigate?.('team-metrics')}
          >
            View Details <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
        <div className="space-y-2">
          {staff.filter(s => s.status !== 'offline').map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
            >
              <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{member.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {member.status}
                  </Badge>
                </div>
                {member.currentJob && (
                  <div className="text-xs text-muted-foreground">
                    Working on {member.currentJob}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {member.efficiency}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {member.hoursToday}h today
                </div>
              </div>
              <div className="w-20 hidden sm:block">
                <Progress value={member.efficiency} className="h-2" />
              </div>
            </div>
          ))}
          {staff.filter(s => s.status === 'offline').length > 0 && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              {staff.filter(s => s.status === 'offline').length} staff member(s) offline
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 flex-col"
          onClick={() => onNavigate?.('queue')}
        >
          <Clock size={24} className="mb-2" />
          <span>View Queue</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex-col"
          onClick={() => onNavigate?.('team-metrics')}
        >
          <ChartBar size={24} className="mb-2" />
          <span>Team Metrics</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex-col"
          onClick={() => onNavigate?.('reports')}
        >
          <TrendUp size={24} className="mb-2" />
          <span>Reports</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex-col"
          onClick={() => onNavigate?.('time-clock')}
        >
          <Users size={24} className="mb-2" />
          <span>Time Clock</span>
        </Button>
      </div>
    </div>
  );
}
