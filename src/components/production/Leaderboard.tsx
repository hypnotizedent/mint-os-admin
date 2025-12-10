import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendUp, Clock } from '@phosphor-icons/react';

interface LeaderboardProps {
  period: 'today' | 'week' | 'month';
}

interface LeaderboardEntry {
  employeeId: string;
  employeeName: string;
  efficiencyRate: number;
  jobsCompleted: number;
  averageJobTime: number;
  hoursWorked: number;
  rank: number;
}

export function Leaderboard({ period }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          employeeId: 'emp-1',
          employeeName: 'Sarah J.',
          efficiencyRate: 98,
          jobsCompleted: 24,
          averageJobTime: 1.5,
          hoursWorked: 38.5,
          rank: 1,
        },
        {
          employeeId: 'emp-2',
          employeeName: 'John S.',
          efficiencyRate: 96,
          jobsCompleted: 22,
          averageJobTime: 1.6,
          hoursWorked: 36.0,
          rank: 2,
        },
        {
          employeeId: 'emp-3',
          employeeName: 'Mike T.',
          efficiencyRate: 94,
          jobsCompleted: 20,
          averageJobTime: 1.8,
          hoursWorked: 35.5,
          rank: 3,
        },
        {
          employeeId: 'emp-4',
          employeeName: 'Lisa M.',
          efficiencyRate: 92,
          jobsCompleted: 18,
          averageJobTime: 2.0,
          hoursWorked: 32.0,
          rank: 4,
        },
        {
          employeeId: 'emp-5',
          employeeName: 'Tom R.',
          efficiencyRate: 90,
          jobsCompleted: 16,
          averageJobTime: 2.1,
          hoursWorked: 30.0,
          rank: 5,
        },
      ];
      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}️⃣`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-800';
      case 2:
        return 'bg-gray-100 dark:bg-gray-950/20 border-gray-300 dark:border-gray-800';
      case 3:
        return 'bg-orange-100 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800';
      default:
        return '';
    }
  };

  // Sort leaderboard by different criteria
  const byJobsCompleted = [...leaderboard].sort((a, b) => b.jobsCompleted - a.jobsCompleted);
  const byFastestTime = [...leaderboard].sort((a, b) => a.averageJobTime - b.averageJobTime);
  const mostImproved = [
    { name: 'Tom R.', improvement: 15, from: 75, to: 90 },
    { name: 'Amy K.', improvement: 8, from: 70, to: 78 },
    { name: 'Lisa M.', improvement: 5, from: 87, to: 92 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy size={32} weight="fill" className="text-yellow-600" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Production Leaderboard</h2>
          <p className="text-muted-foreground">
            This {period === 'today' ? 'Day' : period === 'week' ? 'Week' : 'Month'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="efficiency" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="efficiency">Highest Efficiency</TabsTrigger>
          <TabsTrigger value="jobs">Most Jobs</TabsTrigger>
          <TabsTrigger value="fastest">Fastest Time</TabsTrigger>
          <TabsTrigger value="improved">Most Improved</TabsTrigger>
        </TabsList>

        <TabsContent value="efficiency" className="space-y-3 mt-6">
          {leaderboard.map((entry) => (
            <Card
              key={entry.employeeId}
              className={`p-4 ${getRankColor(entry.rank)}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{getMedalEmoji(entry.rank)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg text-foreground">
                      {entry.employeeName}
                    </span>
                    {entry.rank === 1 && (
                      <Badge className="bg-yellow-600 text-white">Top Performer</Badge>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{entry.jobsCompleted} jobs</span>
                    <span>{entry.hoursWorked} hrs</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {entry.efficiencyRate}%
                  </div>
                  <div className="text-xs text-muted-foreground">Efficiency</div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-3 mt-6">
          {byJobsCompleted.map((entry, index) => (
            <Card
              key={entry.employeeId}
              className={`p-4 ${getRankColor(index + 1)}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{getMedalEmoji(index + 1)}</div>
                <div className="flex-1">
                  <div className="font-bold text-lg text-foreground mb-1">
                    {entry.employeeName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.hoursWorked} hrs worked
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {entry.jobsCompleted}
                  </div>
                  <div className="text-xs text-muted-foreground">Jobs</div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="fastest" className="space-y-3 mt-6">
          {byFastestTime.map((entry, index) => (
            <Card
              key={entry.employeeId}
              className={`p-4 ${getRankColor(index + 1)}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{getMedalEmoji(index + 1)}</div>
                <div className="flex-1">
                  <div className="font-bold text-lg text-foreground mb-1">
                    {entry.employeeName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.jobsCompleted} jobs completed
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-600 flex items-center gap-1">
                    <Clock size={24} weight="fill" />
                    {entry.averageJobTime} hrs
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Time</div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="improved" className="space-y-3 mt-6">
          {mostImproved.map((entry, index) => (
            <Card
              key={entry.name}
              className={`p-4 ${getRankColor(index + 1)}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{getMedalEmoji(index + 1)}</div>
                <div className="flex-1">
                  <div className="font-bold text-lg text-foreground mb-1">{entry.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {entry.from}% → {entry.to}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                    <TrendUp size={24} weight="bold" />
                    +{entry.improvement}%
                  </div>
                  <div className="text-xs text-muted-foreground">Improvement</div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
