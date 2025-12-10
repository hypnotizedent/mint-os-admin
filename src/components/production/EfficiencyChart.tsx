import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface EfficiencyChartProps {
  period: 'today' | 'week' | 'month';
}

export function EfficiencyChart({ period }: EfficiencyChartProps) {
  // Mock data based on period
  const getData = () => {
    if (period === 'today') {
      return [
        { time: '8:00', efficiency: 88 },
        { time: '9:00', efficiency: 90 },
        { time: '10:00', efficiency: 92 },
        { time: '11:00', efficiency: 93 },
        { time: '12:00', efficiency: 91 },
        { time: '1:00', efficiency: 94 },
        { time: '2:00', efficiency: 95 },
        { time: '3:00', efficiency: 94 },
      ];
    } else if (period === 'week') {
      return [
        { time: 'Mon', efficiency: 85 },
        { time: 'Tue', efficiency: 90 },
        { time: 'Wed', efficiency: 92 },
        { time: 'Thu', efficiency: 93 },
        { time: 'Fri', efficiency: 95 },
        { time: 'Sat', efficiency: 96 },
        { time: 'Sun', efficiency: 94 },
      ];
    } else {
      return [
        { time: 'Week 1', efficiency: 88 },
        { time: 'Week 2', efficiency: 90 },
        { time: 'Week 3', efficiency: 92 },
        { time: 'Week 4', efficiency: 94 },
      ];
    }
  };

  const data = getData();

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground">Team Efficiency Trend</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {period === 'today'
            ? 'Hourly efficiency today'
            : period === 'week'
            ? 'Daily efficiency this week'
            : 'Weekly efficiency this month'}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="time"
            className="text-xs fill-muted-foreground"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis
            domain={[70, 100]}
            className="text-xs fill-muted-foreground"
            tick={{ fill: 'currentColor' }}
            label={{ value: 'Efficiency %', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="efficiency"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6 }}
            name="Team Efficiency %"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
