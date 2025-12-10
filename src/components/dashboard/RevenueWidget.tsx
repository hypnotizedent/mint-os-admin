import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CurrencyDollar, ArrowUp, ArrowDown } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer 
} from "recharts"
import { getDashboardStats, type DashboardStatsData } from "@/lib/reports-api"

interface RevenueWidgetProps {
  className?: string
}

export function RevenueWidget({ className }: RevenueWidgetProps) {
  const [data, setData] = useState<DashboardStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const stats = await getDashboardStats()
        setData(stats)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-16 w-24" />
        </div>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className={cn("p-6", className)}>
        <p className="text-muted-foreground text-sm">Unable to load revenue data</p>
      </Card>
    )
  }

  const trend = data.revenueTrend

  return (
    <Card className={cn("p-6 hover:shadow-lg transition-shadow", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-600/10">
              <CurrencyDollar size={20} weight="fill" className="text-green-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Revenue (MTD)</p>
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">
            {formatCurrency(data.revenueThisMonth)}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {trend >= 0 ? (
              <ArrowUp size={16} weight="bold" className="text-green-600" />
            ) : (
              <ArrowDown size={16} weight="bold" className="text-red-600" />
            )}
            <span className={cn(
              "text-sm font-semibold",
              trend >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {Math.abs(trend)}%
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>

        {/* Mini chart - decorative, revenue value is shown in text above */}
        {data.revenueByDay.length > 0 && (
          <div className="w-24 h-16" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueByDay.slice(-14)}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  )
}
