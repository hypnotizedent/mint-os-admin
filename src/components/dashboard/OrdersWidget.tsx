import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, ArrowUp, ArrowDown } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { getDashboardStats, type DashboardStatsData } from "@/lib/reports-api"

interface OrdersWidgetProps {
  className?: string
}

export function OrdersWidget({ className }: OrdersWidgetProps) {
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

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-32" />
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className={cn("p-6", className)}>
        <p className="text-muted-foreground text-sm">Unable to load order data</p>
      </Card>
    )
  }

  const trend = data.ordersTrend

  return (
    <Card className={cn("p-6 hover:shadow-lg transition-shadow", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-600/10">
              <Package size={20} weight="fill" className="text-blue-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Orders</p>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{data.ordersThisWeek}</p>
              <span className="text-sm text-muted-foreground">this week</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-semibold text-muted-foreground">{data.ordersThisMonth}</p>
              <span className="text-sm text-muted-foreground">this month</span>
            </div>
          </div>
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
      </div>
    </Card>
  )
}
